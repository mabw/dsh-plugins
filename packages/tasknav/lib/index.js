// dsh-tasknav — Host half (static Cordis plugin)
// Task tree navigation + decision memory for operational workflows:
// task_tree tool, /tasknav RPC for the dock UI, per-step agent/pre-step
// injection of the focused task's decision chain, and file persistence
// (.tasknav/ JSON + Markdown) so trees survive restarts and compaction.
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { join, resolve } from "node:path";
import { defineTool } from "@deepseek-ai/dsh-tools";

const name = "dsh-tasknav";
const inject = ["connection", "tools"];

// Single global tree: one operational workflow mainline, shared across sessions.
let ROOT = null;
let FOCUS = null;
let loaded = false;

function storeDir() {
	return resolve(process.env.TASKNAV_HOME ?? ".tasknav");
}

async function ensureLoaded() {
	if (loaded) return;
	loaded = true;
	try {
		const raw = await readFile(join(storeDir(), "tree.json"), "utf8");
		const parsed = JSON.parse(raw);
		if (parsed && typeof parsed === "object") {
			ROOT = parsed.root ?? null;
			FOCUS = parsed.focusId ?? null;
		}
	} catch {
		/* first run: no file yet */
	}
}

async function persist() {
	const dir = storeDir();
	const json = { root: ROOT, focusId: FOCUS, savedAt: new Date().toISOString() };
	let md = "# 任务导航\n\n聚焦：" + (FOCUS ?? "（无）") + "\n\n" + summarizeTree(ROOT, 0) + "\n\n## 决策详情\n";
	const walk = (n) => {
		if (!n) return;
		if (Array.isArray(n.decisions) && n.decisions.length > 0) {
			md += "\n### " + (n.title || n.id) + "\n";
			for (const d of n.decisions) md += "- [" + (d.at || "") + "] " + (d.text || "") + "\n";
		}
		(Array.isArray(n.children) ? n.children : []).forEach(walk);
	};
	walk(ROOT);
	await mkdir(dir, { recursive: true });
	await writeFile(join(dir, "tree.json"), JSON.stringify(json, null, 2), "utf8");
	await writeFile(join(dir, "tree.md"), md, "utf8");
}

const clone = (t) => (t === undefined || t === null ? t : JSON.parse(JSON.stringify(t)));

function findNode(n, id) {
	if (!n) return null;
	if (n.id === id) return n;
	for (const k of Array.isArray(n.children) ? n.children : []) {
		const r = findNode(k, id);
		if (r) return r;
	}
	return null;
}

function countNodes(n) {
	if (!n) return 0;
	let c = 1;
	for (const k of Array.isArray(n.children) ? n.children : []) c += countNodes(k);
	return c;
}

function summarizeTree(n, depth) {
	if (!n) return "";
	let line = "  ".repeat(depth) + "- [" + (n.status || "pending") + "] " + (n.title || n.id);
	if (Array.isArray(n.decisions) && n.decisions.length > 0) line += "（已决策" + n.decisions.length + "）";
	if (Array.isArray(n.pendingQuestions) && n.pendingQuestions.length > 0) line += "（待决策：" + n.pendingQuestions.join("；") + "）";
	if (n.cliCommand) line += " cli=" + n.cliCommand;
	const kidLines = (Array.isArray(n.children) ? n.children : []).map((k) => summarizeTree(k, depth + 1));
	return [line, ...kidLines].join("\n");
}

function detailOf(n) {
	if (!n) return "";
	const parts = [];
	parts.push("任务「" + (n.title || n.id) + "」 状态=" + (n.status || "pending"));
	if (n.note) parts.push("说明：" + n.note);
	if (Array.isArray(n.decisions) && n.decisions.length > 0) {
		parts.push("已定决策（不可重新讨论，除非用户明确推翻）：");
		for (const d of n.decisions) parts.push("  - [" + (d.at || "") + "] " + (d.text || ""));
	}
	if (Array.isArray(n.pendingQuestions) && n.pendingQuestions.length > 0) {
		parts.push("待决策问题（与用户确认后写入 decisions）：");
		for (const q of n.pendingQuestions) parts.push("  - " + q);
	}
	if (n.cliCommand) parts.push("CLI：" + n.cliCommand + (n.cliResult ? " → " + String(n.cliResult).slice(0, 300) : ""));
	return parts.join("\n");
}

