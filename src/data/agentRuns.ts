export interface AgentStep {
  label: string;
  detail: string;
  /** Displayed duration, in ms. Not the real animation timing. */
  ms: number;
}

export interface AgentRun {
  query: string;
  model: string;
  steps: AgentStep[];
  answer: string;
  cost: string;
}

/**
 * Traces shown in the hero. Each mirrors a real capability claimed elsewhere on
 * the page — tiered routing, retrieval quality, tool use — so the panel is a
 * demonstration rather than decoration.
 */
export const agentRuns: AgentRun[] = [
  {
    query: 'Which courses can I retake next semester?',
    model: 'claude-haiku',
    steps: [
      { label: 'route', detail: 'tier 1 · haiku', ms: 38 },
      { label: 'retrieve', detail: '4 docs · score 0.91', ms: 312 },
      { label: 'synthesize', detail: 'grounded answer', ms: 640 },
    ],
    answer:
      'Any course graded below C+ may be retaken, up to twice. Registration opens in week 3.',
    cost: '$0.0021',
  },
  {
    query: 'Summarise the SAP posting rules for intercompany invoices.',
    model: 'claude-sonnet',
    steps: [
      { label: 'route', detail: 'tier 2 · sonnet', ms: 44 },
      { label: 'retrieve', detail: '11 docs · score 0.88', ms: 402 },
      { label: 'rerank', detail: 'top 4 kept', ms: 96 },
      { label: 'synthesize', detail: 'grounded answer', ms: 910 },
    ],
    answer:
      'Intercompany invoices post to clearing account 194000, with the partner code set on both sides.',
    cost: '$0.0094',
  },
  {
    query: 'Which customer records failed validation this week?',
    model: 'claude-haiku',
    steps: [
      { label: 'route', detail: 'tier 1 · haiku', ms: 31 },
      { label: 'tool', detail: 'query_dq_rules()', ms: 268 },
      { label: 'synthesize', detail: '228 rules checked', ms: 520 },
    ],
    answer: '37 records failed across 6 rules — duplicate tax IDs account for 21 of them.',
    cost: '$0.0017',
  },
];
