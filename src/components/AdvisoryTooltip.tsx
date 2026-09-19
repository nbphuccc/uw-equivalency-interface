import type { TooltipData } from "../types/type";
import "./AdvisoryTooltip.css";


type Props = {
  tooltip: TooltipData;
};

export default function AdvisoryTooltip({tooltip}: Props) {
  if (!tooltip.visible || !tooltip.data) {
    return null;
  }

  return (
    <div
      className="tooltip"
      style={{
        top: tooltip.y,
        left: tooltip.x,
      }}
    >
      {tooltip.data}
    </div>
  );
}