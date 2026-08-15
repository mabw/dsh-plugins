# dsh-assistant-launcher

DeepSeek Harness 快捷助手启动器：composer 单按钮溢出菜单，11 个预置身份的助手，点击即创建**可续聊子代理**（独立身份/工具/上下文）并自动跳转至其会话直接对话。

## 功能

- **单按钮溢出菜单**：composer 工具行只占一格，✦ 按钮带计数徽章
- **11 个预置助手**（3 分组）：工程与运维（运维/代码审计/DevOps/DBA/网络诊断）、研究与信息（研究员/数据分析师/技术作家）、创意与规划（项目经理/架构师/产品参谋）
- **实时搜索**：按名称/特长过滤；点外部或 Esc 关闭
- **可续聊子代理**：每个助手 = 独立 durable Session + persona 身份 + 全量工具继承；进程重启后可冷恢复，会话头部目录树可见
- **创建即跳转**：选中后自动进入该助手会话，直接对话（FIFO 排队，不打扰父会话）

## 安装

```bash
dsh plugin --profile web add github:mabw/dsh-plugins/packages/assistant-launcher
dsh web   # 重启生效
```

依赖部署已启用子代理接缝（`ctx.subagents` + 至少一个 continuable-capable provider，如 in-process）；未启用时菜单会给出明确错误提示。

## 依赖

Host 半注入 `agents` / `connection` / `subagents`；Client 半注入 connection / sessions / slots，注册于 `conversation.input.left`。

## 自定义助手列表

编辑 `lib/index.js` 的 `PERSONAS` / `PERSONA_TEXT` 与 `lib/client.js` 的 `GROUPS`（保持 id 一一对应），重启即可。

## License

MIT
