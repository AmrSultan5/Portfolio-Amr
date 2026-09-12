export interface Project {
  meta: string;
  tag: string;
  title: string;
  summary: string;
  stackLine: string;
  stack: string[];
  problem: string;
  built: string;
  result: string;
  featured?: boolean;
}

export const projects: Project[] = [
  {
    meta: 'Thesis project · Higher education',
    tag: '01 — Thesis project',
    title: 'UniGuideAI — agentic academic guidance',
    summary:
      'An agentic system that answers student academic questions from university regulations and course data. Built with LangChain, LangGraph, and RAG. Achieved 100% retrieval accuracy on the evaluation set.',
    stackLine: 'LangGraph · RAG · Python · agents',
    stack: ['LangGraph', 'LangChain', 'RAG', 'Python', 'agents'],
    problem:
      "Students hunt through university regulations and course data to answer basic academic questions. The answers exist, they're just buried in documents nobody wants to read.",
    built:
      "An agentic system that routes a student's question to the right retrieval path over university regulations and course data, then answers from those sources. LangChain for the retrieval layer, LangGraph for the agent graph and control flow, with an evaluation set used to tune retrieval.",
    result: '100% retrieval accuracy on the evaluation set.',
    featured: true,
  },
  {
    meta: 'Enterprise · In production',
    tag: '02 — Enterprise · in production',
    title: 'Multi-persona AI business assistant',
    summary:
      "An internal AI assistant with distinct expert personas, each grounded in the company's own rule and SAP documentation repositories. I migrated the backend from OpenAI to the Anthropic API and built tiered model routing across Haiku, Sonnet, and Opus to cut cost while preserving answer quality.",
    stackLine: 'Claude API · RAG · FastAPI · SQLAlchemy · model routing',
    stack: ['Claude API', 'RAG', 'FastAPI', 'SQLAlchemy', 'model routing'],
    problem:
      "Internal teams needed answers grounded in the company's own rule and SAP documentation repositories, from people with very different jobs. A single generic assistant answered all of them badly, and model cost scaled faster than usefulness.",
    built:
      'An internal AI assistant with distinct expert personas — data engineer, data analyst, project manager — each grounded in its own document repository. I migrated the backend from OpenAI to the Anthropic API and built tiered model routing across Haiku, Sonnet, and Opus. SQLAlchemy dual-engine persistence, a rolling chat-history window, per-project instruction memory, and a guided onboarding tour.',
    result:
      'Cost per request cut through tiered routing while answer quality held. Running in production, used by internal teams.',
    featured: true,
  },
  {
    meta: 'Enterprise · In production',
    tag: '03 — Enterprise · in production',
    title: 'Customer data quality agent',
    summary:
      '228 automated data-quality rules enforced against customer master data, with a dark enterprise dashboard for reviewing and resolving violations.',
    stackLine: 'Python · data quality · React',
    stack: ['Python', 'data quality', 'agents', 'React'],
    problem:
      'Customer master data drifts. Broken records move downstream long before anyone notices them.',
    built:
      'A rule-driven agent enforcing 228 automated data-quality rules against customer master data, with a dark enterprise dashboard for reviewing and resolving violations.',
    result: '228 rules enforced automatically, with one review surface for resolving violations.',
  },
  {
    meta: 'Enterprise · In production',
    tag: '04 — Enterprise · in production',
    title: 'AI-powered e-learning platform',
    summary: 'A full e-learning application built with a team of four, deployed on Azure Container Apps.',
    stackLine: 'React · TypeScript · FastAPI · Azure',
    stack: ['React', 'TypeScript', 'FastAPI', 'Azure PostgreSQL', 'Azure Container Apps'],
    problem:
      'A full e-learning product for enterprise use, delivered by a team of four on enterprise cloud infrastructure.',
    built:
      'React/TypeScript frontend, FastAPI backend, Azure PostgreSQL, Azure OpenAI, deployed on Azure Container Apps. I built the frontend authentication experience and worked on the container architecture and service connectivity.',
    result: 'Deployed and running on Azure Container Apps.',
  },
  {
    meta: 'Product',
    tag: '05 — Product',
    title: 'Natural-language analytics for spreadsheets',
    summary:
      'Upload a CSV or Excel file and ask questions in plain English; the system runs the analysis and returns charts and explanations.',
    stackLine: 'Python · LLM · data analysis',
    stack: ['Python', 'LLM', 'data analysis'],
    problem: 'People with a spreadsheet and a question have to write code, or wait for someone who can.',
    built:
      'Upload a CSV or Excel file and ask questions in plain English; the system generates and runs the analysis, then returns charts and written explanations of what it did.',
    result: 'Plain-English questions in, charts and explanations out — no code written by the user.',
  },
  {
    meta: 'Developer tool',
    tag: '06 — Developer tool',
    title: 'GitHub repository chatbot',
    summary: 'A RAG chatbot that answers questions about any GitHub codebase.',
    stackLine: 'RAG · LangChain · FastAPI',
    stack: ['RAG', 'LangChain', 'FastAPI', 'Claude API'],
    problem:
      'Getting oriented in an unfamiliar codebase means reading it end to end before you can ask a simple question.',
    built:
      'A RAG chatbot that indexes any GitHub codebase and answers questions about it, built with LangChain, FastAPI, and the Claude API.',
    result: 'Point it at a repository and ask questions about the code in plain language.',
  },
];
