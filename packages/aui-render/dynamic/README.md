# dynamic/ — 动态插件版源码（aui-1/pkg-6 的原样导出）

这两个文件的内容**原样**作为 `cordis_define` 的 `code.host` / `code.client` 参数（不加任何包装）。
在任意 DSH 会话中对 Agent 说：

```
请用 cordis_define 定义一个新插件：idPrefix 用 aui，
code.host 取 dsh-aui-render/dynamic/host.js 的完整文件内容，
code.client 取 dsh-aui-render/dynamic/client.js 的完整文件内容，
名称 a2ui 富展示与表单工具。然后用 cordis_run 激活（run 模式），
浏览器 UI 需要我在 Run 卡片上批准。
```

- `host.js` — Host 半：harness.defineTool 注册 ui_render / ui_form，harness.handle 提供 aui-form-submit RPC
- `client.js` — Client 半：React/SVG 卡片渲染器（tool.call.toolview 两个 key）

注意：动态插件仅存活于当前 DSH 进程，重启后需重新定义；要持久安装请用上级目录的静态包（见 ../README.md 方式 A）。
