import { useEffect, useRef, useState } from 'react';
import type { AgentRun } from '../data/agentRuns';

export type StepStatus = 'pending' | 'running' | 'done';

export interface AgentRunState {
  run: AgentRun;
  runIndex: number;
  query: string;
  stepStatus: StepStatus[];
  answer: string;
  /** Accumulated displayed duration, in ms. */
  elapsed: number;
  phase: 'query' | 'steps' | 'answer' | 'complete';
}

function initial(runs: AgentRun[], i: number): AgentRunState {
  return {
    run: runs[i],
    runIndex: i,
    query: '',
    stepStatus: runs[i].steps.map(() => 'pending'),
    answer: '',
    elapsed: 0,
    phase: 'query',
  };
}

/**
 * Drives the hero's agent trace: types the query, walks the steps, then streams
 * the answer, looping through the supplied runs.
 */
export function useAgentRun(runs: AgentRun[]) {
  const [state, setState] = useState<AgentRunState>(() => initial(runs, 0));
  const stopped = useRef(false);

  useEffect(() => {
    stopped.current = false;
    const reduced = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false;

    if (reduced) {
      const r = runs[0];
      setState({
        run: r,
        runIndex: 0,
        query: r.query,
        stepStatus: r.steps.map(() => 'done'),
        answer: r.answer,
        elapsed: r.steps.reduce((a, s) => a + s.ms, 0),
        phase: 'complete',
      });
      return;
    }

    let timer: ReturnType<typeof setTimeout>;
    const wait = (ms: number) =>
      new Promise<void>((resolve) => {
        timer = setTimeout(resolve, ms);
      });

    const type = async (text: string, key: 'query' | 'answer', perChar: number) => {
      for (let c = 1; c <= text.length; c++) {
        if (stopped.current) return;
        setState((s) => ({ ...s, [key]: text.slice(0, c) }));
        await wait(perChar);
      }
    };

    const loop = async () => {
      let i = 0;
      while (!stopped.current) {
        const run = runs[i % runs.length];
        setState(initial(runs, i % runs.length));
        await wait(420);
        if (stopped.current) return;

        await type(run.query, 'query', 20);
        if (stopped.current) return;

        setState((s) => ({ ...s, phase: 'steps' }));
        await wait(260);

        for (let s = 0; s < run.steps.length; s++) {
          if (stopped.current) return;
          setState((prev) => {
            const next = [...prev.stepStatus];
            next[s] = 'running';
            return { ...prev, stepStatus: next };
          });
          // Real wait is compressed — the displayed ms stays truthful to the data.
          await wait(Math.min(700, 220 + run.steps[s].ms * 0.45));
          if (stopped.current) return;
          setState((prev) => {
            const next = [...prev.stepStatus];
            next[s] = 'done';
            return { ...prev, stepStatus: next, elapsed: prev.elapsed + run.steps[s].ms };
          });
          await wait(90);
        }

        setState((s) => ({ ...s, phase: 'answer' }));
        await wait(180);
        await type(run.answer, 'answer', 17);
        if (stopped.current) return;

        setState((s) => ({ ...s, phase: 'complete' }));
        await wait(4200);
        i++;
      }
    };
    loop();

    return () => {
      stopped.current = true;
      clearTimeout(timer);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return state;
}
