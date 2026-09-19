import { useState, useRef } from "react";
import { getAdvisoryDetails } from "../db/queries";
import type { AdvisoryTooltipHandlers, TooltipData } from "../types/type";

export function useAdvisoryTooltip() {
  const cache = useRef(new Map<string, string>());

  const [tooltip, setTooltip] = useState<TooltipData>({x: 0, y: 0, data: null, visible: false});

  const handleTagEnter = async (
    college: string,
    department: string,
    code: string
  ) => {
    const key = `${college}|${department}|${code}`;

    if (cache.current.has(key)) {
      setTooltip((t) => ({
        ...t,
        x: t.x,
        y: t.y,
        data: cache.current.get(key) ?? null,
        visible: true,
      }));
      return;
    }

    const data = await getAdvisoryDetails(college, department, code);
    if (!data) return;
    cache.current.set(key, data);

    setTooltip((t) => ({
      ...t,
      data,
      visible: true,
    }));
  };
  
  const handleTagMove = (x: number, y: number) => {
    setTooltip((t) => {
      return {
        ...t,
        x: x + 12,
        y: y + 12,
      };
    });
  };

  const hideTooltip = () => {
    setTooltip((t) => ({ ...t, visible: false }));
  };

  const tooltipHandlers: AdvisoryTooltipHandlers = {
    handleTagEnter,
    handleTagMove,
    hideTooltip,
  };

  return {
    tooltip,
    tooltipHandlers
  };
}