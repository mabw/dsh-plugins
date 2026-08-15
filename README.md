# dsh-aui-render

DeepSeek Harness 富 UI 插件：**ui_render**（表格 / 8 种图表 / JSON 树交互卡片，替代 markdown 输出）+ **ui_form**（预填表单，用户一次确认后返回取值）+ **内置 rich-ui-cards skill**（自动路由结构化数据到卡片的家规，随插件分发、无需单独安装）。

零运行时依赖（纯 React + SVG），自动跟随明暗主题（`--dsw-alias-*` 令牌）。

## Skill 分发机制（回答"如何随插件一并分发 skill"）

插件激活时通过官方 skill 注册 API（`ctx.skills.register()`）把 `skills/rich-ui-cards/SKILL.md` 的内容注册进会话技能目录——**装了插件就有 skill，卸载/停用插件 skill 自动消失**，目标机器无需手动拷贝任何文件。`SKILL.md` 同时随包发布，仅供人工阅读和（可选的）项目级覆盖（项目目录 `.dsh/skills/` 的同名 skill 优先级高于插件注册的运行时条目）。

## 提供的工具

| 工具 | 用途 |
|---|---|
| `ui_render` | `kind=table` 交互表格（数字列右对齐、>12 行折叠、悬停全文）；`kind=chart` 8 种图：bar / bar+stacked / line / area / scatter / pie / donut / progress；`kind=json` 可折叠语法着色 JSON 树。卡片右上角 JSON⇄卡片切换。 |
| `ui_form` | 预填表单（text/number/select/boolean/multiline），确认返回 `{status:"confirmed",values}`，取消返回 `{status:"cancelled"}`；`fields:[]` 即纯确认对话框。用于替代连环提问。 |

## 安装

### 方式 A · 从 GitHub 安装（推荐）

```bash
dsh plugin --profile web add github:mabw/dsh-aui-render
# 等价写法：dsh plugin --profile web add git+https://github.com/mabw/dsh-aui-render.git

dsh web   # 重启，插件 + skill 一起生效
```

`dsh plugin add` 安装后会自动把声明了 `dsh.bundle` 的包注册进 profile 的 bundle 列表（无需手动改任何文件），并随 profile 每次启动自动加载。更新用 `dsh plugin --profile web update dsh-aui-render`。

> 本包无构建脚本，git 安装直接成功。若未来版本增加了 prepare 构建脚本且 pnpm 拦截，按 dsh 提示把对应 key 加进 `~/.dsh/profiles/web/pnpm-workspace.yaml` 的 `allowBuilds` 后重跑即可。

### 方式 B · 本地路径安装（离线 / 开发调试）

```bash
dsh plugin --profile web add /absolute/path/to/dsh-aui-render
# 相对路径会自动锚定到当前所在目录，写 ./dsh-aui-render 也可以

dsh web
```

### 方式 C · 会话内动态注册（零安装，即用即走）

先把仓库拉下来（`git clone https://github.com/mabw/dsh-aui-render.git`），然后在任意 DSH 会话里对 Agent 说（源码见 `dynamic/` 目录两个文件，内容原样作为 cordis_define 的 code.host / code.client 参数）：

```
请用 cordis_define 定义一个插件：idPrefix 用 aui，
code.host 取 dynamic/host.js 文件内容，code.client 取 dynamic/client.js 文件内容，
然后 cordis_run 激活（浏览器 UI 需要你在 Run 卡片上批准一次）。
```

动态版仅存活于当前 DSH 进程，重启后需重新定义；方式 A/B 随 profile 持久加载。

## 包结构

```
dsh-aui-render/
├── package.json       # dsh.bundle.patch + dsh.client 元数据
├── cordis.patch.yml   # 组合补丁：挂载 host 半（id: aui-render）
├── lib/
│   ├── index.js       # Host 半：defineTool 注册 ui_render/ui_form + connection.rpc 表单回调 + ctx.skills.register 内置 skill
│   └── client.js      # Client 半：tool.call.toolview 两个 key 的卡片渲染器
├── skills/
│   └── rich-ui-cards/SKILL.md  # 内置 skill 源文件（插件运行时自动注册）
├── dynamic/           # 动态插件版源码（cordis_define 直接可用，skill 已内嵌）
│   ├── host.js
│   └── client.js
├── LICENSE
└── README.md
```

## 行为要点

- **数据持久化**：卡片只存声明式 JSON 参数（随会话日志），渲染走当前代码——升级插件后历史卡片自动用新渲染器重绘。
- **宽容解析**：Host/Client 双侧对被桥接层字符串化的参数做 `JSON.parse` 还原。
- **表单生命周期**：挂起等待用户点击；会话回合中断（abort signal）自动作废；并发上限 32 个。
- **清理**：Host 侧工具注册/RPC/挂起表单、Client 侧 Slot 注册/样式标签全部随插件停用回收。

## 版本

- 0.6.0 — 对应动态插件 aui-1/pkg-6（含环形图内圈弧修复、单类目 100% 修复、散点/面积/堆叠柱状图）。
