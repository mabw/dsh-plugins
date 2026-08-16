// dsh-brand-wordmark — Client half (web platform, module-loader format)
// 自定义左上角品牌标识：TARS 机器人 logo + 自定义文案，覆盖侧边栏
// 展开 / 折叠 / 窄栏三种状态。纯 CSS 实现（守卫式 <style> 注入），
// 无插槽、无服务、无 RPC；Host 半边（lib/index.js）为 no-op。
//
// 选择器策略：CSS Modules 哈希前缀（如 hHd-Xa_）随构建变化，
// 但局部名（brand / toggle / railFish / collapsed）稳定——
// 因此全部使用 [class*="_brand"] 属性子串选择器，DSH 升级不失效。
window.__ModuleLoader__.load({ id: "dsh-brand-wordmark", factory: (require) => {
var module = { exports: {} }; var exports = module.exports;

// ---------------------------- 配置 ----------------------------
/** 展开态标题文案 */
var TITLE = "AI原生工作平台";
/**
 * TARS logo（单路径 evenodd，眼缝为真实镂空）。
 * 源文件：assets/tars-logo.svg —— 改形状后把新 path 的 d 值
 * URL 编码替换到下面（# → %23，< > " 空格同理）。
 */
var TARS_PATH = "M5 2h14v5.5H5Z M8 4.2h3v1.5H8Z M13 4.2h3v1.5h-3Z M5.5 9h13v5.5h-13Z M6 16h12v5.5H6Z";
var TARS_MASK = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'%3E%3Cpath fill='%23000' fill-rule='evenodd' d='" + TARS_PATH + "'/%3E%3C/svg%3E";
// ------------------------------------------------------------

var MASK_DECL = [
	"  -webkit-mask-image: url(\"" + TARS_MASK + "\");",
	"  -webkit-mask-size: contain;",
	"  -webkit-mask-position: center;",
	"  -webkit-mask-repeat: no-repeat;",
	"  mask-image: url(\"" + TARS_MASK + "\");",
	"  mask-size: contain;",
	"  mask-position: center;",
	"  mask-repeat: no-repeat;",
].join("\n");

var CSS = [
	// ---- 展开态：隐藏原生鱼形字标，::before = TARS logo，::after = 文案 ----
	'[class*="_brand"] > svg { display: none !important; }',
	'[class*="_brand"]::before {',
	"  content: \"\";",
	"  flex: none;",
	"  width: 26px;",
	"  height: 26px;",
	"  margin-right: 9px;",
	"  background-color: var(--dsw-alias-label-primary);",
	MASK_DECL,
	"}",
	'[class*="_brand"]::after {',
	"  content: \"" + TITLE + "\";",
	"  font-size: 17px;",
	"  font-weight: 600;",
	"  letter-spacing: 0.02em;",
	"  color: var(--dsw-alias-label-primary);",
	"  white-space: nowrap;",
	"  line-height: 24px;",
	"}",
	// ---- 折叠/窄栏态：折叠按钮里的鱼形图标（railFish）换成 TARS ----
	'[class*="_toggle"] [class*="_railFish"] { display: none !important; }',
	'[class*="_toggle"]::before {',
	"  content: \"\";",
	"  display: none;",
	"  width: 22px;",
	"  height: 22px;",
	"  background-color: currentColor;",
	MASK_DECL,
	"}",
	'[class*="_collapsed"] [class*="_toggle"]::before { display: block; }',
	// hover 时让位给原生展开箭头（沿用产品自己的显示切换规则）
	'[class*="_collapsed"] [class*="_toggle"]:hover::before { display: none; }',
].join("\n");

var STYLE_TAG = "dsh-brand-wordmark/brand.css";
if (typeof document !== "undefined" && document.querySelector("style[data-plugin-css=" + JSON.stringify(STYLE_TAG) + "]") === null) {
	var styleTag = document.createElement("style");
	styleTag.dataset.plugin = "dsh-brand-wordmark";
	styleTag.dataset.pluginCss = STYLE_TAG;
	styleTag.textContent = CSS;
	document.head.appendChild(styleTag);
}

function apply(_ctx) {}

exports.apply = apply;
exports.inject = [];
exports.name = "dsh-brand-wordmark";
return module.exports;
} });
