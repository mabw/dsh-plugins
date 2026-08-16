# AGENTS.md — dsh-plugins 开发踩坑档案

> 本仓库三个 DSH 插件包（aui-render / assistant-launcher / tasknav）在动态→静态转写与静态装载过程中踩过的全部坑位。
> **新会话/新 agent 开发或修改本仓库插件前必读**——每一条都是真实事故，附根因与正确姿势。
> DSH 版本基线：0.1.0-rc.6（机制以源码查证为准，升级后需复核）。

## 一、静态插件装载契约（最容易踩、症状最迷惑）

### 1. Connection RPC 返回值是判别联合信封 ⚠️ 最贵的一课
- **契约**：成功 = `{ ok: true, value: <业务数据> }`；失败 = `{ ok: false, error: { code, message, details } }`
- **症状**：客户端 `rpc.call` 拿到的 result 被**静默剥离**——自定义字段（如 `tree`）消失，只剩 `{ok:true}`，无任何报错
- **根因**：客户端 `serverResponseSchema.parse` 是 strip 模式的 zod 联合，未知字段直接丢弃
- **正确姿势**：数据放 `value`；错误必须是对象（字符串 error 同样被剥）；客户端读 `res.value` / `res.error.message`
- **排查法**：浏览器裸 `fetch` 同端点对比 `rpc.call` 结果——RAW 完整而 rpc 被剥 = 信封问题

### 2. `connection.rpc.handle` 第三参必传
- `handle(channel, handler, options)` 的 `options.authority` **无默认值**，不传则 `Cannot read properties of undefined (reading 'authority')`，**启动即 throw**
- 传 `{ authority: "trusted-host" }`（浏览器同源页面调用可过 `isTrustedApiRequest`：本机回环 + 同 origin）

### 3. 静态客户端没有 `styles` 服务
- 动态沙箱的 `styles.insert()` 在 ModuleLoader 环境**不存在**
- **正确姿势**（dsh-better-sidebar 模式）：模块作用域守卫注入
```js
if (typeof document !== "undefined" && document.querySelector("style[data-plugin-css=...]") === null) {
  const tag = document.createElement("style");
  tag.dataset.plugin = "<pkg>"; tag.dataset.pluginCss = "<tag>";
  tag.textContent = CSS; document.head.appendChild(tag);
}
```
- **症状**：UI 出现但完全无样式（CSS 字符串在文件里但从未附加）

### 4. manifest 的 `dsh.client.inject` 决定客户端 ctx（代码里 exports.inject 不算）
- 需要 timer（轮询）就必须在 **package.json** 的 `dsh.client.inject` 里列 `@deepseek-ai/cordis-plugin-timer`
- 漏了 → `ctx.interval` undefined → 轮询静默失效

### 5. 动态客户端禁用浏览器全局
- `setInterval`/`setTimeout` 等不可用 → 必须 `inject: ['timer']` + 在 `useEffect` 内经 ctx 调用，cleanup 用返回的 disposer

### 6. RPC 通道名约束
- `CHANNEL_PATTERN = /^\/[A-Za-z0-9._~-]+$/`，`/api` 保留。`/tasknav` ✅ `/tasknav-focus` ✅（`-` 合法）

## 二、pnpm / 安装链

### 7. 包必须声明运行时依赖
- `import '@deepseek-ai/dsh-tools'` 却不在 package.json 声明 → pnpm 严格隔离下 **启动 throw ERR_MODULE_NOT_FOUND**
- 三个包都要 `dependencies: { "@deepseek-ai/dsh-tools": "^0.1.0-rc.6" }`

### 8. 本地路径安装 = symlink → ESM 沿源码路径解析
- `dsh plugin add ./packages/X` 创建的是指向源码目录的软链；ESM 解析器从**真实路径**向上找 node_modules
- **修复**：仓库根 `pnpm add @deepseek-ai/dsh-tools`（GitHub 安装无此问题，pnpm 会真克隆进 store）

### 9. 按包名安装会走 npm registry——先查重名！
- `dsh plugin add tasknav` 装到了 npm 上**同名第三方包**（无 dsh.bundle → "installed as a plain dependency" 警告）
- 我们包名带 `dsh-` 前缀：安装永远用**路径或 github: 前缀**

### 10. bundle 自动注册
- 声明 `dsh.bundle` 的包被 `dsh plugin add` 自动加进 profile bundles，**无需手动改 package.json**；无声明的包会警告且不激活