function apply(ctx) {
	const taskTool = defineTool({
		name: "task_tree",
		description: "管理任务导航树（运营工作流等）。动作：create=建根任务；add=加子任务(parentId)；update=改状态/note/cli；decide=记录用户决策(taskId,text，已决策内容后续不可重议)；pend=登记待决策问题(taskId,text)；remove=删任务；tree=查看整树。状态：pending/active/running/done/blocked。每次用户决策后必须立即 decide 落档。树持久化于 .tasknav/，重启不丢。",
		parameters: {
			action: { type: "string", enum: ["create", "add", "update", "decide", "pend", "remove", "tree"], required: true, description: "操作" },
			taskId: { type: "string", description: "目标任务 id" },
			parentId: { type: "string", description: "add 时的父任务 id" },
			title: { type: "string", description: "任务标题" },
			note: { type: "string", description: "任务说明/进展备注" },
			status: { type: "string", enum: ["pending", "active", "running", "done", "blocked"], description: "状态" },
			cliCommand: { type: "string", description: "该任务对应的 CLI 命令" },
			cliResult: { type: "string", description: "CLI 结果摘要" },
			text: { type: "string", description: "decide/pend 的内容" },
		},
		output: {
			schema: { type: "json" },
			render: (args, value) => [{ type: "text", text: JSON.stringify(value ?? null) }],
		},
		execute: async (args) => {
			await ensureLoaded();
			const act = args.action;
			if (act === "create") {
				if (!args.title) throw new Error("create 需要 title");
				if (ROOT) throw new Error(`根任务已存在：${ROOT.id}（用 add 加子任务）`);
				ROOT = { id: args.taskId || "root", title: args.title, status: "active", note: args.note || "", decisions: [], pendingQuestions: [], children: [] };
				FOCUS = ROOT.id;
				await persist();
				return { ok: true, rootId: ROOT.id, count: countNodes(ROOT) };
			}
			if (!ROOT) throw new Error("任务树不存在，先 create");
			if (act === "tree") {
				return { ok: true, focusId: FOCUS, count: countNodes(ROOT), text: summarizeTree(ROOT, 0) };
			}
			if (act === "add") {
				if (!args.title) throw new Error("add 需要 title");
				const parent = findNode(ROOT, args.parentId || ROOT.id);
				if (!parent) throw new Error(`父任务不存在：${args.parentId}`);
				if (!Array.isArray(parent.children)) parent.children = [];
				const id = args.taskId || `${parent.id}-${parent.children.length + 1}`;
				if (findNode(ROOT, id)) throw new Error(`id 已存在：${id}`);
				parent.children.push({ id, title: args.title, status: args.status || "pending", note: args.note || "", cliCommand: args.cliCommand || "", cliResult: args.cliResult || "", decisions: [], pendingQuestions: [], children: [] });
				await persist();
				return { ok: true, id, parent: parent.id, count: countNodes(ROOT) };
			}
			const node = findNode(ROOT, args.taskId);
			if (!node) throw new Error(`任务不存在：${args.taskId}`);
			if (act === "update") {
				if (args.title !== undefined) node.title = args.title;
				if (args.status !== undefined) node.status = args.status;
				if (args.note !== undefined) node.note = args.note;
				if (args.cliCommand !== undefined) node.cliCommand = args.cliCommand;
				if (args.cliResult !== undefined) node.cliResult = args.cliResult;
				await persist();
				return { ok: true, id: node.id, status: node.status };
			}
			if (act === "decide") {
				if (!args.text) throw new Error("decide 需要 text（用户决策内容）");
				if (!Array.isArray(node.decisions)) node.decisions = [];
				node.decisions.push({ at: new Date().toISOString(), text: args.text });
				if (Array.isArray(node.pendingQuestions)) node.pendingQuestions = node.pendingQuestions.filter((q) => q !== args.text);
				await persist();
				return { ok: true, id: node.id, decisions: node.decisions.length };
			}
			if (act === "pend") {
				if (!args.text) throw new Error("pend 需要 text");
				if (!Array.isArray(node.pendingQuestions)) node.pendingQuestions = [];
				node.pendingQuestions.push(args.text);
				await persist();
				return { ok: true, id: node.id, pending: node.pendingQuestions.length };
			}
			if (act === "remove") {
				const removeFrom = (n, id) => {
					if (!n || !Array.isArray(n.children)) return false;
					const i = n.children.findIndex((c) => c.id === id);
					if (i !== -1) { n.children.splice(i, 1); return true; }
					return n.children.some((c) => removeFrom(c, id));
				};
				if (ROOT.id === node.id) { ROOT = null; FOCUS = null; }
				else if (!removeFrom(ROOT, node.id)) throw new Error("删除失败");
				if (FOCUS === node.id) FOCUS = null;
				await persist();
				return { ok: true };
			}
			throw new Error(`未知 action: ${act}`);
		},
	});

	ctx.effect(() => ctx.tools.register(taskTool));

	ctx.effect(() => ctx.connection.rpc.handle("/tasknav", async (endpoint) => {
		if (endpoint === "get") {
			await ensureLoaded();
			return { ok: true, tree: { root: clone(ROOT), focusId: FOCUS, count: countNodes(ROOT) } };
		}
		if (endpoint === "focus") return { ok: false, error: `use POST payload endpoint; got ${String(endpoint)}` };
		return { ok: false, error: `unknown endpoint: ${String(endpoint)}` };
	}));

	ctx.effect(() => ctx.connection.rpc.handle("/tasknav-focus", async (endpoint, payload) => {
		if (endpoint !== "set") return { ok: false, error: `unknown endpoint: ${String(endpoint)}` };
		await ensureLoaded();
		const req = payload || {};
		if (req.taskId === null || req.taskId === undefined) {
			FOCUS = null;
			await persist();
			return { ok: true, tree: { root: clone(ROOT), focusId: null, count: countNodes(ROOT) } };
		}
		if (!findNode(ROOT, req.taskId)) return { ok: false, error: `任务不存在：${req.taskId}` };
		FOCUS = req.taskId;
		await persist();
		return { ok: true, tree: { root: clone(ROOT), focusId: FOCUS, count: countNodes(ROOT) } };
	}));

	// Anti-forgetting injection: focused task's decision chain enters every step.
	ctx.on("agent/pre-step", (payload, next) => {
		if (!ROOT || !FOCUS) return next();
		const focused = findNode(ROOT, FOCUS);
		if (!focused) return next();
		const brief = [
			`[tasknav 焦点] ${detailOf(focused)}`,
			`[tasknav 全树]\n${summarizeTree(ROOT, 0)}`,
			"当前对话围绕焦点任务展开；已列出的决策不可重新发起讨论，除非用户明确要求推翻。",
		].join("\n\n");
		const injection = { role: "user", content: [{ type: "text", text: brief }] };
		return Promise.resolve(next()).then((decision) => {
			if (decision && decision.kind === "enter" && Array.isArray(decision.messages)) {
				return { kind: "enter", messages: [...decision.messages, injection] };
			}
			return decision;
		});
	});
}

export { name, inject, apply };
