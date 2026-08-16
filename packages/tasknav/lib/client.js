// dsh-tasknav — Client half (web platform, module-loader format)
// Collapsible per-session task-tree dock: status badges, decision markers,
// click-to-focus, CLI records, detail panel, 3s polling via timer mixin,
// hidden entirely when the session has no tree.
window.__ModuleLoader__.load({ id: "dsh-tasknav", factory: (require) => {
var module = { exports: {} }; var exports = module.exports;
var react = require("react");
var h = react.createElement;

var activeCtx = null;
var POLL_MS = 3000;

var CSS = `
.tn-dock{border:1px solid var(--dsw-alias-border-l1);background:var(--dsw-alias-bg-layer-1);border-radius:12px;padding:10px 12px;font-size:12px;color:var(--dsw-alias-label-primary);box-shadow:0 1px 3px rgba(0,0,0,.06);transition:box-shadow .15s ease;width:100%;max-width:var(--dsh-composer-card-max-width,760px);margin:0 auto 6px;box-sizing:border-box}
.tn-dock:hover{box-shadow:0 2px 8px rgba(0,0,0,.09)}
.tn-dock[data-collapsed]{padding:5px 10px;border-radius:10px}
.tn-body{max-height:300px;overflow-y:auto;scrollbar-width:thin;scrollbar-color:var(--dsw-alias-border-l2) transparent}
.tn-body::-webkit-scrollbar{width:4px}
.tn-body::-webkit-scrollbar-thumb{background:var(--dsw-alias-border-l2);border-radius:2px}
.tn-head{display:flex;align-items:center;gap:8px;margin-bottom:4px}
.tn-title{font-weight:600;font-size:12.5px;letter-spacing:.3px;display:inline-flex;align-items:center;gap:6px}
.tn-title-dot{width:6px;height:6px;border-radius:50%;background:var(--dsw-alias-brand-primary);display:inline-block}
.tn-count{font-size:10.5px;color:var(--dsw-alias-label-secondary);background:var(--dsw-alias-bg-layer-2);padding:1px 8px;border-radius:8px;font-variant-numeric:tabular-nums}
.tn-spacer{flex:1}
.tn-link{background:none;border:none;color:var(--dsw-alias-label-secondary);font-size:11px;cursor:pointer;padding:3px 8px;border-radius:6px;transition:background .12s,color .12s}
.tn-link:hover{color:var(--dsw-alias-label-primary);background:var(--dsw-alias-bg-layer-2)}
.tn-chip{display:inline-flex;align-items:center;gap:5px;height:22px;padding:0 10px;border-radius:11px;border:1px solid var(--dsw-alias-brand-primary);background:color-mix(in srgb,var(--dsw-alias-brand-primary) 8%,transparent);color:var(--dsw-alias-brand-primary);font-size:11px;font-weight:500;cursor:pointer;max-width:200px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;transition:background .12s}
.tn-chip:hover{background:color-mix(in srgb,var(--dsw-alias-brand-primary) 15%,transparent)}
.tn-node{display:flex;align-items:center;gap:7px;padding:4px 6px;border-radius:8px;cursor:pointer;transition:background .1s;margin:1px 6px}
.tn-node:hover{background:var(--dsw-alias-bg-layer-2)}
.tn-node[data-focus]{background:color-mix(in srgb,var(--dsw-alias-brand-primary) 10%,var(--dsw-alias-bg-layer-2));outline:1px solid color-mix(in srgb,var(--dsw-alias-brand-primary) 45%,transparent)}
.tn-tw{width:14px;text-align:center;color:var(--dsw-alias-label-secondary);cursor:pointer;user-select:none;flex:none;transition:transform .12s}
.tn-ico{flex:none;width:18px;height:18px;border-radius:5px;display:inline-flex;align-items:center;justify-content:center;font-size:11px;background:var(--dsw-alias-bg-layer-2)}
.tn-node[data-st=done] .tn-ico{background:color-mix(in srgb,var(--dsw-alias-state-success-primary) 15%,transparent)}
.tn-node[data-st=active] .tn-ico{background:color-mix(in srgb,var(--dsw-alias-brand-primary) 15%,transparent)}
.tn-node[data-st=running] .tn-ico{background:color-mix(in srgb,var(--dsw-alias-state-warn-primary) 15%,transparent)}
.tn-node[data-st=blocked] .tn-ico{background:color-mix(in srgb,var(--dsw-alias-state-error-primary) 15%,transparent)}
.tn-name{flex:1;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;font-size:12px}
.tn-name[data-done]{text-decoration:line-through;color:var(--dsw-alias-label-secondary)}
.tn-st{flex:none;font-size:9.5px;padding:1px 7px;border-radius:7px;border:1px solid;font-weight:500;letter-spacing:.3px}
.tn-st-pending{color:var(--dsw-alias-label-secondary);border-color:var(--dsw-alias-border-l2);background:transparent}
.tn-st-active{color:var(--dsw-alias-brand-primary);border-color:color-mix(in srgb,var(--dsw-alias-brand-primary) 55%,transparent);background:color-mix(in srgb,var(--dsw-alias-brand-primary) 8%,transparent)}
.tn-st-running{color:var(--dsw-alias-state-warn-primary);border-color:color-mix(in srgb,var(--dsw-alias-state-warn-primary) 55%,transparent);background:color-mix(in srgb,var(--dsw-alias-state-warn-primary) 8%,transparent)}
.tn-st-done{color:var(--dsw-alias-state-success-primary);border-color:color-mix(in srgb,var(--dsw-alias-state-success-primary) 55%,transparent);background:color-mix(in srgb,var(--dsw-alias-state-success-primary) 8%,transparent)}
.tn-st-blocked{color:var(--dsw-alias-state-error-primary);border-color:color-mix(in srgb,var(--dsw-alias-state-error-primary) 55%,transparent);background:color-mix(in srgb,var(--dsw-alias-state-error-primary) 8%,transparent)}
.tn-dec{flex:none;font-size:9.5px;padding:1px 6px;border-radius:7px;background:color-mix(in srgb,var(--dsw-alias-state-success-primary) 85%,#000 0%);color:#fff;font-weight:500;cursor:help}
.tn-pend{flex:none;font-size:9.5px;padding:1px 6px;border-radius:7px;border:1.5px dashed color-mix(in srgb,var(--dsw-alias-state-warn-primary) 70%,transparent);color:var(--dsw-alias-state-warn-primary);background:color-mix(in srgb,var(--dsw-alias-state-warn-primary) 6%,transparent);font-weight:500;cursor:help;animation:tnPulse 2.4s ease-in-out infinite}
@keyframes tnPulse{0%,100%{border-color:color-mix(in srgb,var(--dsw-alias-state-warn-primary) 70%,transparent)}50%{border-color:color-mix(in srgb,var(--dsw-alias-state-warn-primary) 35%,transparent)}}
.tn-kids{margin:0 6px 0 19px;border-left:1.5px solid color-mix(in srgb,var(--dsw-alias-border-l2) 70%,transparent);padding-left:6px}
.tn-detail{margin:8px 6px 0;padding:10px;border-radius:10px;background:var(--dsw-alias-bg-layer-2);border:1px solid var(--dsw-alias-border-l1);font-size:11.5px;line-height:1.7}
.tn-detail-t{font-weight:600;margin-bottom:6px;font-size:12px;display:flex;align-items:center;gap:6px}
.tn-detail-t::before{content:'';width:3px;height:14px;border-radius:2px;background:var(--dsw-alias-brand-primary);display:inline-block}
.tn-kv{display:flex;gap:8px;padding:1px 0}
.tn-kv b{flex:none;color:var(--dsw-alias-label-secondary);font-weight:500;font-variant-numeric:tabular-nums}
.tn-cli{margin-top:6px;padding:6px 8px;border-radius:6px;background:color-mix(in srgb,var(--dsw-alias-label-primary) 5%,transparent);font-family:var(--ds-font-family-code,ui-monospace,monospace);font-size:10.5px;color:var(--dsw-alias-label-secondary);word-break:break-all;border-left:2px solid var(--dsw-alias-border-l2)}
.tn-empty{color:var(--dsw-alias-label-secondary);padding:6px 0;font-size:11.5px;text-align:center}
.tn-toggle{flex:none;width:22px;height:22px;display:inline-flex;align-items:center;justify-content:center;background:none;border:1px solid var(--dsw-alias-border-l2);border-radius:6px;color:var(--dsw-alias-label-secondary);cursor:pointer;font-size:10px;transition:all .12s}
.tn-toggle:hover{color:var(--dsw-alias-label-primary);background:var(--dsw-alias-bg-layer-2);border-color:var(--dsw-alias-border-l2)}
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
			className: "tn-node", "data-focus": focused || undefined, "data-st": node.status || "pending",
			onClick: function () { props.setFocus(node.id); },
			title: node.note || node.title,
		},
			kids.length > 0 ? h("span", { className: "tn-tw", onClick: function (e) { e.stopPropagation(); setOpen(!open); } }, open ? "▾" : "▸") : h("span", { className: "tn-tw" }, " "),
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
	var session = props.session;
	var sessionId = session && session.sessionId;

	react.useEffect(function () {
		if (!sessionId) return function () {};
		var alive = true;
		var lastJson = null;
		var pull = function () {
			var conn = activeCtx && activeCtx.connection;
			if (!conn) return;
			conn.rpc.call("/tasknav", "get", { sessionId: sessionId }).then(function (res) {
				if (!alive) return;
				if (res && res.ok) {
					setErr("");
					var j = JSON.stringify(res.tree);
					if (j !== lastJson) { lastJson = j; setLoad(res.tree); }
				} else setErr((res && res.error) || "读取失败");
			}, function (e) { if (alive) setErr((e && e.message) || String(e)); });
		};
		pull();
		var iv = null;
		if (activeCtx && activeCtx.interval) iv = activeCtx.interval(pull, POLL_MS);
		return function () { alive = false; if (iv) iv(); };
	}, [tick, sessionId]);

	var focus = localFocus !== null ? localFocus : (load && load.focusId) || null;
	function setFocus(id) {
		setLocalFocus(id);
		var conn = activeCtx && activeCtx.connection;
		if (!conn) return;
		conn.rpc.call("/tasknav-focus", "set", { sessionId: sessionId, taskId: id }).then(function (res) {
			if (res && res.ok) { setLoad(res.tree); } else { setErr((res && res.error) || "聚焦失败"); }
		}, function (e) { setErr((e && e.message) || String(e)); });
	}

	var root = load && load.root;
	var count = (load && load.count) || 0;
	var focused = root ? findFocusedNode(root, focus) : null;
	var doneCount = (function countDone(n) { if (!n) return 0; var c = n.status === "done" ? 1 : 0; (Array.isArray(n.children) ? n.children : []).forEach(function (k) { c += countDone(k); }); return c; })(root);

	// Hidden entirely when this session has no tree (and no error to show).
	if (!load) return null;
	if (!root && !err) return null;

	var header = h("div", { className: "tn-head" },
		h("button", { className: "tn-toggle", onClick: function () { setOpen(!open); }, title: open ? "折叠任务导航" : "展开任务导航" }, open ? "▾" : "▸"),
		h("span", { className: "tn-title" }, h("span", { className: "tn-title-dot" }), "任务导航"),
		h("span", { className: "tn-count" }, doneCount + "/" + count + " 完成"),
		h("span", { className: "tn-spacer" }),
		focus ? h("button", { className: "tn-chip", title: "点击取消聚焦", onClick: function () { setFocus(null); } }, "◉ " + ((focused && focused.title) || focus).slice(0, 16)) : null,
		h("button", { className: "tn-link", onClick: function () { bump(tick + 1); } }, "刷新")
	);

	if (!open) return h("div", { className: "tn-dock", "data-collapsed": true }, header);

	return h("div", { className: "tn-dock" },
		header,
		h("div", { className: "tn-body" },
			root ? h(TaskNode, { node: root, depth: 0, focusId: focus, setFocus: setFocus }) : h("div", { className: "tn-empty" }, err ? ("tasknav: " + err) : "暂无任务树"),
			focused ? h("div", { className: "tn-detail" },
				h("div", { className: "tn-detail-t" }, focused.title || focused.id),
				focused.note ? h("div", { style: { marginBottom: "4px", color: "var(--dsw-alias-label-secondary)" } }, focused.note) : null,
				focused.cliCommand ? h("div", { className: "tn-cli" }, "$ " + focused.cliCommand, focused.cliResult ? h("div", { style: { opacity: 0.7, marginTop: "3px" } }, "→ " + String(focused.cliResult).slice(0, 200)) : null) : null,
				(Array.isArray(focused.decisions) && focused.decisions.length > 0) ? h("div", { style: { marginTop: "6px" } },
					h("div", { style: { fontWeight: 600, marginBottom: "3px", color: "var(--dsw-alias-state-success-primary)" } }, "✓ 决策记录"),
					focused.decisions.map(function (d, i) { return h("div", { key: i, className: "tn-kv" }, h("b", null, (d.at || "").slice(5, 16)), h("span", null, d.text || "")); })
				) : null,
				(Array.isArray(focused.pendingQuestions) && focused.pendingQuestions.length > 0) ? h("div", { style: { marginTop: "6px" } },
					h("div", { style: { fontWeight: 600, marginBottom: "3px", color: "var(--dsw-alias-state-warn-primary)" } }, "⏳ 待决策"),
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
exports.inject = ["connection", "slots", "timer"];
exports.name = "dsh-tasknav";
return module.exports;
} });