## 三、受限 React（动态客户端 + 静态 ModuleLoader 同样适用）

### 11. React API 以 Builtins 文档为准
- 可用：`createElement` / `useState` / `useEffect(effect, deps)`（**依赖数组支持**）
- 不可用：`useCallback` / `useRef`（动态沙箱）——别猜，查 `Builtin.listBuiltins`

### 12. 渲染期绝不 setState
- `React error #301`：在渲染路径调 setState（我们在渲染体里写了 `loadRef[1](load)`）→ 组件崩溃 → 插槽 `entryAbdicated` → **整个 dock 消失**
- 比对/缓存逻辑放 useEffect 闭包内的局部变量（如 `lastJson`）

### 13. useEffect 依赖数组别乱删
- 无 deps → 每次渲染后执行 → 若内部 setState → **无限循环**（Maximum update depth）→ 组件崩溃
- "deps 不支持" 曾是误诊——真因是进程重启

## 四、事件与消息边界（高危区，两次重大事故）

### 14. `UserMessage` 不是普通对象——别手搓注入
- `agent/pre-step` waterfall 可替换进入模型的 messages，但元素必须符合 **完整 wire schema**（`id`/`content`/`source` 等）
- 手搓 `{role:'user', content:[...]}` 落进会话流 → 客户端 assembler 在 replay 时 `event.data.source.kind` 崩 → **整个 Web UI 会话挂掉**（gap repair 连环崩）
- **正确姿势**：防遗忘改走工具返回值 `context` 字段；确需注入必须用官方工厂（如 `createUserMessage`）构造
- 同类：动态版曾因此炸宿主步进（`decision.kind` of undefined）——waterfall 的 `next()` 结果可能 undefined，必须透传防御

### 15. 动态 vs 静态的本质差异
| | 动态（cordis_define） | 静态（dsh plugin add） |
|---|---|---|
| 生命周期 | 进程级，重启即失 | 随 profile 持久 |
| 工具注册 | `harness.defineTool` | `defineTool` from dsh-tools |
| RPC | `harness.handle` / `host.call` | `ctx.connection.rpc.handle` / `conn.rpc.call` |
| 样式 | `styles.insert` | 守卫式 style 标签 |
| Host 事件 | 谨慎（见 #14） | `ctx.on` 可用但同样守 schema |
| pkg 切换 | Host 模块重求值，内存态清零 | 无此问题 |

### 16. 会话 id 的权威来源（别猜）
- 客户端：`props.session.sessionId`（InputZone 的 ConversationSnapshot）
- Host 工具：`exec.agent.id`
- 两端一致才能按会话隔离；全局单树会串会话（已踩）

## 五、诊断方法论（比修复本身更值钱）

### 17. 错误信息就是文档
- 动态运行时报错直接给出修法（如 setInterval 错误附 inject 指引）——**完整读完再动手**

### 18. 二分定位：curl 绕过浏览器
- `curl -X POST <origin>/<channel>/<endpoint>` 直打 RPC → 响应正确则问题在客户端；错误则在 Host
- 本次信封问题靠"RAW fetch vs rpc.call 对比"一步钉死

### 19. 会话日志可直接读
- `~/.dsh/sessions/<workspace>--/<sessionId>/session.jsonl.zstd`（`zstd -d -c` 解）
- 可验证：工具调用成败（isError）、消息 schema 是否干净、事件时序

### 20. 诊断代码的纪律
- console 诊断**独立成行**，删除时逐行删——曾因整段重写"清理诊断"而弄丢无关代码（CSS 注入）
- sandbox 内 bash 写不了 `~/.dsh`（TCC）——profile 操作引导用户终端执行

## 六、Skill / 文档分发

### 21. 插件可捆绑 skill
- `ctx.skills.register({name, description, content})`（Host apply 内，读包内 SKILL.md 去 frontmatter）
- 装了插件就有 skill，停用自动消失；项目级 `.dsh/skills/` 同名 skill 优先级更高

### 22. 本仓库约定
- 一仓三包（`packages/*`），独立安装：`dsh plugin --profile web add github:mabw/dsh-plugins/packages/<name>`
- 改动后 `node --check` 每个 host 入口 + `new vm.Script()` 校验 client + 本表核查
- 会话隔离存储：`.tasknav/tree-<sessionId>.json|.md`（dsh 进程 cwd 下）

---
*维护者注：本档案由 2026-08 会话整理，所有条目均有对应 commit 与事故现场。新增坑位请按同样格式追加（含症状/根因/姿势三要素）。*
