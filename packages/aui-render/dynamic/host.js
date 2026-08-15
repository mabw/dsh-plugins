// a2ui 动态插件 — Host 半（aui-1/pkg-6 原样源码）
// 用法：本文件完整内容作为 cordis_define 的 code.host 参数。
return {
  apply(ctx) {
    const skills = ctx.get('skills');
    if (skills !== undefined) {
      ctx.effect(() => skills.register({
        name: 'rich-ui-cards',
        description: 'Present structured data with ui_render interactive cards (table, 8 chart types, JSON tree) instead of markdown tables or code blocks, and collect user inputs with the prefilled ui_form confirm dialog instead of repeated questions. Use whenever the session has ui_render/ui_form tools available and the response contains comparison, statistics, ranking, distribution, trend, or any list/array data.',
        content: [
          '# Rich UI Cards: ui_render / ui_form Conventions',
          '',
          '## Hard rules',
          '',
          '1. **Never output a markdown table** when `ui_render` exists in the tool catalog. Call `ui_render kind=table` instead.',
          '2. **Never dump JSON in a code block** when the data is nested or larger than a few lines. Call `ui_render kind=json` (collapsible tree).',
          '3. **Never fire ask_user_question in a loop** to gather multiple parameters. Send ONE `ui_form` with every field prefilled via `default` (put your best inference there), then act on the confirmed values in a single follow-up call.',
          '4. Text answers stay text. Cards are for DATA, not for prose.',
          '',
          '## Chart type selection',
          '',
          '| Data shape | kind / chart.type |',
          '| --- | --- |',
          '| Rows of records (files, repos, processes, results) | `table` |',
          '| Compare categories by one measure | `bar` (add `stacked:true` for part-to-whole across series) |',
          '| Trend over time / ordered sequence | `line` (use `area` when cumulative volume matters) |',
          '| Part-to-whole proportions | `pie` / `donut` (donut shows the total in the center) |',
          '| xy correlation (no natural labels) | `scatter` with `series[].points:[{x,y}]` |',
          '| Progress / completion / single-dimension bars | `progress` |',
          '| Deep or wide nested JSON (API response, tree) | `json` |',
          '',
          'Rules of thumb: numbers render right-aligned automatically, so keep numeric columns numeric (not strings). Tables fold past 12 rows — send all rows anyway. Label axes/categories with short strings (10 chars or fewer render best).',
          '',
          '## ui_form conventions',
          '',
          '- Prefill EVERY field with your best inference; the user should be able to just click the confirm button.',
          '- `fields: []` equals a pure confirmation dialog ("about to run X, proceed?").',
          '- Use it before any destructive or parameter-heavy call (commands with flags, file writes, API requests).',
          '- Return values arrive as `{status:"confirmed",values:{...}}` — use them verbatim in the next call; do not re-ask.',
          '',
          '## Mixed responses',
          '',
          'A response may combine: one short lead-in sentence in text + one `ui_render` card + (if action is needed) one `ui_form`. Do not narrate the card contents in text afterwards — the card IS the presentation.'
        ].join('\n')
      }));
    }

    const pendingForms = new Map();

    const lenient = (v) => {
      if (typeof v !== 'string') return v;
      try { return JSON.parse(v); } catch (e) { return v; }
    };

    const summarize = (args) => {
      if (!args) return '已渲染卡片';
      if (args.kind === 'table') {
        const rows = lenient(args.rows);
        const rows2 = Array.isArray(rows) ? rows.length : 0;
        const cols = Array.isArray(args.columns) ? args.columns.length : 0;
        return '已向用户渲染表格' + (args.title ? '「' + args.title + '」' : '') + '：' + rows2 + ' 行 × ' + cols + ' 列（交互式卡片，无需再输出 markdown 表格）';
      }
      if (args.kind === 'chart') {
        const c = args.chart || {};
        const n = Array.isArray(c.labels) ? c.labels.length : 0;
        const s = Array.isArray(c.series) ? c.series.length : 0;
        const extra = c.type === 'bar' && c.stacked ? '（堆叠）' : '';
        return '已向用户渲染 ' + (c.type || 'bar') + ' 图' + extra + (args.title ? '「' + args.title + '」' : '') + '：' + n + ' 个类目 × ' + s + ' 个系列';
      }
      return '已向用户渲染 JSON 树' + (args.title ? '「' + args.title + '」' : '');
    };

    const renderTool = harness.defineTool({
      name: 'ui_render',
      description: '向用户展示数据的富视图卡片（表格 / 图表 / JSON 树）。当需要呈现结构化数据、统计结果、对比列表时用它，而不是在回复里输出 markdown 表格或代码块。只传数据，不传代码。kind=table 需要 columns（每项 {key,label}）与 rows（对象数组）；kind=chart 需要 chart={type:"bar"|"line"|"area"|"scatter"|"pie"|"donut"|"progress", labels, series:[{name,values:[number]}]}，其中 bar 可加 stacked:true 变堆叠柱状图，scatter 的 series 用 points:[{x,y}] 代替 values；kind=json 需要 data（任意 JSON，渲染为可折叠树）。',
      parameters: {
        type: 'object',
        required: ['kind'],
        properties: {
          kind: { type: 'string', enum: ['table', 'chart', 'json'], description: '展示类型' },
          title: { type: 'string', description: '卡片标题' },
          description: { type: 'string', description: '标题下的一行说明' },
          columns: { type: 'array', description: 'table：列定义', items: { type: 'object', required: ['key'], properties: { key: { type: 'string', description: '取值字段名' }, label: { type: 'string', description: '表头显示名' } } } },
          rows: { type: 'array', description: 'table：行数据（对象数组，键与 columns.key 对应）', items: { type: 'object', description: '一行数据对象' } },
          chart: { type: 'object', description: 'chart：图表定义', properties: { type: { type: 'string', enum: ['bar', 'line', 'area', 'scatter', 'pie', 'donut', 'progress'] }, stacked: { type: 'boolean', description: 'bar 专用：堆叠柱状图' }, labels: { type: 'array', items: { type: 'string' } }, series: { type: 'array', items: { type: 'object', required: ['values'], properties: { name: { type: 'string' }, values: { type: 'array', items: { type: 'number' } }, points: { type: 'array', description: 'scatter 专用：[{x,y}] 坐标点', items: { type: 'object', required: ['x', 'y'], properties: { x: { type: 'number' }, y: { type: 'number' } } } } } } } } },
          data: { oneOf: [{ type: 'string' }, { type: 'number' }, { type: 'boolean' }, { type: 'null' }, { type: 'object', additionalProperties: true }, { type: 'array', items: { type: 'object', additionalProperties: true } }], description: 'json：任意 JSON 数据（对象/数组/标量皆可）' }
        }
      },
      output: {
        schema: { type: 'json' },
        render: (args, value) => [{ type: 'text', text: summarize(args) }]
      },
      execute: async (args) => {
        if (args.kind === 'table') {
          if (!Array.isArray(args.columns) || args.columns.length === 0) throw new Error('kind=table 需要 columns（非空数组，每项 {key,label}）');
          const rows = lenient(args.rows);
          if (!Array.isArray(rows)) throw new Error('kind=table 需要 rows（对象数组）');
        } else if (args.kind === 'chart') {
          const c = args.chart;
          if (!c || !Array.isArray(c.series) || c.series.length === 0) throw new Error('kind=chart 需要 chart.series（非空数组）');
          for (const s of c.series) {
            if (c.type === 'scatter') {
              if (!s || !Array.isArray(s.points)) throw new Error('scatter 的 series 每项必须含 points:[{x,y}]');
            } else if (!s || !Array.isArray(s.values)) {
              throw new Error('chart.series 每项必须含 values 数字数组（scatter 用 points）');
            }
          }
        } else if (args.kind === 'json') {
          if (!('data' in args)) throw new Error('kind=json 需要 data 字段');
        } else {
          throw new Error('kind 必须是 table | chart | json');
        }
        return { ok: true, kind: args.kind };
      }
    });

    const formTool = harness.defineTool({
      name: 'ui_form',
      description: '向用户展示一个预填好的表单并阻塞等待确认。把你能推断的最佳默认值写进每个字段的 default；用户修改后点「确认」，工具返回 {status:"confirmed",values:{...}}；点「取消」返回 {status:"cancelled"}。用于在发起调用（如执行命令、写文件、请求外部接口）之前一次性收集/确认多个参数，避免用提问工具连环追问。fields 可为空数组，此时等价于纯确认对话框。',
      parameters: {
        type: 'object',
        required: ['title', 'fields'],
        properties: {
          title: { type: 'string', description: '表单标题' },
          description: { type: 'string', description: '表单上方的说明文字（解释将用它确认后的值做什么）' },
          confirmLabel: { type: 'string', description: '确认按钮文字，默认「确认」' },
          cancelLabel: { type: 'string', description: '取消按钮文字，默认「取消」' },
          fields: { type: 'array', description: '字段定义；空数组 = 纯确认对话框', items: { type: 'object', required: ['name'], properties: { name: { type: 'string', description: '字段名（返回值 values 的键）' }, label: { type: 'string', description: '显示标签' }, type: { type: 'string', enum: ['text', 'number', 'select', 'boolean', 'multiline'], description: '控件类型，默认 text' }, default: { oneOf: [{ type: 'string' }, { type: 'number' }, { type: 'boolean' }, { type: 'null' }], description: '预填默认值（尽量给出最佳推断，让用户只需确认）' }, options: { type: 'array', description: 'select 的选项列表', items: { type: 'object', required: ['value'], properties: { value: { oneOf: [{ type: 'string' }, { type: 'number' }] }, label: { type: 'string' } } } }, required: { type: 'boolean', description: '是否必填' }, placeholder: { type: 'string' }, help: { type: 'string', description: '字段下方提示' } } } }
        }
      },
      output: {
        schema: { type: 'json' },
        render: (args, value) => {
          let text;
          try { text = value === undefined || value === null ? 'null' : JSON.stringify(value); } catch (e) { text = 'null'; }
          return [{ type: 'text', text: text }];
        }
      },
      execute: (args, exec) => new Promise((resolve, reject) => {
        const entry = { settled: false };
        entry.settle = (v) => { if (entry.settled) return; entry.settled = true; pendingForms.delete(exec.callId); resolve(v); };
        entry.fail = (e) => { if (entry.settled) return; entry.settled = true; pendingForms.delete(exec.callId); reject(e); };
        pendingForms.set(exec.callId, entry);
        while (pendingForms.size > 32) {
          const oldestKey = pendingForms.keys().next().value;
          const oldest = pendingForms.get(oldestKey);
          pendingForms.delete(oldestKey);
          if (oldest && !oldest.settled) oldest.fail(new Error('表单已过期（并发表单超过上限）'));
        }
        const onAbort = () => entry.fail(new Error('表单已取消：会话回合被中断'));
        if (exec.signal.aborted) onAbort();
        else exec.signal.addEventListener('abort', onAbort);
      })
    });

    const offSubmit = harness.handle('aui-form-submit', async (req) => {
      const callId = req && req.callId;
      const entry = pendingForms.get(callId);
      if (!entry) return { ok: false, error: '表单不存在或已结束' };
      if (req.action === 'confirm') entry.settle({ status: 'confirmed', values: (req && req.values) || {} });
      else if (req.action === 'cancel') entry.settle({ status: 'cancelled' });
      else return { ok: false, error: 'action 必须是 confirm 或 cancel' };
      return { ok: true };
    });

    ctx.effect(() => harness.registerTool(ctx, renderTool));
    ctx.effect(() => harness.registerTool(ctx, formTool));
    ctx.effect(() => offSubmit);
    ctx.effect(() => () => {
      for (const entry of pendingForms.values()) entry.fail(new Error('插件已停止，表单作废'));
      pendingForms.clear();
    });
  }
}
