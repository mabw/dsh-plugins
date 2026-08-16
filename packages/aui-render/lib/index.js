// dsh-aui-render — Host half (static Cordis plugin)
// Registers two model tools: ui_render (rich cards) and ui_form (prefilled
// confirm form), plus the package-private RPC the form cards call back on.
import { readFile } from "node:fs/promises";
import { defineTool } from "@deepseek-ai/dsh-tools";

const name = "dsh-aui-render";
const inject = ["tools", "connection"];

const RPC_CHANNEL = "/aui-rpc";

// Bundled skill: registered through ctx.skills so it ships with the plugin
// (no per-machine file copying). skills/rich-ui-cards/SKILL.md is the source
// of truth; name/description below must stay in sync with its frontmatter.
const SKILL_PATH = new URL("../skills/rich-ui-cards/SKILL.md", import.meta.url);
const SKILL_NAME = "rich-ui-cards";
const SKILL_DESCRIPTION =
	"Present structured data with ui_render interactive cards (table, 8 chart types, JSON tree) instead of markdown tables or code blocks, and collect user inputs with the prefilled ui_form confirm dialog instead of repeated questions. Use whenever the session has ui_render/ui_form tools available and the response contains comparison, statistics, ranking, distribution, trend, or any list/array data.";

function stripFrontmatter(raw) {
	const lines = raw.split("\n");
	if (lines[0]?.trim() !== "---") return raw.trimStart();
	const end = lines.indexOf("---", 1);
	return end === -1 ? raw.trimStart() : lines.slice(end + 1).join("\n").trimStart();
}

function registerBundledSkill(ctx) {
	const skills = ctx.get("skills");
	if (skills === undefined) {
		console.warn("[dsh-aui-render] skills service unavailable; skipping bundled rich-ui-cards skill (copy skills/rich-ui-cards manually if needed)");
		return;
	}
	readFile(SKILL_PATH, "utf8").then(
		(raw) => {
			ctx.effect(() => skills.register({
				name: SKILL_NAME,
				description: SKILL_DESCRIPTION,
				content: stripFrontmatter(raw),
			}));
		},
		(error) => {
			console.warn("[dsh-aui-render] bundled skill not registered:", error?.message ?? error);
		},
	);
}

// The model-call bridge may stringify untyped arguments; accept either form.
const lenient = (v) => {
	if (typeof v !== "string") return v;
	try { return JSON.parse(v); } catch { return v; }
};

function summarize(args) {
	if (!args) return "已渲染卡片";
	if (args.kind === "table") {
		const rows = lenient(args.rows);
		const rowCount = Array.isArray(rows) ? rows.length : 0;
		const cols = Array.isArray(args.columns) ? args.columns.length : 0;
		return `已向用户渲染表格${args.title ? `「${args.title}」` : ""}：${rowCount} 行 × ${cols} 列（交互式卡片，无需再输出 markdown 表格）`;
	}
	if (args.kind === "chart") {
		const c = args.chart || {};
		const n = Array.isArray(c.labels) ? c.labels.length : 0;
		const s = Array.isArray(c.series) ? c.series.length : 0;
		const extra = c.type === "bar" && c.stacked ? "（堆叠）" : "";
		return `已向用户渲染 ${c.type || "bar"} 图${extra}${args.title ? `「${args.title}」` : ""}：${n} 个类目 × ${s} 个系列`;
	}
	return `已向用户渲染 JSON 树${args.title ? `「${args.title}」` : ""}`;
}

