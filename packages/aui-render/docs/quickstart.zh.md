<!-- 由技术作家子代理 b4fa9674 撰写，父会话补充权威安装事实后修订 -->
# dsh-aui-render 快速上手

## 一、它是什么

`dsh-aui-render` 是 DeepSeek Harness（DSH）的富 UI 插件，为对话注入两个模型工具：

- **`ui_render`**：把结构化数据渲染成交互卡片——表格、8 种图表、JSON 树；
- **`ui_form`**：弹出预填好默认值的确认表单，一次收集多个参数，替代连环追问。

插件内置 `rich-ui-cards` 技能，安装后 AI 会在遇到对比、统计、趋势类数据时自动选择卡片展示，无需手动指定。

## 二、安装

**方式 A · GitHub 安装（推荐）**

```bash
dsh plugin --profile web add github:mabw/dsh-aui-render
```

等价写法：

```bash
dsh plugin --profile web add git+https://github.com/mabw/dsh-aui-render.git
```

然后 `dsh web` 重启生效。

`dsh plugin add` 会自动把声明 `dsh.bundle` 的包注册进 profile bundle 列表，无需手动改任何文件。更新用：

```bash
dsh plugin --profile web update dsh-aui-render
```

本包无构建脚本，git 安装直接成功；若未来加 `prepare` 脚本被 pnpm 拦截，按提示把 key 加入 `~/.dsh/profiles/web/pnpm-workspace.yaml` 的 `allowBuilds` 重跑。

**方式 B · 本地路径安装（离线/调试）**

```bash
dsh plugin --profile web add /absolute/path/to/dsh-aui-render
```

相对路径自动锚定到调用目录，写 `./dsh-aui-render` 亦可。然后 `dsh web` 重启。

安装后 `dsh web` 重启，随便发一句"用表格对比 X 和 Y"——出现卡片即为成功（`ui_render`/`ui_form` 工具与 `rich-ui-cards` 技能均已就位）。

## 三、30 秒体验

无需学习任何语法——像平常一样提问，AI 会自动调用插件。试试这句：

> **你**：帮我用表格对比 Redis、Memcached、本地内存三种缓存策略的读写速度、容量和持久化能力。

**预期效果**：对话中直接出现一张交互表格卡片（长列表自动折叠、可展开全部），而不是一段 Markdown 文本。

再来一句表单体验：

> **你**：给项目初始化一个配置，参数你来建议。

**预期效果**：弹出一张预填了推荐值的表单（项目名、包管理器、TypeScript 开关等），你确认或修改后点「确认」，AI 按表单值继续执行。

## 四、常用类型速查表

`ui_render` 的 `kind` 字段取值：

| kind | 适用场景 | 备注 |
| --- | --- | --- |
| `table` | 多维对比、清单 | 需 `columns`（列定义）+ `rows` |
| `bar` | 分类数值对比 | `stacked: true` 变堆叠柱状图 |
| `line` | 时间趋势 | |
| `area` | 趋势 + 体量感 | |
| `scatter` | 两变量相关性 | series 用 `points: [{x, y}]` |
| `pie` / `donut` | 占比构成 | |
| `progress` | 进度、完成度 | |
| `json` | 配置、嵌套结构 | 渲染为可折叠树 |

`ui_form` 常用字段类型：`text` / `number` / `select` / `boolean` / `multiline`，每个字段支持 `default` 预填默认值。

## 五、卸载

```bash
dsh plugin --profile web remove dsh-aui-render
```

然后 `dsh web` 重启。
