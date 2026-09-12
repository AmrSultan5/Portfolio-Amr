export const qa: [string, string][] = [
  ['What do you build?', 'Web apps, AI agents and LLM systems, Android apps. React and TypeScript on FastAPI.'],
  ['Shipped AI in production?', 'Yes — a multi-persona assistant inside a multinational FMCG company, on the Claude API.'],
  ['How good is your retrieval?', '100% accuracy on the UniGuideAI evaluation set, built with LangChain and LangGraph.'],
  ['How fast can we start?', 'A scope call this week. Something you can click, on a real URL, the week after.'],
];

export const stats = [
  {
    value: '228',
    label: 'Automated data-quality rules running in production',
  },
  {
    value: '100%',
    label: 'Retrieval accuracy on the UniGuideAI evaluation set',
    accent: true,
  },
  {
    value: '3',
    label: 'Model tiers routed for cost control: Haiku, Sonnet, Opus',
  },
];

export const capabilities = [
  {
    index: '01',
    title: 'Web applications',
    body: 'React/TypeScript frontends on FastAPI backends. Auth, dashboards, admin panels, database design, deployment. From an idea to something running on a real URL.',
    accent: false,
  },
  {
    index: '02',
    title: 'AI agents & LLM systems',
    body: 'RAG pipelines, multi-agent orchestration, MCP integrations, tool-using agents, document Q&A, natural-language analytics. Built on the Anthropic Claude API and OpenAI, with LangChain and LangGraph. Includes the unglamorous production parts: model routing for cost control, evaluation, retrieval quality, guardrails.',
    accent: true,
  },
  {
    index: '03',
    title: 'Android apps',
    body: 'Cross-platform mobile in React Native, Android-first: offline-capable, device integrations, clean modern UI.',
    accent: false,
  },
];

export const stack = [
  { label: 'Languages', value: 'Python · TypeScript / JavaScript · SQL' },
  { label: 'Backend', value: 'FastAPI · SQLAlchemy · PostgreSQL · REST APIs · Redis' },
  { label: 'Frontend', value: 'React · TypeScript · Tailwind CSS · Three.js' },
  {
    label: 'AI / ML',
    value: 'Anthropic Claude API · OpenAI · LangChain · LangGraph · RAG · vector search · MCP · prompt engineering · evaluation',
    accent: true,
  },
  { label: 'Mobile', value: 'React Native · Android' },
  {
    label: 'Data & cloud',
    value: 'Azure Container Apps · Azure PostgreSQL · Azure OpenAI Service · Databricks · Azure Data Factory · Power BI · Docker · Git / Azure DevOps',
  },
];

export const process = [
  {
    step: 'Step 01',
    title: 'Scope call',
    body: 'One call to pin down the problem, the constraints, and what "done" means. You get a written scope and a fixed timeline.',
    accent: true,
  },
  {
    step: 'Step 02',
    title: 'Prototype in days',
    body: 'Something running you can click, not a slide deck. Deployed to a real URL in the first week.',
  },
  {
    step: 'Step 03',
    title: 'Iterate with you',
    body: 'Short cycles, visible progress, direct messaging. You see every build before it ships.',
  },
  {
    step: 'Step 04',
    title: 'Deploy and hand over',
    body: 'Containerized deployment, repository access, and documentation your own team can pick up. No lock-in on me.',
  },
];
