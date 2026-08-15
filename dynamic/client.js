// a2ui 动态插件 — Client 半（aui-1/pkg-6 原样源码）
// 用法：本文件完整内容作为 cordis_define 的 code.client 参数。
const h = React.createElement;

const CSS = `
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
  if (typeof v !== 'string') return v;
  try { return JSON.parse(v); } catch (e) { return v; }
}

function parseArgs(block) {
  try {
    let raw = null;
    if (block) {
      if (typeof block.argsRaw === 'string') raw = block.argsRaw;
      else if (block.call && typeof block.call.argsRaw === 'string') raw = block.call.argsRaw;
    }
    if (raw === null) return null;
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === 'object' ? parsed : null;
  } catch (e) { return null; }
}

function settledInfo(block) {
  if (!block || !('kind' in block)) return null;
  const content = block.content;
  const first = Array.isArray(content) && content[0];
  return { isError: !!block.isError, text: first && typeof first.text === 'string' ? first.text : '' };
}

function fmtNum(n) {
  if (typeof n !== 'number' || !isFinite(n)) return String(n);
  const a = Math.abs(n);
  if (a >= 1e9) return (n / 1e9).toFixed(1).replace(/\.0$/, '') + 'B';
  if (a >= 1e6) return (n / 1e6).toFixed(1).replace(/\.0$/, '') + 'M';
  if (a >= 1e3) return (n / 1e3).toFixed(1).replace(/\.0$/, '') + 'K';
  return String(Math.round(n * 100) / 100);
}

function TableView({ columns, rows }) {
  const [expanded, setExpanded] = React.useState(false);
  const cols = (Array.isArray(asJson(columns)) ? asJson(columns) : []).filter(c => c && typeof c.key === 'string');
  const all = Array.isArray(asJson(rows)) ? asJson(rows) : [];
  const LIMIT = 12;
  const shown = expanded || all.length <= LIMIT ? all : all.slice(0, LIMIT);
  const numeric = {};
  for (const c of cols) {
    let isNum = true, seen = false;
    for (const r of all.slice(0, 20)) {
      const v = r ? r[c.key] : undefined;
      if (v === undefined || v === null) continue;
      seen = true;
      if (typeof v !== 'number') { isNum = false; break; }
    }
    numeric[c.key] = seen && isNum;
  }
  const cell = (v) => {
    if (v === null || v === undefined) return h('span', { className: 'aui-jm' }, '—');
    if (typeof v === 'object') return h('span', { className: 'aui-jm' }, JSON.stringify(v));
    if (typeof v === 'boolean') return h('span', { className: 'aui-jb' }, v ? 'true' : 'false');
    return String(v);
  };
  return h('div', { className: 'aui-scroll' },
    h('table', { className: 'aui-table' },
      h('thead', null, h('tr', null, cols.map(c => h('th', { key: c.key, className: numeric[c.key] ? 'aui-num' : null }, c.label || c.key)))),
      h('tbody', null,
        shown.map((r, i) => h('tr', { key: i }, cols.map(c => h('td', {
          key: c.key, className: numeric[c.key] ? 'aui-num' : null,
          title: typeof (r && r[c.key]) === 'string' ? r[c.key] : undefined
        }, cell(r && r[c.key]))))),
        all.length > LIMIT && !expanded ? h('tr', null, h('td', { className: 'aui-more', colSpan: cols.length },
          h('button', { className: 'aui-link', onClick: () => setExpanded(true) }, '展开全部 ' + all.length + ' 行'))) : null
      )
    )
  );
}

function BarChart({ labels, series }) {
  const W = 560, H = 210, L = 42, R = 10, T = 14, B = 30;
  const iw = W - L - R, ih = H - T - B;
  const groups = Math.max(labels.length, 1);
  let max = 0;
  for (const s of series) for (const v of s.values) if (typeof v === 'number' && v > max) max = v;
  if (max <= 0) max = 1;
  const slot = iw / groups;
  const bw = Math.max(2, Math.min(26, (slot * 0.72) / series.length));
  const step = groups > 10 ? Math.ceil(groups / 10) : 1;
  const els = [];
  for (let f = 0; f <= 2; f++) {
    const y = T + ih * (1 - f / 2);
    els.push(h('line', { key: 'g' + f, className: 'aui-lk', x1: L, y1: y, x2: W - R, y2: y }));
    els.push(h('text', { key: 't' + f, className: 'aui-ax', x: L - 6, y: y + 3, textAnchor: 'end' }, fmtNum(max * f / 2)));
  }
  for (let si = 0; si < series.length; si++) {
    const s = series[si];
    const count = Math.min(labels.length, s.values.length);
    for (let gi = 0; gi < count; gi++) {
      const v = typeof s.values[gi] === 'number' ? s.values[gi] : 0;
      const bh = ih * (v / max);
      const gx = L + slot * gi + slot / 2 - (bw * series.length) / 2 + bw * si;
      els.push(h('rect', { key: 'b' + si + '-' + gi, className: 'aui-f' + (si % 6), x: gx, y: T + ih - bh, width: bw, height: Math.max(bh, v > 0 ? 1 : 0), rx: 2 }));
    }
  }
  for (let gi = 0; gi < labels.length; gi += step) {
    const x = L + slot * gi + slot / 2;
    els.push(h('text', { key: 'x' + gi, className: 'aui-xl', x: x, y: H - 10, textAnchor: 'middle' }, String(labels[gi]).slice(0, 10)));
  }
  return h('svg', { className: 'aui-chart', viewBox: '0 0 ' + W + ' ' + H, role: 'img' }, els);
}

function StackedBarChart({ labels, series }) {
  const W = 560, H = 210, L = 42, R = 10, T = 14, B = 30;
  const iw = W - L - R, ih = H - T - B;
  const groups = Math.max(labels.length, 1);
  const totals = [];
  for (let gi = 0; gi < groups; gi++) {
    let t = 0;
    for (const s of series) if (typeof s.values[gi] === 'number') t += s.values[gi];
    totals.push(t);
  }
  let max = 0;
  for (const t of totals) if (t > max) max = t;
  if (max <= 0) max = 1;
  const slot = iw / groups;
  const bw = Math.max(3, Math.min(40, slot * 0.6));
  const step = groups > 10 ? Math.ceil(groups / 10) : 1;
  const els = [];
  for (let f = 0; f <= 2; f++) {
    const y = T + ih * (1 - f / 2);
    els.push(h('line', { key: 'g' + f, className: 'aui-lk', x1: L, y1: y, x2: W - R, y2: y }));
    els.push(h('text', { key: 't' + f, className: 'aui-ax', x: L - 6, y: y + 3, textAnchor: 'end' }, fmtNum(max * f / 2)));
  }
  for (let gi = 0; gi < groups; gi++) {
    let acc = 0;
    const gx = L + slot * gi + slot / 2 - bw / 2;
    for (let si = 0; si < series.length; si++) {
      const v = typeof series[si].values[gi] === 'number' ? series[si].values[gi] : 0;
      if (v <= 0) continue;
      const bh = ih * (v / max);
      els.push(h('rect', { key: 's' + si + '-' + gi, className: 'aui-f' + (si % 6), x: gx, y: T + ih - ih * ((acc + v) / max), width: bw, height: Math.max(bh, 1), rx: 2 }));
      acc += v;
    }
  }
  for (let gi = 0; gi < labels.length; gi += step) {
    const x = L + slot * gi + slot / 2;
    els.push(h('text', { key: 'x' + gi, className: 'aui-xl', x: x, y: H - 10, textAnchor: 'middle' }, String(labels[gi]).slice(0, 10)));
  }
  return h('svg', { className: 'aui-chart', viewBox: '0 0 ' + W + ' ' + H, role: 'img' }, els);
}

function LineChart({ labels, series, area }) {
  const W = 560, H = 210, L = 42, R = 12, T = 14, B = 30;
  const iw = W - L - R, ih = H - T - B;
  const n = Math.max(labels.length, 2);
  let max = 0;
  for (const s of series) for (const v of s.values) if (typeof v === 'number' && v > max) max = v;
  if (max <= 0) max = 1;
  const els = [];
  for (let f = 0; f <= 2; f++) {
    const y = T + ih * (1 - f / 2);
    els.push(h('line', { key: 'g' + f, className: 'aui-lk', x1: L, y1: y, x2: W - R, y2: y }));
    els.push(h('text', { key: 't' + f, className: 'aui-ax', x: L - 6, y: y + 3, textAnchor: 'end' }, fmtNum(max * f / 2)));
  }
  const px = (i) => L + (n === 1 ? iw / 2 : (iw * i) / (n - 1));
  const py = (v) => T + ih * (1 - (typeof v === 'number' ? v : 0) / max);
  series.forEach((s, si) => {
    const count = Math.min(s.values.length, n);
    const pts = [];
    for (let i = 0; i < count; i++) pts.push(px(i).toFixed(1) + ',' + py(s.values[i]).toFixed(1));
    if (area && count > 1) {
      const d = 'M' + px(0).toFixed(1) + ',' + (T + ih) + ' L' + pts.join(' L') + ' L' + px(count - 1).toFixed(1) + ',' + (T + ih) + ' Z';
      els.push(h('path', { key: 'a' + si, className: 'aui-f' + (si % 6) + ' aui-af', d: d }));
    }
    els.push(h('polyline', { key: 'p' + si, className: 'aui-l' + (si % 6), points: pts.join(' '), fill: 'none', strokeWidth: 2 }));
    for (let i = 0; i < count; i++) els.push(h('circle', { key: 'c' + si + '-' + i, className: 'aui-f' + (si % 6), cx: px(i), cy: py(s.values[i]), r: 2.6 }));
  });
  const step = n > 10 ? Math.ceil(n / 10) : 1;
  for (let i = 0; i < labels.length; i += step) {
    els.push(h('text', { key: 'x' + i, className: 'aui-xl', x: px(i), y: H - 10, textAnchor: 'middle' }, String(labels[i]).slice(0, 10)));
  }
  return h('svg', { className: 'aui-chart', viewBox: '0 0 ' + W + ' ' + H, role: 'img' }, els);
}

function ScatterChart({ series }) {
  const W = 560, H = 210, L = 46, R = 14, T = 14, B = 32;
  const iw = W - L - R, ih = H - T - B;
  let xmin = Infinity, xmax = -Infinity, ymin = Infinity, ymax = -Infinity, count = 0;
  for (const s of series) {
    const pts = Array.isArray(s.points) ? s.points : [];
    for (const p of pts) {
      if (!p || typeof p.x !== 'number' || typeof p.y !== 'number') continue;
      count++;
      if (p.x < xmin) xmin = p.x;
      if (p.x > xmax) xmax = p.x;
      if (p.y < ymin) ymin = p.y;
      if (p.y > ymax) ymax = p.y;
    }
  }
  if (count === 0) return h('div', { className: 'aui-empty' }, '没有可用的散点数据（需要 series[].points: [{x,y}]）');
  if (xmax === xmin) xmax = xmin + 1;
  if (ymax === ymin) ymax = ymin + 1;
  const px = (x) => L + (iw * (x - xmin)) / (xmax - xmin);
  const py = (y) => T + ih * (1 - (y - ymin) / (ymax - ymin));
  const els = [];
  for (let f = 0; f <= 2; f++) {
    const y = T + ih * (1 - f / 2);
    els.push(h('line', { key: 'g' + f, className: 'aui-lk', x1: L, y1: y, x2: W - R, y2: y }));
    els.push(h('text', { key: 't' + f, className: 'aui-ax', x: L - 6, y: y + 3, textAnchor: 'end' }, fmtNum(ymin + ((ymax - ymin) * f) / 2)));
  }
  els.push(h('text', { key: 'x0', className: 'aui-xl', x: L, y: H - 10, textAnchor: 'middle' }, fmtNum(xmin)));
  els.push(h('text', { key: 'x1', className: 'aui-xl', x: W - R, y: H - 10, textAnchor: 'end' }, fmtNum(xmax)));
  series.forEach((s, si) => {
    const pts = Array.isArray(s.points) ? s.points : [];
    pts.forEach((p, i) => {
      if (!p || typeof p.x !== 'number' || typeof p.y !== 'number') return;
      els.push(h('circle', { key: 'p' + si + '-' + i, className: 'aui-f' + (si % 6), cx: px(p.x).toFixed(1), cy: py(p.y).toFixed(1), r: 3.2 }));
    });
  });
  return h('svg', { className: 'aui-chart', viewBox: '0 0 ' + W + ' ' + H, role: 'img' }, els);
}

function PieChart({ labels, values, donut }) {
  const items = [];
  let total = 0;
  for (let i = 0; i < values.length; i++) {
    const n = typeof values[i] === 'number' && values[i] > 0 ? values[i] : 0;
    if (n > 0) { items.push({ label: String(labels[i] === undefined ? i : labels[i]), value: n }); total += n; }
  }
  if (total <= 0 || items.length === 0) return h('div', { className: 'aui-empty' }, '没有可用的正数值数据');
  const C = 90, R1 = 82, R0 = donut ? 52 : 0;
  const P = (r, a) => (C + r * Math.cos(a)).toFixed(2) + ' ' + (C + r * Math.sin(a)).toFixed(2);
  const TAU = Math.PI * 2;
  let a = -Math.PI / 2;
  const arcs = items.map((it, i) => {
    const sweep = (it.value / total) * TAU;
    const full = sweep >= TAU - 1e-9;
    const mid = a + sweep / 2;
    let path;
    if (full) {
      if (donut) {
        path = 'M' + P(R1, a) + ' A' + R1 + ' ' + R1 + ' 0 0 1 ' + P(R1, mid) + ' A' + R1 + ' ' + R1 + ' 0 0 1 ' + P(R1, a)
          + ' L' + P(R0, a) + ' A' + R0 + ' ' + R0 + ' 0 0 0 ' + P(R0, mid) + ' A' + R0 + ' ' + R0 + ' 0 0 0 ' + P(R0, a) + ' Z';
      } else {
        path = 'M' + C + ' ' + C + ' L' + P(R1, a) + ' A' + R1 + ' ' + R1 + ' 0 0 1 ' + P(R1, mid) + ' A' + R1 + ' ' + R1 + ' 0 0 1 ' + P(R1, a) + ' Z';
      }
    } else {
      const large = sweep > Math.PI ? 1 : 0;
      if (donut) {
        path = 'M' + P(R1, a) + ' A' + R1 + ' ' + R1 + ' 0 ' + large + ' 1 ' + P(R1, a + sweep)
          + ' L' + P(R0, a + sweep) + ' A' + R0 + ' ' + R0 + ' 0 ' + large + ' 0 ' + P(R0, a) + ' Z';
      } else {
        path = 'M' + C + ' ' + C + ' L' + P(R1, a) + ' A' + R1 + ' ' + R1 + ' 0 ' + large + ' 1 ' + P(R1, a + sweep) + ' Z';
      }
    }
    a += sweep;
    return { path: path, cls: 'aui-f' + (i % 6), label: it.label, value: it.value };
  });
  return h('div', { className: 'aui-piewrap' },
    h('svg', { width: 180, height: 180, viewBox: '0 0 180 180', role: 'img' },
      arcs.map((x, i) => h('path', { key: i, className: x.cls, d: x.path })),
      donut ? h('text', { x: C, y: C + 4, textAnchor: 'middle', className: 'aui-xl' }, fmtNum(total)) : null
    ),
    h('div', { className: 'aui-legend', style: { flexDirection: 'column', gap: '2px' } },
      arcs.map((x, i) => h('div', { key: i },
        h('span', { className: 'aui-sw aui-b' + (i % 6) }),
        x.label + '  ' + fmtNum(x.value) + '  (' + ((x.value / total) * 100).toFixed(1) + '%)'
      ))
    )
  );
}

function ProgressChart({ labels, series }) {
  const values = series[0].values;
  let max = 0;
  for (const v of values) if (typeof v === 'number' && v > max) max = v;
  if (max <= 0) max = 1;
  return h('div', null, labels.map((lb, i) => {
    const v = typeof values[i] === 'number' ? values[i] : 0;
    return h('div', { key: i, className: 'aui-prow' },
      h('span', { className: 'aui-plabel', title: String(lb) }, String(lb)),
      h('div', { className: 'aui-ptrack' }, h('div', { className: 'aui-pfill', style: { width: Math.min(100, (v / max) * 100) + '%' } })),
      h('span', { className: 'aui-pnum' }, fmtNum(v))
    );
  }));
}

function ChartView({ chart }) {
  const c = asJson(chart) || {};
  const type = c.type || 'bar';
  const labels = Array.isArray(c.labels) ? c.labels : [];
  const series = Array.isArray(c.series) ? c.series.filter(s => s && (Array.isArray(s.values) || Array.isArray(s.points))) : [];
  if (series.length === 0) return h('div', { className: 'aui-empty' }, 'chart.series 为空');
  let body;
  if (type === 'line') body = h(LineChart, { labels: labels, series: series });
  else if (type === 'area') body = h(LineChart, { labels: labels, series: series, area: true });
  else if (type === 'scatter') body = h(ScatterChart, { series: series });
  else if (type === 'pie' || type === 'donut') body = h(PieChart, { labels: labels, values: series[0].values, donut: type === 'donut' });
  else if (type === 'progress') body = h(ProgressChart, { labels: labels, series: series });
  else if (type === 'bar' && c.stacked === true) body = h(StackedBarChart, { labels: labels, series: series });
  else body = h(BarChart, { labels: labels, series: series });
  const legend = (type === 'bar' || type === 'line' || type === 'area') && series.length > 1
    ? h('div', { className: 'aui-legend' }, series.map((s, i) => h('span', { key: i }, h('span', { className: 'aui-sw aui-b' + (i % 6) }), s.name || ('系列 ' + (i + 1)))))
    : null;
  return h('div', null, body, legend);
}

function Prim({ v }) {
  if (typeof v === 'string') return h('span', { className: 'aui-js' }, JSON.stringify(v.length > 200 ? v.slice(0, 200) + '…' : v));
  if (typeof v === 'number') return h('span', { className: 'aui-jn' }, String(v));
  if (typeof v === 'boolean') return h('span', { className: 'aui-jb' }, String(v));
  return h('span', { className: 'aui-jm' }, 'null');
}

function JsonNode({ k, v, depth }) {
  const [open, setOpen] = React.useState(depth < 2);
  if (v !== null && typeof v === 'object') {
    const arr = Array.isArray(v);
    let entries = arr ? v.map((x, i) => [String(i), x]) : Object.entries(v);
    const CAP = 100;
    const capped = entries.length > CAP;
    const shown = capped ? entries.slice(0, CAP) : entries;
    return h('div', null,
      h('div', { className: 'aui-jrow' },
        h('span', { className: 'aui-jt', onClick: () => setOpen(!open) }, open ? '▾' : '▸'),
        k !== undefined ? h('span', null, h('span', { className: 'aui-jk' }, k), ': ') : null,
        h('span', { className: 'aui-jm' }, (arr ? '[' : '{') + entries.length + (arr ? ']' : '}'))
      ),
      open ? h('div', { className: 'aui-jkids' },
        shown.map(pair => h(JsonNode, { key: pair[0], k: pair[0], v: pair[1], depth: depth + 1 })),
        capped ? h('div', { className: 'aui-jm' }, '… 还有 ' + (entries.length - CAP) + ' 项') : null
      ) : null
    );
  }
  return h('div', { className: 'aui-jrow' },
    k !== undefined ? h('span', null, h('span', { className: 'aui-jk' }, k), ': ') : null,
    h(Prim, { v: v })
  );
}

function RenderCard(props) {
  const [raw, setRaw] = React.useState(false);
  const block = props.block;
  const args = parseArgs(block);
  if (!args) return h('div', { className: 'aui-card' }, h('div', { className: 'aui-err' }, '无法解析调用参数'));
  const kind = args.kind;
  let body = null;
  if (raw) body = h(JsonNode, { v: args, depth: 0 });
  else if (kind === 'table') body = h(TableView, { columns: args.columns, rows: args.rows });
  else if (kind === 'chart') body = args.chart !== undefined ? h(ChartView, { chart: args.chart }) : h('div', { className: 'aui-err' }, '缺少 chart 字段');
  else if (kind === 'json') body = h(JsonNode, { v: asJson(args.data), depth: 0 });
  else body = h('div', { className: 'aui-err' }, '未知 kind: ' + String(kind));
  return h('div', { className: 'aui-card' },
    h('div', { className: 'aui-head' },
      h('span', { className: 'aui-badge' }, String(kind || '?')),
      args.title ? h('span', { className: 'aui-title' }, String(args.title)) : null,
      h('span', { className: 'aui-spacer' }),
      h('button', { className: 'aui-link', onClick: () => setRaw(!raw) }, raw ? '卡片' : 'JSON')
    ),
    args.description ? h('div', { className: 'aui-desc' }, String(args.description)) : null,
    body
  );
}

function fieldInitial(f) {
  if (f.default !== undefined) return asJson(f.default);
  const t = f.type || 'text';
  if (t === 'boolean') return false;
  if (t === 'select' && Array.isArray(f.options) && f.options.length) return asJson(f.options[0].value);
  return '';
}

function FormCard(props) {
  const block = props.block;
  const settled = settledInfo(block);
  const args = parseArgs(block);
  const fields = args && Array.isArray(args.fields) ? args.fields.filter(f => f && typeof f.name === 'string') : [];
  const [values, setValues] = React.useState(() => {
    const o = {};
    for (const f of fields) o[f.name] = fieldInitial(f);
    return o;
  });
  const [errors, setErrors] = React.useState({});
  const [busy, setBusy] = React.useState(false);
  const [msg, setMsg] = React.useState('');

  if (!args) return h('div', { className: 'aui-card' }, h('div', { className: 'aui-err' }, '无法解析调用参数'));

  if (settled) {
    let outcome = null;
    try { outcome = JSON.parse(settled.text); } catch (e) {}
    const head = (extra) => h('div', { className: 'aui-head' },
      h('span', { className: 'aui-badge' }, 'form'),
      h('span', { className: 'aui-title' }, String(args.title || '表单')),
      h('span', { className: 'aui-spacer' }), extra);
    if (settled.isError) return h('div', { className: 'aui-card' },
      head(h('span', { className: 'aui-err' }, '未完成')),
      h('div', { className: 'aui-err' }, settled.text || '表单未完成'));
    if (outcome && outcome.status === 'cancelled') return h('div', { className: 'aui-card' },
      head(h('span', { className: 'aui-jm' }, '已取消')),
      args.description ? h('div', { className: 'aui-desc' }, String(args.description)) : null);
    if (outcome && outcome.status === 'confirmed') {
      const vals = outcome.values || {};
      const rows = fields.length ? fields : Object.keys(vals).map(name => ({ name: name, label: name }));
      return h('div', { className: 'aui-card' },
        head(h('span', { className: 'aui-js' }, '已确认')),
        args.description ? h('div', { className: 'aui-desc' }, String(args.description)) : null,
        h('table', { className: 'aui-kv' }, h('tbody', null,
          rows.map(f => h('tr', { key: f.name },
            h('td', null, f.label || f.name),
            h('td', null, vals[f.name] === undefined || vals[f.name] === null ? '—' : (typeof vals[f.name] === 'object' ? JSON.stringify(vals[f.name]) : String(vals[f.name])))))
        ))
      );
    }
    return h('div', { className: 'aui-card' }, h('div', { className: 'aui-err' }, settled.text || '表单已结束'));
  }

  const callId = props.callId || (block && block.callId);
  const setValue = (name, v) => {
    const next = Object.assign({}, values);
    next[name] = v;
    setValues(next);
    if (errors[name]) {
      const e2 = Object.assign({}, errors);
      delete e2[name];
      setErrors(e2);
    }
  };

  const submit = (action) => {
    if (busy) return;
    if (action === 'confirm') {
      const errs = {};
      for (const f of fields) {
        if (f.required) {
          const v = values[f.name];
          if (v === undefined || v === null || v === '') errs[f.name] = true;
        }
      }
      setErrors(errs);
      if (Object.keys(errs).length > 0) return;
    }
    const payload = {};
    if (action === 'confirm') {
      for (const f of fields) {
        let v = values[f.name];
        if ((f.type || 'text') === 'number' && typeof v === 'string' && v.trim() !== '') v = Number(v);
        payload[f.name] = v;
      }
    }
    setBusy(true);
    setMsg('');
    const fail = (text) => { setBusy(false); setMsg(text); };
    host.call('aui-form-submit', { callId: callId, action: action, values: payload }).then(
      (res) => {
        if (res && res.ok === false) fail('提交失败：' + (res.error || '未知错误'));
      },
      (e) => fail('提交失败：' + (e && e.message ? e.message : String(e)))
    );
  };

  return h('div', { className: 'aui-card aui-form' },
    h('div', { className: 'aui-head' },
      h('span', { className: 'aui-badge' }, 'form'),
      h('span', { className: 'aui-title' }, String(args.title || '请确认'))
    ),
    args.description ? h('div', { className: 'aui-desc' }, String(args.description)) : null,
    fields.map(f => {
      const t = f.type || 'text';
      const label = h('label', null, f.label || f.name, f.required ? h('span', { className: 'aui-err' }, ' *') : null);
      let ctrl;
      if (t === 'select') {
        ctrl = h('select', { className: 'aui-select' + (errors[f.name] ? ' aui-bad' : ''), value: values[f.name], onChange: (e) => setValue(f.name, e.target.value) },
          (f.options || []).map((o, i) => h('option', { key: i, value: o && o.value !== undefined ? o.value : o }, o && o.label !== undefined ? o.label : String(o && o.value !== undefined ? o.value : o))));
      } else if (t === 'multiline') {
        ctrl = h('textarea', { className: 'aui-textarea' + (errors[f.name] ? ' aui-bad' : ''), value: values[f.name] || '', placeholder: f.placeholder || '', onChange: (e) => setValue(f.name, e.target.value) });
      } else if (t === 'boolean') {
        ctrl = h('div', { className: 'aui-checkrow' },
          h('input', { type: 'checkbox', checked: !!values[f.name], onChange: (e) => setValue(f.name, e.target.checked) }),
          f.help ? h('span', { className: 'aui-hint' }, f.help) : null);
      } else if (t === 'number') {
        ctrl = h('input', { className: 'aui-input' + (errors[f.name] ? ' aui-bad' : ''), type: 'number', value: values[f.name] === undefined || values[f.name] === null ? '' : values[f.name], placeholder: f.placeholder || '', onChange: (e) => setValue(f.name, e.target.value) });
      } else {
        ctrl = h('input', { className: 'aui-input' + (errors[f.name] ? ' aui-bad' : ''), type: 'text', value: values[f.name] || '', placeholder: f.placeholder || '', onChange: (e) => setValue(f.name, e.target.value) });
      }
      return h('div', { className: 'aui-field', key: f.name }, label, ctrl,
        errors[f.name] ? h('div', { className: 'aui-bad-hint' }, '此项必填') : (f.help && t !== 'boolean' ? h('div', { className: 'aui-hint' }, f.help) : null));
    }),
    msg ? h('div', { className: 'aui-err' }, msg) : null,
    h('div', { className: 'aui-actions' },
      h('button', { className: 'aui-btn aui-plain', disabled: busy, onClick: () => submit('cancel') }, args.cancelLabel || '取消'),
      h('button', { className: 'aui-btn aui-primary', disabled: busy, onClick: () => submit('confirm') }, args.confirmLabel || '确认')
    )
  );
}

return {
  apply(ctx) {
    const slots = ctx.get('slots');
    if (slots === undefined) return;
    const offCss = styles.insert(CSS);
    const offRender = slots.inject('tool.call.toolview', () => slots.register(
      { name: 'tool.call.toolview', key: 'ui_render' },
      (props) => h(RenderCard, props)
    ));
    const offForm = slots.inject('tool.call.toolview', () => slots.register(
      { name: 'tool.call.toolview', key: 'ui_form' },
      (props) => h(FormCard, props)
    ));
    ctx.effect(() => () => { offRender(); offForm(); offCss(); });
  }
};