function apply(ctx) {
	registerBundledSkill(ctx);
	const pendingForms = new Map();

	const renderTool = defineTool({
		name: "ui_render",
		description: '向用户展示数据的富视图卡片（表格 / 图表 / JSON 树）。当需要呈现结构化数据、统计结果、对比列表时用它，而不是在回复里输出 markdown 表格或代码块。只传数据，不传代码。kind=table 需要 columns（每项 {key,label}）与 rows（对象数组）；kind=chart 需要 chart={type:"bar"|"line"|"area"|"scatter"|"pie"|"donut"|"progress", labels, series:[{name,values:[number]}]}，其中 bar 可加 stacked:true 变堆叠柱状图，scatter 的 series 用 points:[{x,y}] 代替 values；kind=json 需要 data（任意 JSON，渲染为可折叠树）。',
		parameters: {
			kind: { type: "string", enum: ["table", "chart", "json"], required: true, description: "展示类型" },
			title: { type: "string", description: "卡片标题" },
			description: { type: "string", description: "标题下的一行说明" },
			columns: {
				type: "array",
				description: "table：列定义",
				items: {
					type: "object",
					additionalProperties: true,
					properties: {
						key: { type: "string", required: true, description: "取值字段名" },
						label: { type: "string", description: "表头显示名" },
					},
				},
			},
			rows: {
				type: "array",
				description: "table：行数据（对象数组，键与 columns.key 对应）",
				items: { type: "object", additionalProperties: true, description: "一行数据对象" },
			},
			chart: {
				type: "object",
				additionalProperties: true,
				description: "chart：图表定义",
				properties: {
					type: { type: "string", enum: ["bar", "line", "area", "scatter", "pie", "donut", "progress"] },
					stacked: { type: "boolean", description: "bar 专用：堆叠柱状图" },
					labels: { type: "array", items: { type: "string" } },
					series: {
						type: "array",
						items: {
							type: "object",
							additionalProperties: true,
							properties: {
								name: { type: "string" },
								values: { type: "array", items: { type: "number" } },
								points: {
									type: "array",
									description: "scatter 专用：[{x,y}] 坐标点",
									items: {
										type: "object",
										additionalProperties: true,
										properties: {
											x: { type: "number", required: true },
											y: { type: "number", required: true },
										},
									},
								},
							},
						},
					},
				},
			},
			data: {
				oneOf: [
					{ type: "string" },
					{ type: "number" },
					{ type: "boolean" },
					{ type: "null" },
					{ type: "object", additionalProperties: true },
					{ type: "array", items: { type: "object", additionalProperties: true } },
				],
				description: "json：任意 JSON 数据（对象/数组/标量皆可）",
			},
		},
		output: {
			schema: { type: "json" },
			render: (args, value) => [{ type: "text", text: summarize(args) }],
		},
		execute: async (args) => {
			if (args.kind === "table") {
				if (!Array.isArray(args.columns) || args.columns.length === 0) throw new Error("kind=table 需要 columns（非空数组，每项 {key,label}）");
				const rows = lenient(args.rows);
				if (!Array.isArray(rows)) throw new Error("kind=table 需要 rows（对象数组）");
			} else if (args.kind === "chart") {
				const c = args.chart;
				if (!c || !Array.isArray(c.series) || c.series.length === 0) throw new Error("kind=chart 需要 chart.series（非空数组）");
				for (const s of c.series) {
					if (c.type === "scatter") {
						if (!s || !Array.isArray(s.points)) throw new Error("scatter 的 series 每项必须含 points:[{x,y}]");
					} else if (!s || !Array.isArray(s.values)) {
						throw new Error("chart.series 每项必须含 values 数字数组（scatter 用 points）");
					}
				}
			} else if (args.kind === "json") {
				if (!("data" in args)) throw new Error("kind=json 需要 data 字段");
			} else {
				throw new Error("kind 必须是 table | chart | json");
			}
			return { ok: true, kind: args.kind };
		},
	});

	const formTool = defineTool({
		name: "ui_form",
		description: '向用户展示一个预填好的表单并阻塞等待确认。把你能推断的最佳默认值写进每个字段的 default；用户修改后点「确认」，工具返回 {status:"confirmed",values:{...}}；点「取消」返回 {status:"cancelled"}。用于在发起调用（如执行命令、写文件、请求外部接口）之前一次性收集/确认多个参数，避免用提问工具连环追问。fields 可为空数组，此时等价于纯确认对话框。',
		parameters: {
			title: { type: "string", required: true, description: "表单标题" },
			description: { type: "string", description: "表单上方的说明文字（解释将用它确认后的值做什么）" },
			confirmLabel: { type: "string", description: "确认按钮文字，默认「确认」" },
			cancelLabel: { type: "string", description: "取消按钮文字，默认「取消」" },
			fields: {
				type: "array",
				required: true,
				description: "字段定义；空数组 = 纯确认对话框",
				items: {
					type: "object",
					additionalProperties: true,
					properties: {
						name: { type: "string", required: true, description: "字段名（返回值 values 的键）" },
						label: { type: "string", description: "显示标签" },
						type: { type: "string", enum: ["text", "number", "select", "boolean", "multiline"], description: "控件类型，默认 text" },
						default: {
							oneOf: [{ type: "string" }, { type: "number" }, { type: "boolean" }, { type: "null" }],
							description: "预填默认值（尽量给出最佳推断，让用户只需确认）",
						},
						options: {
							type: "array",
							description: "select 的选项列表",
							items: {
								type: "object",
								additionalProperties: true,
								properties: {
									value: { oneOf: [{ type: "string" }, { type: "number" }], required: true },
									label: { type: "string" },
								},
							},
						},
						required: { type: "boolean", description: "是否必填" },
						placeholder: { type: "string" },
						help: { type: "string", description: "字段下方提示" },
					},
				},
			},
		},
		output: {
			schema: { type: "json" },
			render: (args, value) => {
				let text;
				try { text = value === undefined || value === null ? "null" : JSON.stringify(value); } catch { text = "null"; }
				return [{ type: "text", text }];
			},
		},
		execute: (args, exec) => new Promise((resolve, reject) => {
			const entry = { settled: false };
			entry.settle = (v) => {
				if (entry.settled) return;
				entry.settled = true;
				pendingForms.delete(exec.callId);
				resolve(v);
			};
			entry.fail = (e) => {
				if (entry.settled) return;
				entry.settled = true;
				pendingForms.delete(exec.callId);
				reject(e);
			};
			pendingForms.set(exec.callId, entry);
			// Bound concurrent pending forms; oldest expires first.
			while (pendingForms.size > 32) {
				const oldestKey = pendingForms.keys().next().value;
				const oldest = pendingForms.get(oldestKey);
				pendingForms.delete(oldestKey);
				if (oldest && !oldest.settled) oldest.fail(new Error("表单已过期（并发表单超过上限）"));
			}
			const onAbort = () => entry.fail(new Error("表单已取消：会话回合被中断"));
			if (exec.signal.aborted) onAbort();
			else exec.signal.addEventListener("abort", onAbort);
		}),
	});

	ctx.effect(() => ctx.tools.register(renderTool));
	ctx.effect(() => ctx.tools.register(formTool));

	ctx.effect(() => ctx.connection.rpc.handle(RPC_CHANNEL, async (endpoint, payload) => {
		if (endpoint !== "form-submit") return { ok: false, error: `unknown endpoint: ${String(endpoint)}` };
		const req = payload || {};
		const entry = pendingForms.get(req.callId);
		if (!entry) return { ok: false, error: "表单不存在或已结束" };
		if (req.action === "confirm") entry.settle({ status: "confirmed", values: req.values || {} });
		else if (req.action === "cancel") entry.settle({ status: "cancelled" });
		else return { ok: false, error: "action 必须是 confirm 或 cancel" };
		return { ok: true };
	}, { authority: "trusted-host" }));

	ctx.effect(() => () => {
		for (const entry of pendingForms.values()) entry.fail(new Error("插件已停止，表单作废"));
		pendingForms.clear();
	});
}

export { name, inject, apply };
