# dsh-brand-wordmark

自定义 DeepSeek Harness Web 左上角品牌标识：用 **TARS 机器人 SVG logo + 自定义文案**（默认「AI原生工作平台」）替换原生鱼形字标，覆盖侧边栏**展开 / 折叠 / 窄栏**三种状态。

## 效果

| 侧边栏状态 | 左上角显示 |
|---|---|
| 展开 | TARS logo +「AI原生工作平台」 |
| 手动折叠 / 窄栏轨道 | TARS 图标，hover 时切换为原生展开箭头 |

- 点击行为不变：展开态点击仍是「新建会话」，折叠态点击仍是展开侧边栏
- 颜色全部取主题变量（`--dsw-alias-label-primary` / `currentColor`），深浅色模式自动跟随
- 纯 CSS 实现，无 Host 逻辑、无插槽占用、无 RPC，不干扰其他插件

## 安装

```bash
dsh plugin --profile web add github:mabw/dsh-plugins/packages/brand-wordmark
dsh web   # 重启生效
```

## 自定义

- **文案**：编辑 `lib/client.js` 顶部的 `TITLE`。
- **logo 形状**：编辑 `assets/tars-logo.svg`，再把新 path 的 `d` 值 URL 编码后替换 `TARS_PATH`（`encodeURIComponent` 已在代码内处理，直接粘贴 path 字符串即可）。
- **尺寸/间距**：`lib/client.js` 内 `CSS` 字符串中的 `width/height/margin-right`。

## 选择器为什么不会因升级失效

原生侧边栏使用 CSS Modules，类名哈希前缀（如 `hHd-Xa_`）随构建变化，但局部名（`brand` / `toggle` / `railFish` / `collapsed`）稳定。本插件全部使用 `[class*="_brand"]` 属性子串选择器，不依赖任何哈希值，DSH 升级后继续生效；仅当产品改这些局部名时才需更新。

## 依赖

无。Client 半边 `inject: []` + `immediately: true`（开机即装载）；Host 半边为 no-op。

## License

MIT
