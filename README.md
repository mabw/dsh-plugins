# dsh-plugins

DeepSeek Harness 插件合集仓库——一个仓库，多个独立插件包，按需单独安装。

## 插件

### [aui-render](packages/aui-render) · 富 UI 工具

`ui_render`（表格 / 8 种图表 / JSON 树交互卡片，替代 markdown 输出）+ `ui_form`（预填确认表单）+ 内置 `rich-ui-cards` 路由技能（随插件自动分发）。

```bash
dsh plugin --profile web add github:mabw/dsh-plugins/packages/aui-render
```

详见其 [README](packages/aui-render/README.md) 与 [中文快速上手](packages/aui-render/docs/quickstart.zh.md)。

### [assistant-launcher](packages/assistant-launcher) · 快捷助手启动器

Composer 单按钮溢出菜单：11 个预置身份的助手（运维/研究员/代码审计/架构师…），点击即创建**可续聊子代理**（独立身份/工具/上下文）并跳转至其会话直接对话；支持分组搜索、点外关闭。

```bash
dsh plugin --profile web add github:mabw/dsh-plugins/packages/assistant-launcher
```

### [tasknav](packages/tasknav) · 任务导航与决策记忆

面向运营工作流的任务树：`task_tree` 工具 + composer 上方**可折叠 dock**（五态徽章、已决策/待决策区分展示、点击聚焦、CLI 记录）；聚焦任务的决策链经 `agent/pre-step` 每步注入——长会话与压缩后不遗忘已定内容；`.tasknav/` 文件持久化，重启不丢。

```bash
dsh plugin --profile web add github:mabw/dsh-plugins/packages/tasknav
```

### [brand-wordmark](packages/brand-wordmark) · 自定义左上角品牌标识

把 Web 界面左上角的 DeepSeek Harness 原生字标替换为 **TARS 机器人 SVG logo + 自定义文案**（默认「AI原生工作平台」），覆盖侧边栏展开/折叠/窄栏三种状态；纯 CSS 实现、属性子串选择器不随构建哈希漂移，点击行为（新建会话）不变。

```bash
dsh plugin --profile web add github:mabw/dsh-plugins/packages/brand-wordmark
```

四个插件相互独立，可单独安装；组合安装时助手会话同样拥有卡片渲染能力（工具全局注册）。

## 安装说明

### 远程安装（推荐，自包含）

```bash
dsh plugin --profile web add github:mabw/dsh-plugins/packages/<包名>
```

git 规格会被 pnpm 真实克隆进全局 store 再拷贝进 profile `node_modules`，装完即自包含，与源码目录位置无关。

### 本地开发安装（边改边看）

```bash
# 在本仓库根目录执行；file: + ./ 前缀缺一不可
dsh plugin --profile web add file:./packages/tasknav
```

- **必须带 `./` 前缀**：`dsh plugin add` 的 `anchorPathSpec` 只重锚以 `.` / `..` 开头的相对路径。裸 `packages/tasknav` 会被 pnpm 解析成相对 profile 目录（`~/.dsh/profiles/web/packages/tasknav`），建出死链且安装表面"成功"，之后 reconcile 读不到 `dsh.bundle`，插件静默不生效。
- `file:` 走拷贝（自包含、可被 reconcile 正常登记，但源码改动需重跑 add）；`link:` 走软链（改动即时生效，但 ESM 从源码真实路径解析，依赖仓库根的 `node_modules`——本仓库根已声明 `@deepseek-ai/dsh-tools` devDependency 供此场景）。

### 依赖约定（对齐 dsh-better-sidebar）

`@deepseek-ai/dsh-tools` 等运行时包一律声明为 **peerDependencies**，绝不放 dependencies：

- dsh 通过 `~/.dsh/profiles/node_modules/` 共享 store 向所有静态插件提供全部运行时包（指向当前 dsh 安装）；peer 依赖经普通父级查找命中它，永远跟随运行中的 dsh 版本。
- 放 dependencies 会让 pnpm 去 registry 拉一份固定副本：registry 缺该版本/镜像不同步时直接安装失败，装上了也会与运行时版本漂移。

### 其他

- `dsh plugin add` 自动注册 bundle（声明 `dsh.bundle` 的包无需手动改配置），`dsh web` 重启生效
- 更新：`dsh plugin --profile web update <包名>`；卸载：`dsh plugin --profile web remove <包名>`
- 本仓库包均无构建脚本，git 安装直接成功

## License

MIT
