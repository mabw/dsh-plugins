// dsh-tasknav — Client half (web platform, module-loader format)
// Collapsible task-tree dock above the composer: status badges, decision
// markers, click-to-focus, CLI records, detail panel.
window.__ModuleLoader__.load({ id: "dsh-tasknav", factory: (require) => {
var module = { exports: {} }; var exports = module.exports;
var react = require("react");
var h = react.createElement;

var activeCtx = null;

var CSS = `
.tn-dock{border:1px solid var(--dsw-alias-border-l1);background:var(--dsw-alias-bg-layer-1);border-radius:10px;padding:8px 10px;font-size:12px;color:var(--dsw-alias-label-primary)}
.tn-dock[data-collapsed]{padding:4px 10px}
.tn-body{max-height:280px;overflow-y:auto}
.tn-head{display:flex;align-items:center;gap:8px}
.tn-title{font-weight:600;font-size:12px}
.tn-spacer{flex:1}
.tn-link{background:none;border:none;color:var(--dsw-alias-label-secondary);font-size:11px;cursor:pointer;padding:2px 6px;border-radius:4px}
.tn-link:hover{color:var(--dsw-alias-label-primary)}
.tn-chip{display:inline-flex;align-items:center;gap:4px;height:20px;padding:0 8px;border-radius:10px;border:1px solid var(--dsw-alias-border-l2);background:transparent;color:var(--dsw-alias-label-secondary);font-size:11px;cursor:pointer;max-width:200px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.tn-chip:hover{background:var(--dsw-alias-bg-layer-2)}
.tn-chip[data-focus]{border-color:var(--dsw-alias-brand-primary);color:var(--dsw-alias-brand-primary)}
.tn-node{display:flex;align-items:center;gap:6px;padding:3px 4px;border-radius:6px;cursor:pointer}
.tn-node:hover{background:var(--dsw-alias-bg-layer-2)}
.tn-node[data-focus]{background:var(--dsw-alias-bg-layer-2);outline:1px solid var(--dsw-alias-brand-primary)}
.tn-tw{width:14px;text-align:center;color:var(--dsw-alias-label-secondary);cursor:pointer;user-select:none;flex:none}
.tn-ico{flex:none;width:16px;text-align:center}
.tn-name{flex:1;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.tn-name[data-done]{text-decoration:line-through;color:var(--dsw-alias-label-secondary)}
.tn-st{flex:none;font-size:10px;padding:1px 6px;border-radius:8px;border:1px solid}
.tn-st-pending{color:var(--dsw-alias-label-secondary);border-color:var(--dsw-alias-border-l2)}
.tn-st-active{color:var(--dsw-alias-brand-primary);border-color:var(--dsw-alias-brand-primary)}
.tn-st-running{color:var(--dsw-alias-state-warn-primary);border-color:var(--dsw-alias-state-warn-primary)}
.tn-st-done{color:var(--dsw-alias-state-success-primary);border-color:var(--dsw-alias-state-success-primary)}
.tn-st-blocked{color:var(--dsw-alias-state-error-primary);border-color:var(--dsw-alias-state-error-primary)}
.tn-dec{flex:none;font-size:10px;padding:1px 5px;border-radius:8px;background:var(--dsw-alias-state-success-primary);color:#fff}
.tn-pend{flex:none;font-size:10px;padding:1px 5px;border-radius:8px;border:1px dashed var(--dsw-alias-state-warn-primary);color:var(--dsw-alias-state-warn-primary)}
.tn-kids{margin-left:18px;border-left:1px dotted var(--dsw-alias-border-l2);padding-left:4px}
.tn-detail{margin-top:8px;padding:8px;border-radius:8px;background:var(--dsw-alias-bg-layer-2);font-size:11.5px;line-height:1.6}
.tn-detail-t{font-weight:600;margin-bottom:4px}
.tn-kv{display:flex;gap:6px}
.tn-kv b{flex:none;color:var(--dsw-alias-label-secondary);font-weight:500}
.tn-cli{margin-top:4px;font-family:var(--ds-font-family-code,ui-monospace,monospace);font-size:11px;color:var(--dsw-alias-label-secondary);word-break:break-all}
.tn-empty{color:var(--dsw-alias-label-secondary);padding:4px 0;font-size:11.5px}
.tn-toggle{flex:none;background:none;border:none;color:var(--dsw-alias-label-secondary);cursor:pointer;font-size:11px;padding:2px 6px;border-radius:4px}
.tn-toggle:hover{color:var(--dsw-alias-label-primary);background:var(--dsw-alias-bg-layer-2)}
`;

var STATUS_META = {
	pending: { icon: "○", cls: "tn-st-pending", label: "待处理" },
	active: { icon: "◆", cls: "tn-st-active", label: "进行中" },
	running: { icon: "⟳", cls: "tn-st-running", label: "执行中" },
	done: { icon: "✓", cls: "tn-st-done", label: "已完成" },
	blocked: { icon: "✗", cls: "tn-st-blocked", label: "受阻" },
};

function TaskNode(props) {
	var node = props.node;
	var focused = props.focusId === node.id;
	var openState = react.useState(props.depth < 1);
	var open = openState[0], setOpen = openState[1];
	var kids = Array.isArray(node.children) ? node.children : [];
	var st = STATUS_META[node.status] || STATUS_META.pending;
	var decisions = Array.isArray(node.decisions) ? node.decisions : [];
	var pendingQ = Array.isArray(node.pendingQuestions) ? node.pendingQuestions : [];

	return h("div", null,
		h("div", {
			className: "tn-node", "data-focus": focused || undefined,
			onClick: function () { props.setFocus(node.id); },
			title: node.note || node.title,
		},
			kids.length > 0 ? h("span", { className: "tn-tw", onClick: function (e) { e.stopPropagation(); setOpen(!open); } }, open ? "▾" : "▸") : h("span", { className: "tn-tw" }),
			h("span", { className: "tn-ico" }, st.icon),
			h("span", { className: "tn-name", "data-done": node.status === "done" || undefined }, node.title || node.id),
			pendingQ.length > 0 ? h("span", { className: "tn-pend", title: pendingQ.join("\n") }, "待决策 " + pendingQ.length) : null,
			decisions.length > 0 ? h("span", { className: "tn-dec", title: decisions.map(function (d) { return (d.at || "") + " " + (d.text || ""); }).join("\n") }, "已决策 " + decisions.length) : null,
			h("span", { className: "tn-st " + st.cls }, st.label)
		),
		open && kids.length > 0 ? h("div", { className: "tn-kids" },
			kids.map(function (k) { return h(TaskNode, { key: k.id, node: k, depth: props.depth + 1, focusId: props.focusId, setFocus: props.setFocus }); })
		) : null
	);
}

function findFocusedNode(n, focus) {
	if (!n) return null;
	if (n.id === focus) return n;
	var kids = Array.isArray(n.children) ? n.children : [];
	for (var i = 0; i < kids.length; i++) { var r = findFocusedNode(kids[i], focus); if (r) return r; }
	return null;
}

function TaskNav(props) {
	var errState = react.useState("");
	var err = errState[0], setErr = errState[1];
	var loadState = react.useState(null);
	var load = loadState[0], setLoad = loadState[1];
	var focusState = react.useState(null);
	var localFocus = focusState[0], setLocalFocus = focusState[1];
	var tickState = react.useState(0);
	var tick = tickState[0], bump = tickState[1];
	var openState = react.useState(true);
	var open = openState[0], setOpen = openState[1];

	react.useEffect(function () {
		var alive = true;
		var conn = activeCtx && activeCtx.connection;
		if (!conn) return function () { alive = false; };
		conn.rpc.call("/tasknav", "get", {}).then(function (res) {
			if (!alive) return;
			if (res && res.ok) { setLoad(res.tree); setErr(""); } else setErr((res && res.error) || "读取失败");
		}, function (e) { if (alive) setErr((e && e.message) || String(e)); });
		return function () { alive = false; };
	});

	var focus = localFocus !== null ? localFocus : (load && load.focusId) || null;
	function setFocus(id) {
		setLocalFocus(id);
		var conn = activeCtx && activeCtx.connection;
		if (!conn) return;
		conn.rpc.call("/tasknav-focus", "set", { taskId: id }).then(function (res) {
			if (res && res.ok) { setLoad(res.tree); } else { setErr((res && res.error) || "聚焦失败"); }
		}, function (e) { setErr((e && e.message) || String(e)); });
	}

	var root = load && load.root;
	var count = (load && load.count) || 0;
	var focused = root ? findFocusedNode(root, focus) : null;

	var header = h("div", { className: "tn-head" },
		h("button", { className: "tn-toggle", onClick: function () { setOpen(!open); }, title: open ? "折叠任务导航" : "展开任务导航" }, open ? "▾" : "▸"),
		h("span", { className: "tn-title" }, "任务导航"),
		h("span", { style: { fontSize: "11px", color: "var(--dsw-alias-label-secondary)" } }, count + " 个任务"),
		h("span", { className: "tn-spacer" }),
		focus ? h("button", { className: "tn-chip", "data-focus": true, title: "点击取消聚焦", onClick: function () { setFocus(null); } }, "聚焦: " + ((focused && focused.title) || focus).slice(0, 14)) : null,
		h("button", { className: "tn-link", onClick: function () { bump(tick + 1); } }, "刷新")
	);

	if (!open) return h("div", { className: "tn-dock", "data-collapsed": true }, header);

	return h("div", { className: "tn-dock" },
		header,
		h("div", { className: "tn-body" },
			root ? h(TaskNode, { node: root, depth: 0, focusId: focus, setFocus: setFocus }) : h("div", { className: "tn-empty" }, err ? ("tasknav: " + err) : (load ? "暂无任务树——用 task_tree 工具创建" : "任务导航加载中…")),
			focused ? h("div", { className: "tn-detail" },
				h("div", { className: "tn-detail-t" }, "▸ " + (focused.title || focused.id)),
				focused.note ? h("div", null, focused.note) : null,
				focused.cliCommand ? h("div", { className: "tn-cli" }, "$ " + focused.cliCommand, focused.cliResult ? h("div", { style: { opacity: 0.75 } }, "→ " + String(focused.cliResult).slice(0, 200)) : null) : null,
				(Array.isArray(focused.decisions) && focused.decisions.length > 0) ? h("div", { style: { marginTop: "4px" } },
					h("b", null, "决策记录:"),
					focused.decisions.map(function (d, i) { return h("div", { key: i, className: "tn-kv" }, h("b", null, (d.at || "").slice(5, 16)), h("span", null, d.text || "")); })
				) : null,
				(Array.isArray(focused.pendingQuestions) && focused.pendingQuestions.length > 0) ? h("div", { style: { marginTop: "4px" } },
					h("b", { style: { color: "var(--dsw-alias-state-warn-primary)" } }, "待决策:"),
					focused.pendingQuestions.map(function (q, i) { return h("div", { key: i }, "· " + q); })
				) : null
			) : null
		)
	);
}

function apply(ctx) {
	activeCtx = ctx;
	ctx.slots.inject("conversation.input.dock", function () {
		return ctx.slots.register({ name: "conversation.input.dock", id: "tasknav", order: 5 }, function (props) { return h(TaskNav, props); });
	});
	ctx.effect(function () {
		return function () { activeCtx = null; };
	});
}

exports.apply = apply;
exports.inject = ["connection", "slots"];
exports.name = "dsh-tasknav";
return module.exports;
} });
