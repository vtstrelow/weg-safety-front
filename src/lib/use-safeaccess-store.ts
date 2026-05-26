"use client";

import { useCallback, useEffect, useState } from "react";
import { loadState, saveState, type SafeAccessState } from "./local-store";

export function useSafeAccessStore() {
  const [state, setState] = useState<SafeAccessState | null>(null);

  useEffect(() => {
    setState(loadState());
  }, []);

  const update = useCallback((recipe: (draft: SafeAccessState) => void) => {
    setState((current) => {
      const draft = structuredClone(current ?? loadState());
      recipe(draft);
      saveState(draft);
      return draft;
    });
  }, []);

  const replace = useCallback((next: SafeAccessState) => {
    saveState(next);
    setState(next);
  }, []);

  return {
    state,
    ready: Boolean(state),
    update,
    replace
  };
}
