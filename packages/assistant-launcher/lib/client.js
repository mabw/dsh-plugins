// dsh-assistant-launcher — Client half (web platform, module-loader format)
// Composer overflow menu: one button, grouped searchable list of assistants,
// pick spawns a continuable subagent and jumps into its session.
window.__ModuleLoader__.load({ id: "dsh-assistant-launcher", factory: (require) => {
var module = { exports: {} }; var exports = module.exports;
var react = require("react");
var h = react.createElement;

var RPC_CHANNEL = "/assistant-launcher";
var activeSessions = null;

var CSS = `
.asst-wrap{position:relative;display:inline-flex}
.asst-btn{display:inline-flex;align-items:center;gap:5px;height:26px;padding:0 10px;border-radius:13px;border:1px solid var(--dsw-alias-border-l2);background:transparent;color:var(--dsw-alias-label-secondary);font-size:12px;cursor:pointer}
.asst-btn:hover:not(:disabled){background:var(--dsw-alias-bg-layer-2);color:var(--dsw-alias-label-primary)}
.asst-btn:disabled{opacity:.5;cursor:default}
.asst-ico{font-size:12px;line-height:1}
.asst-badge{min-width:16px;height:16px;padding:0 4px;border-radius:8px;background:var(--dsw-alias-brand-primary);color:#fff;font-size:10px;line-height:16px;text-align:center;font-variant-numeric:tabular-nums}
.asst-menu{position:absolute;bottom:calc(100% + 8px);left:0;z-index:120;min-width:260px;max-width:320px;max-height:min(420px,60vh);overflow-y:auto;background:var(--dsw-alias-bg-overlay);border:1px solid var(--dsw-alias-border-l2);border-radius:12px;box-shadow:var(--dsw-shadow-lv3, 0 8px 24px rgba(0,0,0,.18));padding:6px}
.asst-search{display:block;width:100%;box-sizing:border-box;margin:2px 0 6px;padding:6px 8px;border-radius:8px;border:1px solid var(--dsw-alias-border-l2);background:var(--dsw-alias-bg-layer-2);color:var(--dsw-alias-label-primary);font:inherit;font-size:12px;outline:none}
.asst-search:focus{border-color:var(--dsw-alias-brand-primary)}
.asst-group{margin:4px 2px 2px;font-size:10px;letter-spacing:.5px;text-transform:uppercase;color:var(--dsw-alias-label-tertiary,var(--dsw-alias-label-secondary))}
.asst-item{display:flex;align-items:center;gap:8px;width:100%;box-sizing:border-box;padding:7px 8px;border:none;border-radius:8px;background:transparent;color:var(--dsw-alias-label-primary);font-size:12.5px;cursor:pointer;text-align:left}
.asst-item:hover:not(:disabled){background:var(--dsw-alias-bg-layer-2)}
.asst-item:disabled{opacity:.5;cursor:default}
.asst-item-ico{flex:none;width:18px;text-align:center}
.asst-item-name{flex:1;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.asst-item-hint{flex:none;font-size:10px;color:var(--dsw-alias-label-secondary)}
.asst-empty{padding:10px 8px;font-size:12px;color:var(--dsw-alias-label-secondary)}
`;

var GROUPS = [
	{
		group: "工程与运维",
		items: [
			{ id: "ops", icon: "🛠", label: "运维助手", hint: "巡检/排查/日志/告警" },
			{ id: "audit", icon: "🛡", label: "代码审计员", hint: "缺陷/安全/坏味道" },
			{ id: "devops", icon: "⚙️", label: "DevOps 工程师", hint: "CI/CD/容器/发布" },
			{ id: "db", icon: "🗄", label: "数据库管理员", hint: "SQL 优化/备份/迁移" },
			{ id: "net", icon: "🌐", label: "网络诊断师", hint: "连通性/DNS/抓包" },
		],
	},
	{
		group: "研究与信息",
		items: [
			{ id: "research", icon: "🔍", label: "研究员", hint: "检索/交叉验证/综述" },
			{ id: "data", icon: "📊", label: "数据分析师", hint: "清洗/统计/可视化" },
			{ id: "techwrite", icon: "📝", label: "技术作家", hint: "文档/API 手册/教程" },
		],
	},
	{
		group: "创意与规划",
		items: [
			{ id: "pm", icon: "📋", label: "项目经理", hint: "拆解/排期/风险跟踪" },
			{ id: "architect", icon: "🏗", label: "架构师", hint: "方案设计/权衡/演进" },
			{ id: "product", icon: "🎯", label: "产品参谋", hint: "需求分析/用户视角" },
		],
	},
];

function Launcher(props) {
	var openState = react.useState(false);
	var open = openState[0], setOpen = openState[1];
	var qState = react.useState("");
	var q = qState[0], setQ = qState[1];
	var busyState = react.useState("");
	var busy = busyState[0], setBusy = busyState[1];
	var errState = react.useState("");
	var err = errState[0], setErr = errState[1];
	var wrapRef = react.useRef ? react.useRef(null) : { current: null };
	var session = props.session;
	var sessionId = props.sessionId || (session && (session.sessionId || session.id));

	react.useEffect(function () {
		if (!open) return;
		function onDown(e) {
			if (wrapRef.current && e.target && wrapRef.current.contains(e.target)) return;
			setOpen(false);
		}
		function onKey(e) { if (e.key === "Escape") setOpen(false); }
		document.addEventListener("mousedown", onDown);
		document.addEventListener("keydown", onKey);
		return function () {
			document.removeEventListener("mousedown", onDown);
			document.removeEventListener("keydown", onKey);
		};
	}, [open]);

	function spawn(item) {
		if (busy || !sessionId) return;
		setBusy(item.id);
		setErr("");
		var conn = activeCtx && activeCtx.connection;
		if (!conn) { setBusy(""); setErr("插件未就绪"); return; }
		conn.rpc.call(RPC_CHANNEL, "spawn", { sessionId: sessionId, assistant: item.id }).then(
			function (res) {
				setBusy("");
				setOpen(false);
				if (res && res.ok) {
					if (activeSessions) activeSessions.openSubagent({ parentSessionId: sessionId, childSessionId: res.childId, mode: "continuable" });
				} else {
					setErr((res && res.error) || "创建失败");
				}
			},
			function (e) { setBusy(""); setErr((e && e.message) || String(e)); }
		);
	}

	var query = (q || "").trim().toLowerCase();
	var groups = query
		? GROUPS.map(function (g) { return { group: g.group, items: g.items.filter(function (it) { return (it.label + " " + it.hint + " " + it.id).toLowerCase().indexOf(query) !== -1; }) }; }).filter(function (g) { return g.items.length > 0; })
		: GROUPS;
	var total = GROUPS.reduce(function (n, g) { return n + g.items.length; }, 0);

	return h("div", { className: "asst-wrap", ref: wrapRef },
		h("button", {
			className: "asst-btn",
			disabled: !sessionId || busy !== "",
			title: "创建快捷助手子代理（独立身份/工具/上下文，可续聊）",
			onClick: function () { setOpen(!open); setQ(""); },
		},
			h("span", { className: "asst-ico" }, busy !== "" ? "…" : "✦"),
			"助手",
			h("span", { className: "asst-badge" }, String(total))
		),
		err ? h("span", { style: { fontSize: "11px", color: "var(--dsw-alias-state-error-primary)", marginLeft: "6px" }, title: err }, "⚠") : null,
		open ? h("div", { className: "asst-menu" },
			h("input", {
				className: "asst-search", type: "text", value: q, autoFocus: true,
				placeholder: "搜索 " + total + " 个助手…",
				onChange: function (e) { setQ(e.target.value); },
			}),
			groups.length === 0 ? h("div", { className: "asst-empty" }, "没有匹配的助手") : groups.map(function (g) {
				return h("div", { key: g.group },
					h("div", { className: "asst-group" }, g.group),
					g.items.map(function (it) {
						return h("button", {
							key: it.id, className: "asst-item",
							disabled: busy !== "",
							title: it.hint,
							onClick: function () { spawn(it); },
						},
							h("span", { className: "asst-item-ico" }, busy === it.id ? "…" : it.icon),
							h("span", { className: "asst-item-name" }, it.label),
							h("span", { className: "asst-item-hint" }, it.hint)
						);
					})
				);
			})
		) : null
	);
}

var activeCtx = null;

function apply(ctx) {
	activeCtx = ctx;
	activeSessions = ctx.sessions;
	ctx.slots.inject("conversation.input.left", function () {
		return ctx.slots.register({ name: "conversation.input.left", id: "asst-launcher", order: 20 }, function (props) { return h(Launcher, props); });
	});
	ctx.effect(function () {
		return function () {
			activeCtx = null;
			activeSessions = null;
		};
	});
}

exports.apply = apply;
exports.inject = ["connection", "sessions", "slots"];
exports.name = "dsh-assistant-launcher";
return module.exports;
} });
