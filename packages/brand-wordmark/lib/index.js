// dsh-brand-wordmark — Host half (static Cordis plugin)
// 纯客户端 CSS 插件：所有品牌替换工作都在 lib/client.js 里完成
// （守卫式 <style> 标签注入，无插槽、无服务、无 RPC）。
// Host 半边是刻意的 no-op，仅为满足 bundle 行的 Node 侧装载。
const name = "dsh-brand-wordmark";
const inject = [];

function apply(_ctx) {}

export { name, inject, apply };
