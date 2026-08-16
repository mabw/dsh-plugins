# dsh-tasknav

DeepSeek Harness 任务导航与决策记忆插件：面向运营工作流（选料 → 加工 → 编排 → 配置发布等），把流程做成**可点击的任务树**，决策落档、话题锁定、压缩免疫。

## 与 todo 工具的区别

| | todo_write | tasknav |
|---|---|---|
| 模型备忘 | ✅ | ✅ |
| 用户可见可点击 | ❌ | ✅ composer 上方可折叠 dock |
| 决策记录（不可重议） | ❌ | ✅ decide 落档 + 时间戳 |
| 待决策问题登记 | ❌ | ✅ pend，UI 虚线徽章 |
| 话题锁定 | ❌ | ✅ 点击聚焦 → 每步注入焦点上下文 |
| CLI 命令挂载 | ❌ | ✅ 每节点 cliCommand/cliResult |
| 压缩后幸存 | ❌ | ✅ agent/pre-step 每步重新注入 |
| 重启后幸存 | — | ✅ `.tasknav/` 文件持久化（JSON+MD 双写） |

## 功能

- **task_tree 工具**：create / add(parentId) / update / decide / pend / remove / tree；五态：pending ○ / active ◆ / running ⟳ / done ✓（划线）/ blocked ✗
- **可折叠 dock**：composer 上方；展开=树+详情面板（内部滚动），折叠=单行摘要条（`▸ 任务导航 · 7 个任务 · 聚焦: 改标题`），不遮挡会话流
- **决策区分展示**：绿色实心「已决策 N」（悬停看全文+时间）vs 虚线「待决策 N」
- **聚焦即话题锁**：点击节点 → 高亮 + chip；此后每一步模型请求，`agent/pre-step` 都注入「焦点任务详情 + 全树缩略 + 决策不可重议规则」——长会话/压缩后依然记得已定内容
- **持久化**：每次变更双写 `.tasknav/tree.json`（数据）与 `.tasknav/tree.md`（人读版，含全部决策日志）；`TASKNAV_HOME` 环境变量可改目录

## 安装

```bash
dsh plugin --profile web add github:mabw/dsh-plugins/packages/tasknav
dsh web
```

## 模型侧用法（自动生效）

装好后模型获得 `task_tree` 工具与系统规则：用户每次决策后立即 `decide` 落档；向用户提问前 `pend` 登记；聚焦任务的决策链每步自动进入上下文，无需人工提醒。

## 依赖

Host 半注入 `connection` / `tools`；Client 半注入 connection / slots，注册于 `conversation.input.dock`。

## License

MIT
