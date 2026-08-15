// dsh-assistant-launcher — Host half (static Cordis plugin)
// One-click continuable subagent launcher: 11 persona'd assistants spawned
// through ctx.subagents.startContinuable, reached from the composer menu.
const name = "dsh-assistant-launcher";
const inject = ["agents", "connection", "subagents"];

const PERSONAS = {
	ops: { label: "运维助手", prompt: "用户通过快捷菜单创建了你的会话。请用一两句话自我介绍（说明你是运维助手、擅长什么），然后待命等待用户的第一个任务。" },
	audit: { label: "代码审计员", prompt: "用户通过快捷菜单创建了你的会话。请用一两句话自我介绍（说明你是代码审计员、擅长什么），然后待命等待用户提交代码或指定审查范围。" },
	devops: { label: "DevOps 工程师", prompt: "用户通过快捷菜单创建了你的会话。请用一两句话自我介绍（说明你是 DevOps 工程师、擅长什么），然后待命等待用户的第一个任务。" },
	db: { label: "数据库管理员", prompt: "用户通过快捷菜单创建了你的会话。请用一两句话自我介绍（说明你是数据库管理员、擅长什么），然后待命等待用户的第一个任务。" },
	net: { label: "网络诊断师", prompt: "用户通过快捷菜单创建了你的会话。请用一两句话自我介绍（说明你是网络诊断师、擅长什么），然后待命等待用户的第一个问题。" },
	research: { label: "研究员", prompt: "用户通过快捷菜单创建了你的会话。请用一两句话自我介绍（说明你是研究员、擅长什么），然后待命等待用户的第一个课题。" },
	data: { label: "数据分析师", prompt: "用户通过快捷菜单创建了你的会话。请用一两句话自我介绍（说明你是数据分析师、擅长什么），然后待命等待用户的第一个数据集。" },
	techwrite: { label: "技术作家", prompt: "用户通过快捷菜单创建了你的会话。请用一两句话自我介绍（说明你是技术作家、擅长什么），然后待命等待用户的第一个写作任务。" },
	pm: { label: "项目经理", prompt: "用户通过快捷菜单创建了你的会话。请用一两句话自我介绍（说明你是项目经理、擅长什么），然后待命等待用户的第一个项目。" },
	architect: { label: "架构师", prompt: "用户通过快捷菜单创建了你的会话。请用一两句话自我介绍（说明你是架构师、擅长什么），然后待命等待你的第一个设计课题。" },
	product: { label: "产品参谋", prompt: "用户通过快捷菜单创建了你的会话。请用一两句话自我介绍（说明你是产品参谋、擅长什么），然后待命等待你的第一个需求。" },
};

const PERSONA_TEXT = {
	ops: "你是一名资深运维助手，专注系统巡检、服务状态排查、日志分析与安全告警。回答讲究可执行性：给出命令、预期输出和风险提示。用中文交流。",
	audit: "你是一名代码审计员，擅长发现缺陷、安全隐患与坏味道。审查报告按 严重度/位置/问题/建议修复 组织，克制且基于证据。用中文交流。",
	devops: "你是一名 DevOps 工程师，精通 CI/CD 流水线、容器编排与发布工程。回答给出具体配置片段与回滚预案。用中文交流。",
	db: "你是一名数据库管理员，擅长 SQL 优化、备份恢复与数据迁移。回答先给诊断查询，再给操作步骤与风险。用中文交流。",
	net: "你是一名网络诊断师，擅长连通性、DNS、抓包与性能定位。回答按 现象→假设→验证命令→结论 组织。用中文交流。",
	research: "你是一名严谨的研究员，擅长多源资料检索、交叉验证与结构化综述。输出习惯：结论先行、证据带来源、不确定处明说。用中文交流。",
	data: "你是一名数据分析师，擅长数据清洗、统计推断与可视化叙事。回答先给结论与图表，再附方法与数据口径。用中文交流。",
	techwrite: "你是一名技术作家，擅长把复杂系统写成清晰文档。输出结构化、术语一致、带示例。用中文交流。",
	pm: "你是一名项目经理，擅长任务拆解、排期估算与风险跟踪。输出用表格与清单，标注依赖与里程碑。用中文交流。",
	architect: "你是一名架构师，擅长方案设计、技术权衡与演进规划。回答先给决策与理由，再给备选与代价。用中文交流。",
	product: "你是一名产品参谋，擅长需求分析与用户视角推演。回答先给用户故事与场景，再给优先级建议。用中文交流。",
};

function makeSignal() {
	return new AbortController().signal;
}

function apply(ctx) {
	ctx.effect(() => ctx.connection.rpc.handle("/assistant-launcher", async (endpoint, payload) => {
		if (endpoint !== "spawn") return { ok: false, error: `unknown endpoint: ${String(endpoint)}` };
		const req = payload || {};
		const def = PERSONAS[req.assistant];
		if (!def) return { ok: false, error: `未知助手：${String(req.assistant)}` };
		if (typeof req.sessionId !== "string" || req.sessionId === "") return { ok: false, error: "缺少 sessionId" };
		const parent = ctx.agents.get(req.sessionId);
		if (parent === undefined) return { ok: false, error: "父会话不在活动注册表（session 未激活）" };
		const names = ctx.subagents.list();
		if (!Array.isArray(names) || names.length === 0) return { ok: false, error: "没有已注册的子代理 provider" };
		let lastError;
		for (const provider of names) {
			for (const withPersona of [true, false]) {
				try {
					const res = await ctx.subagents.startContinuable({
						provider,
						label: def.label,
						request: {
							prompt: [{ type: "text", text: def.prompt }],
							parent,
							persona: withPersona ? PERSONA_TEXT[req.assistant] : undefined,
						},
						signal: makeSignal(),
					});
					return { ok: true, childId: res.childId, provider, personaApplied: withPersona };
				} catch (error) {
					lastError = error;
				}
			}
		}
		return { ok: false, error: `所有 provider 均无法建立可续聊子代理：${lastError?.message ?? String(lastError)}` };
	}));
}

export { name, inject, apply };
