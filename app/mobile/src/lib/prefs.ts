import { useCallback, useEffect, useState } from "react";

import { readItem, writeItem } from "@/lib/storage";

const PREFIX = "eazybox.pref.";

export function usePref(name: string, initial: boolean) {
  const [value, setValue] = useState(initial);

  useEffect(() => {
    let active = true;
    void readItem(`${PREFIX}${name}`).then((stored) => {
      if (active && stored !== null) setValue(stored === "true");
    });
    return () => {
      active = false;
    };
  }, [name]);

  const toggle = useCallback(() => {
    setValue((current) => {
      const next = !current;
      void writeItem(`${PREFIX}${name}`, String(next));
      return next;
    });
  }, [name]);

  return { value, toggle };
}
