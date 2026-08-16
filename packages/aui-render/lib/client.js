// dsh-aui-render — Client half (web platform, module-loader format)
// Renders ui_render / ui_form tool cards in the keyed tool.call.toolview slot.
window.__ModuleLoader__.load({ id: "dsh-aui-render", factory: (require) => {
var module = { exports: {} }; var exports = module.exports;
var react = require("react");
var h = react.createElement;

var RPC_CHANNEL = "/aui-rpc";
// Set in apply(); the form card resolves the RPC lazily so replay-only renders
// (no live plugin) never touch it.
var activeCtx = null;

var CSS = `
.aui-card{border:1px solid var(--dsw-alias-border-l1);background:var(--dsw-alias-bg-layer-1);border-radius:10px;padding:10px 12px;margin:2px 0;font-size:13px;color:var(--dsw-alias-label-primary)}
.aui-head{display:flex;align-items:center;gap:8px;margin-bottom:8px}
.aui-badge{font-size:10px;letter-spacing:.5px;text-transform:uppercase;color:var(--dsw-alias-brand-primary);border:1px solid var(--dsw-alias-brand-primary);border-radius:4px;padding:1px 5px}
.aui-title{font-weight:600}
.aui-spacer{flex:1}
.aui-link{background:none;border:none;color:var(--dsw-alias-label-secondary);font-size:11px;cursor:pointer;padding:2px 6px;border-radius:4px}
.aui-link:hover{color:var(--dsw-alias-label-primary)}
.aui-desc{color:var(--dsw-alias-label-secondary);font-size:12px;margin:-4px 0 8px}
.aui-scroll{overflow-x:auto}
.aui-table{border-collapse:collapse;width:100%;font-size:12.5px}
.aui-table th{text-align:left;color:var(--dsw-alias-label-secondary);font-weight:500;padding:4px 10px 4px 6px;border-bottom:1px solid var(--dsw-alias-border-l2);white-space:nowrap}
.aui-table td{padding:4px 10px 4px 6px;border-bottom:1px solid var(--dsw-alias-border-l1);white-space:nowrap;max-width:280px;overflow:hidden;text-overflow:ellipsis}
.aui-num{text-align:right;font-variant-numeric:tabular-nums}
.aui-more{width:100%;text-align:center}
.aui-chart{display:block;width:100%;height:auto}
.aui-ax,.aui-xl{font-size:10px;fill:var(--dsw-alias-label-secondary)}
.aui-legend{display:flex;flex-wrap:wrap;gap:4px 14px;margin-top:6px;font-size:12px;color:var(--dsw-alias-label-secondary)}
.aui-sw{display:inline-block;width:9px;height:9px;border-radius:2px;margin-right:5px}
.aui-f0{fill:var(--dsw-alias-brand-primary)}.aui-f1{fill:#22c55e}.aui-f2{fill:#f59e0b}.aui-f3{fill:#ef4444}.aui-f4{fill:#8b5cf6}.aui-f5{fill:#06b6d4}
.aui-l0{stroke:var(--dsw-alias-brand-primary)}.aui-l1{stroke:#22c55e}.aui-l2{stroke:#f59e0b}.aui-l3{stroke:#ef4444}.aui-l4{stroke:#8b5cf6}.aui-l5{stroke:#06b6d4}
.aui-b0{background:var(--dsw-alias-brand-primary)}.aui-b1{background:#22c55e}.aui-b2{background:#f59e0b}.aui-b3{background:#ef4444}.aui-b4{background:#8b5cf6}.aui-b5{background:#06b6d4}
.aui-lk{stroke:var(--dsw-alias-border-l2);stroke-width:1}
.aui-af{fill-opacity:.18}
.aui-jtree{font-family:var(--ds-font-family-code,ui-monospace,monospace);font-size:12px;line-height:1.7;overflow-x:auto}
.aui-jrow{white-space:nowrap}
.aui-jt{cursor:pointer;user-select:none;color:var(--dsw-alias-label-secondary);margin-right:4px;display:inline-block;width:10px}
.aui-jk{color:var(--dsw-alias-brand-primary)}
.aui-js{color:var(--dsw-alias-state-success-primary)}
.aui-jn{color:var(--dsw-alias-state-warn-primary)}
.aui-jb{color:var(--dsw-alias-label-secondary)}
.aui-jm{color:var(--dsw-alias-label-secondary)}
.aui-jkids{margin-left:16px;border-left:1px dotted var(--dsw-alias-border-l2);padding-left:6px}
.aui-empty{color:var(--dsw-alias-label-secondary);padding:6px 0}
.aui-err{color:var(--dsw-alias-state-error-primary);padding:2px 0;font-size:12px}
.aui-form{display:flex;flex-direction:column;gap:10px}
.aui-field label{display:block;font-size:12px;color:var(--dsw-alias-label-secondary);margin-bottom:4px}
.aui-input,.aui-select,.aui-textarea{width:100%;box-sizing:border-box;background:var(--dsw-alias-bg-layer-2);border:1px solid var(--dsw-alias-border-l2);border-radius:6px;color:var(--dsw-alias-label-primary);font:inherit;font-size:13px;padding:6px 8px;outline:none}
.aui-input:focus,.aui-select:focus,.aui-textarea:focus{border-color:var(--dsw-alias-brand-primary)}
.aui-textarea{min-height:60px;resize:vertical}
.aui-bad{border-color:var(--dsw-alias-state-error-primary)!important}
.aui-hint{font-size:11px;color:var(--dsw-alias-label-secondary);margin-top:3px}
.aui-bad-hint{font-size:11px;color:var(--dsw-alias-state-error-primary);margin-top:3px}
.aui-actions{display:flex;justify-content:flex-end;gap:8px;margin-top:2px}
.aui-btn{border:none;border-radius:6px;padding:6px 16px;font-size:13px;cursor:pointer}
.aui-primary{background:var(--dsw-alias-brand-primary);color:#fff}
.aui-plain{background:transparent;border:1px solid var(--dsw-alias-border-l2);color:var(--dsw-alias-label-primary)}
.aui-btn:disabled{opacity:.55;cursor:default}
.aui-checkrow{display:flex;align-items:center;gap:8px;font-size:13px}
.aui-kv{width:100%;border-collapse:collapse;font-size:12.5px}
.aui-kv td{padding:3px 6px;border-bottom:1px solid var(--dsw-alias-border-l1);vertical-align:top}
.aui-kv td:first-child{color:var(--dsw-alias-label-secondary);white-space:nowrap}
.aui-ptrack{flex:1;height:8px;background:var(--dsw-alias-bg-layer-2);border-radius:4px;overflow:hidden}
.aui-pfill{height:100%;background:var(--dsw-alias-brand-primary);border-radius:4px}
.aui-prow{display:flex;align-items:center;gap:8px;margin:4px 0;font-size:12px}
.aui-pnum{width:56px;text-align:right;font-variant-numeric:tabular-nums;color:var(--dsw-alias-label-secondary)}
.aui-plabel{width:120px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.aui-piewrap{display:flex;align-items:center;gap:16px;flex-wrap:wrap}
`;

function asJson(v) {
	if (typeof v !== "string") return v;
	try { return JSON.parse(v); } catch (e) { return v; }
}

function parseArgs(block) {
	try {
		var raw = null;
		if (block) {
			if (typeof block.argsRaw === "string") raw = block.argsRaw;
			else if (block.call && typeof block.call.argsRaw === "string") raw = block.call.argsRaw;
		}
		if (raw === null) return null;
		var parsed = JSON.parse(raw);
		return parsed && typeof parsed === "object" ? parsed : null;
	} catch (e) { return null; }
}

function settledInfo(block) {
	if (!block || !("kind" in block)) return null;
	var content = block.content;
	var first = Array.isArray(content) && content[0];
	return { isError: !!block.isError, text: first && typeof first.text === "string" ? first.text : "" };
}

function fmtNum(n) {
	if (typeof n !== "number" || !isFinite(n)) return String(n);
	var a = Math.abs(n);
	if (a >= 1e9) return (n / 1e9).toFixed(1).replace(/\.0$/, "") + "B";
	if (a >= 1e6) return (n / 1e6).toFixed(1).replace(/\.0$/, "") + "M";
	if (a >= 1e3) return (n / 1e3).toFixed(1).replace(/\.0$/, "") + "K";
	return String(Math.round(n * 100) / 100);
}

function TableView(props) {
	var columns = props.columns, rows = props.rows;
	var expanded = react.useState(false);
	var setExpanded = expanded[1];
	expanded = expanded[0];
	var cols = (Array.isArray(asJson(columns)) ? asJson(columns) : []).filter(function (c) { return c && typeof c.key === "string"; });
	var all = Array.isArray(asJson(rows)) ? asJson(rows) : [];
	var LIMIT = 12;
	var shown = expanded || all.length <= LIMIT ? all : all.slice(0, LIMIT);
	var numeric = {};
	for (var ci = 0; ci < cols.length; ci++) {
		var c = cols[ci];
		var isNum = true, seen = false;
		var sample = all.slice(0, 20);
		for (var ri = 0; ri < sample.length; ri++) {
			var v = sample[ri] ? sample[ri][c.key] : undefined;
			if (v === undefined || v === null) continue;
			seen = true;
			if (typeof v !== "number") { isNum = false; break; }
		}
		numeric[c.key] = seen && isNum;
	}
	function cell(v) {
		if (v === null || v === undefined) return h("span", { className: "aui-jm" }, "—");
		if (typeof v === "object") return h("span", { className: "aui-jm" }, JSON.stringify(v));
		if (typeof v === "boolean") return h("span", { className: "aui-jb" }, v ? "true" : "false");
		return String(v);
	}
	return h("div", { className: "aui-scroll" },
		h("table", { className: "aui-table" },
			h("thead", null, h("tr", null, cols.map(function (c) {
				return h("th", { key: c.key, className: numeric[c.key] ? "aui-num" : null }, c.label || c.key);
			}))),
			h("tbody", null,
				shown.map(function (r, i) {
					return h("tr", { key: i }, cols.map(function (c) {
						var val = r && r[c.key];
						return h("td", {
							key: c.key, className: numeric[c.key] ? "aui-num" : null,
							title: typeof val === "string" ? val : undefined,
						}, cell(val));
					}));
				}),
				all.length > LIMIT && !expanded ? h("tr", null, h("td", { className: "aui-more", colSpan: cols.length },
					h("button", { className: "aui-link", onClick: function () { setExpanded(true); } }, "展开全部 " + all.length + " 行"))) : null
			)
		)
	);
}

function BarChart(props) {
	var labels = props.labels, series = props.series;
	var W = 560, H = 210, L = 42, R = 10, T = 14, B = 30;
	var iw = W - L - R, ih = H - T - B;
	var groups = Math.max(labels.length, 1);
	var max = 0;
	series.forEach(function (s) { s.values.forEach(function (v) { if (typeof v === "number" && v > max) max = v; }); });
	if (max <= 0) max = 1;
	var slot = iw / groups;
	var bw = Math.max(2, Math.min(26, (slot * 0.72) / series.length));
	var step = groups > 10 ? Math.ceil(groups / 10) : 1;
	var els = [];
	for (var f = 0; f <= 2; f++) {
		var gy = T + ih * (1 - f / 2);
		els.push(h("line", { key: "g" + f, className: "aui-lk", x1: L, y1: gy, x2: W - R, y2: gy }));
		els.push(h("text", { key: "t" + f, className: "aui-ax", x: L - 6, y: gy + 3, textAnchor: "end" }, fmtNum(max * f / 2)));
	}
	for (var si = 0; si < series.length; si++) {
		var s = series[si];
		var count = Math.min(labels.length, s.values.length);
		for (var gi = 0; gi < count; gi++) {
			var v = typeof s.values[gi] === "number" ? s.values[gi] : 0;
			var bh = ih * (v / max);
			var gx = L + slot * gi + slot / 2 - (bw * series.length) / 2 + bw * si;
			els.push(h("rect", { key: "b" + si + "-" + gi, className: "aui-f" + (si % 6), x: gx, y: T + ih - bh, width: bw, height: Math.max(bh, v > 0 ? 1 : 0), rx: 2 }));
		}
	}
	for (var xi = 0; xi < labels.length; xi += step) {
		var xx = L + slot * xi + slot / 2;
		els.push(h("text", { key: "x" + xi, className: "aui-xl", x: xx, y: H - 10, textAnchor: "middle" }, String(labels[xi]).slice(0, 10)));
	}
	return h("svg", { className: "aui-chart", viewBox: "0 0 " + W + " " + H, role: "img" }, els);
}

function StackedBarChart(props) {
	var labels = props.labels, series = props.series;
	var W = 560, H = 210, L = 42, R = 10, T = 14, B = 30;
	var iw = W - L - R, ih = H - T - B;
	var groups = Math.max(labels.length, 1);
	var totals = [];
	for (var gi0 = 0; gi0 < groups; gi0++) {
		var t = 0;
		series.forEach(function (s) { if (typeof s.values[gi0] === "number") t += s.values[gi0]; });
		totals.push(t);
	}
	var max = 0;
	totals.forEach(function (t) { if (t > max) max = t; });
	if (max <= 0) max = 1;
	var slot = iw / groups;
	var bw = Math.max(3, Math.min(40, slot * 0.6));
	var step = groups > 10 ? Math.ceil(groups / 10) : 1;
	var els = [];
	for (var f = 0; f <= 2; f++) {
		var gy = T + ih * (1 - f / 2);
		els.push(h("line", { key: "g" + f, className: "aui-lk", x1: L, y1: gy, x2: W - R, y2: gy }));
		els.push(h("text", { key: "t" + f, className: "aui-ax", x: L - 6, y: gy + 3, textAnchor: "end" }, fmtNum(max * f / 2)));
	}
	for (var gi = 0; gi < groups; gi++) {
		var acc = 0;
		var gx = L + slot * gi + slot / 2 - bw / 2;
		for (var si = 0; si < series.length; si++) {
			var v = typeof series[si].values[gi] === "number" ? series[si].values[gi] : 0;
			if (v <= 0) continue;
			var bh = ih * (v / max);
			els.push(h("rect", { key: "s" + si + "-" + gi, className: "aui-f" + (si % 6), x: gx, y: T + ih - ih * ((acc + v) / max), width: bw, height: Math.max(bh, 1), rx: 2 }));
			acc += v;
		}
	}
	for (var xi = 0; xi < labels.length; xi += step) {
		var xx = L + slot * xi + slot / 2;
		els.push(h("text", { key: "x" + xi, className: "aui-xl", x: xx, y: H - 10, textAnchor: "middle" }, String(labels[xi]).slice(0, 10)));
	}
	return h("svg", { className: "aui-chart", viewBox: "0 0 " + W + " " + H, role: "img" }, els);
}

function LineChart(props) {
	var labels = props.labels, series = props.series, area = props.area;
	var W = 560, H = 210, L = 42, R = 12, T = 14, B = 30;
	var iw = W - L - R, ih = H - T - B;
	var n = Math.max(labels.length, 2);
	var max = 0;
	series.forEach(function (s) { s.values.forEach(function (v) { if (typeof v === "number" && v > max) max = v; }); });
	if (max <= 0) max = 1;
	var els = [];
	for (var f = 0; f <= 2; f++) {
		var gy = T + ih * (1 - f / 2);
		els.push(h("line", { key: "g" + f, className: "aui-lk", x1: L, y1: gy, x2: W - R, y2: gy }));
		els.push(h("text", { key: "t" + f, className: "aui-ax", x: L - 6, y: gy + 3, textAnchor: "end" }, fmtNum(max * f / 2)));
	}
	function px(i) { return L + (n === 1 ? iw / 2 : (iw * i) / (n - 1)); }
	function py(v) { return T + ih * (1 - (typeof v === "number" ? v : 0) / max); }
	series.forEach(function (s, si) {
		var count = Math.min(s.values.length, n);
		var pts = [];
		for (var i = 0; i < count; i++) pts.push(px(i).toFixed(1) + "," + py(s.values[i]).toFixed(1));
		if (area && count > 1) {
			var d = "M" + px(0).toFixed(1) + "," + (T + ih) + " L" + pts.join(" L") + " L" + px(count - 1).toFixed(1) + "," + (T + ih) + " Z";
			els.push(h("path", { key: "a" + si, className: "aui-f" + (si % 6) + " aui-af", d: d }));
		}
		els.push(h("polyline", { key: "p" + si, className: "aui-l" + (si % 6), points: pts.join(" "), fill: "none", strokeWidth: 2 }));
		for (var j = 0; j < count; j++) els.push(h("circle", { key: "c" + si + "-" + j, className: "aui-f" + (si % 6), cx: px(j), cy: py(s.values[j]), r: 2.6 }));
	});
	var step = n > 10 ? Math.ceil(n / 10) : 1;
	for (var xi = 0; xi < labels.length; xi += step) {
		els.push(h("text", { key: "x" + xi, className: "aui-xl", x: px(xi), y: H - 10, textAnchor: "middle" }, String(labels[xi]).slice(0, 10)));
	}
	return h("svg", { className: "aui-chart", viewBox: "0 0 " + W + " " + H, role: "img" }, els);
}

function ScatterChart(props) {
	var series = props.series;
	var W = 560, H = 210, L = 46, R = 14, T = 14, B = 32;
	var iw = W - L - R, ih = H - T - B;
	var xmin = Infinity, xmax = -Infinity, ymin = Infinity, ymax = -Infinity, count = 0;
	series.forEach(function (s) {
		(Array.isArray(s.points) ? s.points : []).forEach(function (p) {
			if (!p || typeof p.x !== "number" || typeof p.y !== "number") return;
			count++;
			if (p.x < xmin) xmin = p.x;
			if (p.x > xmax) xmax = p.x;
			if (p.y < ymin) ymin = p.y;
			if (p.y > ymax) ymax = p.y;
		});
	});
	if (count === 0) return h("div", { className: "aui-empty" }, "没有可用的散点数据（需要 series[].points: [{x,y}]）");
	if (xmax === xmin) xmax = xmin + 1;
	if (ymax === ymin) ymax = ymin + 1;
	function px(x) { return L + (iw * (x - xmin)) / (xmax - xmin); }
	function py(y) { return T + ih * (1 - (y - ymin) / (ymax - ymin)); }
	var els = [];
	for (var f = 0; f <= 2; f++) {
		var gy = T + ih * (1 - f / 2);
		els.push(h("line", { key: "g" + f, className: "aui-lk", x1: L, y1: gy, x2: W - R, y2: gy }));
		els.push(h("text", { key: "t" + f, className: "aui-ax", x: L - 6, y: gy + 3, textAnchor: "end" }, fmtNum(ymin + ((ymax - ymin) * f) / 2)));
	}
	els.push(h("text", { key: "x0", className: "aui-xl", x: L, y: H - 10, textAnchor: "middle" }, fmtNum(xmin)));
	els.push(h("text", { key: "x1", className: "aui-xl", x: W - R, y: H - 10, textAnchor: "end" }, fmtNum(xmax)));
	series.forEach(function (s, si) {
		(Array.isArray(s.points) ? s.points : []).forEach(function (p, i) {
			if (!p || typeof p.x !== "number" || typeof p.y !== "number") return;
			els.push(h("circle", { key: "p" + si + "-" + i, className: "aui-f" + (si % 6), cx: px(p.x).toFixed(1), cy: py(p.y).toFixed(1), r: 3.2 }));
		});
	});
	return h("svg", { className: "aui-chart", viewBox: "0 0 " + W + " " + H, role: "img" }, els);
}

function PieChart(props) {
	var labels = props.labels, values = props.values, donut = props.donut;
	var items = [];
	var total = 0;
	for (var i = 0; i < values.length; i++) {
		var n = typeof values[i] === "number" && values[i] > 0 ? values[i] : 0;
		if (n > 0) { items.push({ label: String(labels[i] === undefined ? i : labels[i]), value: n }); total += n; }
	}
	if (total <= 0 || items.length === 0) return h("div", { className: "aui-empty" }, "没有可用的正数值数据");
	var C = 90, R1 = 82, R0 = donut ? 52 : 0;
	function P(r, a) { return (C + r * Math.cos(a)).toFixed(2) + " " + (C + r * Math.sin(a)).toFixed(2); }
	var TAU = Math.PI * 2;
	var a = -Math.PI / 2;
	var arcs = items.map(function (it, i) {
		var sweep = (it.value / total) * TAU;
		var full = sweep >= TAU - 1e-9;
		var mid = a + sweep / 2;
		var path;
		if (full) {
			if (donut) {
				path = "M" + P(R1, a) + " A" + R1 + " " + R1 + " 0 0 1 " + P(R1, mid) + " A" + R1 + " " + R1 + " 0 0 1 " + P(R1, a)
					+ " L" + P(R0, a) + " A" + R0 + " " + R0 + " 0 0 0 " + P(R0, mid) + " A" + R0 + " " + R0 + " 0 0 0 " + P(R0, a) + " Z";
			} else {
				path = "M" + C + " " + C + " L" + P(R1, a) + " A" + R1 + " " + R1 + " 0 0 1 " + P(R1, mid) + " A" + R1 + " " + R1 + " 0 0 1 " + P(R1, a) + " Z";
			}
		} else {
			var large = sweep > Math.PI ? 1 : 0;
			if (donut) {
				path = "M" + P(R1, a) + " A" + R1 + " " + R1 + " 0 " + large + " 1 " + P(R1, a + sweep)
					+ " L" + P(R0, a + sweep) + " A" + R0 + " " + R0 + " 0 " + large + " 0 " + P(R0, a) + " Z";
			} else {
				path = "M" + C + " " + C + " L" + P(R1, a) + " A" + R1 + " " + R1 + " 0 " + large + " 1 " + P(R1, a + sweep) + " Z";
			}
		}
		a += sweep;
		return { path: path, cls: "aui-f" + (i % 6), label: it.label, value: it.value };
	});
	return h("div", { className: "aui-piewrap" },
		h("svg", { width: 180, height: 180, viewBox: "0 0 180 180", role: "img" },
			arcs.map(function (x, i) { return h("path", { key: i, className: x.cls, d: x.path }); }),
			donut ? h("text", { x: C, y: C + 4, textAnchor: "middle", className: "aui-xl" }, fmtNum(total)) : null
		),
		h("div", { className: "aui-legend", style: { flexDirection: "column", gap: "2px" } },
			arcs.map(function (x, i) {
				return h("div", { key: i },
					h("span", { className: "aui-sw aui-b" + (i % 6) }),
					x.label + "  " + fmtNum(x.value) + "  (" + ((x.value / total) * 100).toFixed(1) + "%)"
				);
			})
		)
	);
}

function ProgressChart(props) {
	var labels = props.labels, series = props.series;
	var values = series[0].values;
	var max = 0;
	values.forEach(function (v) { if (typeof v === "number" && v > max) max = v; });
	if (max <= 0) max = 1;
	return h("div", null, labels.map(function (lb, i) {
		var v = typeof values[i] === "number" ? values[i] : 0;
		return h("div", { key: i, className: "aui-prow" },
			h("span", { className: "aui-plabel", title: String(lb) }, String(lb)),
			h("div", { className: "aui-ptrack" }, h("div", { className: "aui-pfill", style: { width: Math.min(100, (v / max) * 100) + "%" } })),
			h("span", { className: "aui-pnum" }, fmtNum(v))
		);
	}));
}

function ChartView(props) {
	var c = asJson(props.chart) || {};
	var type = c.type || "bar";
	var labels = Array.isArray(c.labels) ? c.labels : [];
	var series = Array.isArray(c.series) ? c.series.filter(function (s) { return s && (Array.isArray(s.values) || Array.isArray(s.points)); }) : [];
	if (series.length === 0) return h("div", { className: "aui-empty" }, "chart.series 为空");
	var body;
	if (type === "line") body = h(LineChart, { labels: labels, series: series });
	else if (type === "area") body = h(LineChart, { labels: labels, series: series, area: true });
	else if (type === "scatter") body = h(ScatterChart, { series: series });
	else if (type === "pie" || type === "donut") body = h(PieChart, { labels: labels, values: series[0].values, donut: type === "donut" });
	else if (type === "progress") body = h(ProgressChart, { labels: labels, series: series });
	else if (type === "bar" && c.stacked === true) body = h(StackedBarChart, { labels: labels, series: series });
	else body = h(BarChart, { labels: labels, series: series });
	var legend = (type === "bar" || type === "line" || type === "area") && series.length > 1
		? h("div", { className: "aui-legend" }, series.map(function (s, i) {
			return h("span", { key: i }, h("span", { className: "aui-sw aui-b" + (i % 6) }), s.name || ("系列 " + (i + 1)));
		}))
		: null;
	return h("div", null, body, legend);
}

function Prim(props) {
	var v = props.v;
	if (typeof v === "string") return h("span", { className: "aui-js" }, JSON.stringify(v.length > 200 ? v.slice(0, 200) + "…" : v));
	if (typeof v === "number") return h("span", { className: "aui-jn" }, String(v));
	if (typeof v === "boolean") return h("span", { className: "aui-jb" }, String(v));
	return h("span", { className: "aui-jm" }, "null");
}

function JsonNode(props) {
	var k = props.k, v = props.v, depth = props.depth;
	var state = react.useState(depth < 2);
	var open = state[0], setOpen = state[1];
	if (v !== null && typeof v === "object") {
		var arr = Array.isArray(v);
		var entries = arr ? v.map(function (x, i) { return [String(i), x]; }) : Object.entries(v);
		var CAP = 100;
		var capped = entries.length > CAP;
		var shown = capped ? entries.slice(0, CAP) : entries;
		return h("div", null,
			h("div", { className: "aui-jrow" },
				h("span", { className: "aui-jt", onClick: function () { setOpen(!open); } }, open ? "▾" : "▸"),
				k !== undefined ? h("span", null, h("span", { className: "aui-jk" }, k), ": ") : null,
				h("span", { className: "aui-jm" }, (arr ? "[" : "{") + entries.length + (arr ? "]" : "}"))
			),
			open ? h("div", { className: "aui-jkids" },
				shown.map(function (pair) { return h(JsonNode, { key: pair[0], k: pair[0], v: pair[1], depth: depth + 1 }); }),
				capped ? h("div", { className: "aui-jm" }, "… 还有 " + (entries.length - CAP) + " 项") : null
			) : null
		);
	}
	return h("div", { className: "aui-jrow" },
		k !== undefined ? h("span", null, h("span", { className: "aui-jk" }, k), ": ") : null,
		h(Prim, { v: v })
	);
}

function RenderCard(props) {
	var state = react.useState(false);
	var raw = state[0], setRaw = state[1];
	var block = props.block;
	var args = parseArgs(block);
	if (!args) return h("div", { className: "aui-card" }, h("div", { className: "aui-err" }, "无法解析调用参数"));
	var kind = args.kind;
	var body;
	if (raw) body = h(JsonNode, { v: args, depth: 0 });
	else if (kind === "table") body = h(TableView, { columns: args.columns, rows: args.rows });
	else if (kind === "chart") body = args.chart !== undefined ? h(ChartView, { chart: args.chart }) : h("div", { className: "aui-err" }, "缺少 chart 字段");
	else if (kind === "json") body = h(JsonNode, { v: asJson(args.data), depth: 0 });
	else body = h("div", { className: "aui-err" }, "未知 kind: " + String(kind));
	return h("div", { className: "aui-card" },
		h("div", { className: "aui-head" },
			h("span", { className: "aui-badge" }, String(kind || "?")),
			args.title ? h("span", { className: "aui-title" }, String(args.title)) : null,
			h("span", { className: "aui-spacer" }),
			h("button", { className: "aui-link", onClick: function () { setRaw(!raw); } }, raw ? "卡片" : "JSON")
		),
		args.description ? h("div", { className: "aui-desc" }, String(args.description)) : null,
		body
	);
}

function fieldInitial(f) {
	if (f.default !== undefined) return asJson(f.default);
	var t = f.type || "text";
	if (t === "boolean") return false;
	if (t === "select" && Array.isArray(f.options) && f.options.length) return asJson(f.options[0].value);
	return "";
}

function FormCard(props) {
	var block = props.block;
	var settled = settledInfo(block);
	var args = parseArgs(block);
	var fields = args && Array.isArray(args.fields) ? args.fields.filter(function (f) { return f && typeof f.name === "string"; }) : [];
	var valuesState = react.useState(function () {
		var o = {};
		fields.forEach(function (f) { o[f.name] = fieldInitial(f); });
		return o;
	});
	var values = valuesState[0], setValues = valuesState[1];
	var errorsState = react.useState({});
	var errors = errorsState[0], setErrors = errorsState[1];
	var busyState = react.useState(false);
	var busy = busyState[0], setBusy = busyState[1];
	var msgState = react.useState("");
	var msg = msgState[0], setMsg = msgState[1];

	if (!args) return h("div", { className: "aui-card" }, h("div", { className: "aui-err" }, "无法解析调用参数"));

	if (settled) {
		var outcome = null;
		try { outcome = JSON.parse(settled.text); } catch (e) {}
		function head(extra) {
			return h("div", { className: "aui-head" },
				h("span", { className: "aui-badge" }, "form"),
				h("span", { className: "aui-title" }, String(args.title || "表单")),
				h("span", { className: "aui-spacer" }), extra);
		}
		if (settled.isError) return h("div", { className: "aui-card" },
			head(h("span", { className: "aui-err" }, "未完成")),
			h("div", { className: "aui-err" }, settled.text || "表单未完成"));
		if (outcome && outcome.status === "cancelled") return h("div", { className: "aui-card" },
			head(h("span", { className: "aui-jm" }, "已取消")),
			args.description ? h("div", { className: "aui-desc" }, String(args.description)) : null);
		if (outcome && outcome.status === "confirmed") {
			var vals = outcome.values || {};
			var rows = fields.length ? fields : Object.keys(vals).map(function (nm) { return { name: nm, label: nm }; });
			return h("div", { className: "aui-card" },
				head(h("span", { className: "aui-js" }, "已确认")),
				args.description ? h("div", { className: "aui-desc" }, String(args.description)) : null,
				h("table", { className: "aui-kv" }, h("tbody", null,
					rows.map(function (f) {
						var v = vals[f.name];
						return h("tr", { key: f.name },
							h("td", null, f.label || f.name),
							h("td", null, v === undefined || v === null ? "—" : (typeof v === "object" ? JSON.stringify(v) : String(v))));
					})
				))
			);
		}
		return h("div", { className: "aui-card" }, h("div", { className: "aui-err" }, settled.text || "表单已结束"));
	}

	var callId = props.callId || (block && block.callId);
	function setValue(name, v) {
		var next = Object.assign({}, values);
		next[name] = v;
		setValues(next);
		if (errors[name]) {
			var e2 = Object.assign({}, errors);
			delete e2[name];
			setErrors(e2);
		}
	}

	function submit(action) {
		if (busy) return;
		if (action === "confirm") {
			var errs = {};
			fields.forEach(function (f) {
				if (f.required) {
					var v = values[f.name];
					if (v === undefined || v === null || v === "") errs[f.name] = true;
				}
			});
			setErrors(errs);
			if (Object.keys(errs).length > 0) return;
		}
		var payload = {};
		if (action === "confirm") {
			fields.forEach(function (f) {
				var v = values[f.name];
				if ((f.type || "text") === "number" && typeof v === "string" && v.trim() !== "") v = Number(v);
				payload[f.name] = v;
			});
		}
		setBusy(true);
		setMsg("");
		function fail(text) { setBusy(false); setMsg(text); }
		var conn = activeCtx && activeCtx.connection;
		if (!conn) { fail("插件未就绪，无法提交"); return; }
		conn.rpc.call(RPC_CHANNEL, "form-submit", { callId: callId, action: action, values: payload }).then(
			function (res) {
				if (res && res.ok === false) fail("提交失败：" + ((res.error && res.error.message) || "未知错误"));
			},
			function (e) { fail("提交失败：" + (e && e.message ? e.message : String(e))); }
		);
	}

	return h("div", { className: "aui-card aui-form" },
		h("div", { className: "aui-head" },
			h("span", { className: "aui-badge" }, "form"),
			h("span", { className: "aui-title" }, String(args.title || "请确认"))
		),
		args.description ? h("div", { className: "aui-desc" }, String(args.description)) : null,
		fields.map(function (f) {
			var t = f.type || "text";
			var label = h("label", null, f.label || f.name, f.required ? h("span", { className: "aui-err" }, " *") : null);
			var ctrl;
			if (t === "select") {
				ctrl = h("select", { className: "aui-select" + (errors[f.name] ? " aui-bad" : ""), value: values[f.name], onChange: function (e) { setValue(f.name, e.target.value); } },
					(f.options || []).map(function (o, i) {
						var ov = o && o.value !== undefined ? o.value : o;
						return h("option", { key: i, value: ov }, o && o.label !== undefined ? o.label : String(ov));
					}));
			} else if (t === "multiline") {
				ctrl = h("textarea", { className: "aui-textarea" + (errors[f.name] ? " aui-bad" : ""), value: values[f.name] || "", placeholder: f.placeholder || "", onChange: function (e) { setValue(f.name, e.target.value); } });
			} else if (t === "boolean") {
				ctrl = h("div", { className: "aui-checkrow" },
					h("input", { type: "checkbox", checked: !!values[f.name], onChange: function (e) { setValue(f.name, e.target.checked); } }),
					f.help ? h("span", { className: "aui-hint" }, f.help) : null);
			} else if (t === "number") {
				ctrl = h("input", { className: "aui-input" + (errors[f.name] ? " aui-bad" : ""), type: "number", value: values[f.name] === undefined || values[f.name] === null ? "" : values[f.name], placeholder: f.placeholder || "", onChange: function (e) { setValue(f.name, e.target.value); } });
			} else {
				ctrl = h("input", { className: "aui-input" + (errors[f.name] ? " aui-bad" : ""), type: "text", value: values[f.name] || "", placeholder: f.placeholder || "", onChange: function (e) { setValue(f.name, e.target.value); } });
			}
			return h("div", { className: "aui-field", key: f.name }, label, ctrl,
				errors[f.name] ? h("div", { className: "aui-bad-hint" }, "此项必填") : (f.help && t !== "boolean" ? h("div", { className: "aui-hint" }, f.help) : null));
		}),
		msg ? h("div", { className: "aui-err" }, msg) : null,
		h("div", { className: "aui-actions" },
			h("button", { className: "aui-btn aui-plain", disabled: busy, onClick: function () { submit("cancel"); } }, args.cancelLabel || "取消"),
			h("button", { className: "aui-btn aui-primary", disabled: busy, onClick: function () { submit("confirm"); } }, args.confirmLabel || "确认")
		)
	);
}

var STYLE_ID = "dsh-aui-render-styles";

function apply(ctx) {
	activeCtx = ctx;
	var tag = null;
	if (typeof document !== "undefined" && document.querySelector("style[data-aui-style='" + STYLE_ID + "']") === null) {
		tag = document.createElement("style");
		tag.dataset.auiStyle = STYLE_ID;
		tag.textContent = CSS;
		document.head.appendChild(tag);
	}
	ctx.slots.inject("tool.call.toolview", function () {
		return ctx.slots.register({ name: "tool.call.toolview", key: "ui_render" }, function (props) { return h(RenderCard, props); });
	});
	ctx.slots.inject("tool.call.toolview", function () {
		return ctx.slots.register({ name: "tool.call.toolview", key: "ui_form" }, function (props) { return h(FormCard, props); });
	});
	ctx.effect(function () {
		return function () {
			if (tag && tag.parentNode) tag.parentNode.removeChild(tag);
			if (activeCtx === ctx) activeCtx = null;
		};
	});
}

exports.apply = apply;
exports.inject = ["connection", "slots"];
exports.name = "dsh-aui-render";
return module.exports;
} });
