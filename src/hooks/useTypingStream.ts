import { useEffect, useRef, useState } from 'react';
import type { StreamState } from '../three/heroHeadScene';

interface TypingState {
  qText: string;
  aText: string;
  streamState: StreamState;
}

/** Loops through Q&A pairs, typing each one out character by character to simulate a live AI stream. */
export function useTypingStream(pairs: [string, string][], charsPerSecond = 30) {
  const [state, setState] = useState<TypingState>({ qText: '', aText: '', streamState: 'listening' });
  const stoppedRef = useRef(false);

  useEffect(() => {
    stoppedRef.current = false;
    const reduced = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false;
    if (reduced) {
      const [q, a] = pairs[0];
      setState({ qText: q, aText: a, streamState: 'complete' });
      return;
    }

    const rate = Math.max(4, 60 - charsPerSecond);
    let timeoutId: ReturnType<typeof setTimeout>;
    const wait = (ms: number) => new Promise<void>((resolve) => { timeoutId = setTimeout(resolve, ms); });

    const type = async (key: 'qText' | 'aText', text: string, ms: number) => {
      for (let c = 1; c <= text.length; c++) {
        if (stoppedRef.current) return;
        setState((s) => ({ ...s, [key]: text.slice(0, c) }));
        await wait(ms);
      }
    };

    const loop = async () => {
      let i = 0;
      while (!stoppedRef.current) {
        const [q, a] = pairs[i % pairs.length];
        setState({ qText: '', aText: '', streamState: 'listening' });
        await wait(500);
        await type('qText', q, 22);
        if (stoppedRef.current) return;
        setState((s) => ({ ...s, streamState: 'thinking' }));
        await wait(620);
        if (stoppedRef.current) return;
        setState((s) => ({ ...s, streamState: 'streaming' }));
        await type('aText', a, rate);
        if (stoppedRef.current) return;
        setState((s) => ({ ...s, streamState: 'complete' }));
        await wait(4200);
        i++;
      }
    };
    loop();

    return () => {
      stoppedRef.current = true;
      clearTimeout(timeoutId);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return state;
}
