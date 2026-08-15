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

两个插件相互独立，可单独安装；一起安装时助手会话同样拥有卡片渲染能力（工具全局注册）。

## 安装说明

- `dsh plugin add` 自动注册 bundle（声明 `dsh.bundle` 的包无需手动改配置），`dsh web` 重启生效
- 更新：`dsh plugin --profile web update <包名>`；卸载：`dsh plugin --profile web remove <包名>`
- 本仓库包均无构建脚本，git 安装直接成功

## License

MIT
