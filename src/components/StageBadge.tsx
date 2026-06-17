import type { LeadStage } from "../../shared/types";
import { stageLabel } from "@/utils/format";

const styles: Record<LeadStage, string> = {
  initial: "bg-slate-100 text-slate-700",
  needs: "bg-blue-50 text-brand-600",
  proposal: "bg-amber-50 text-amber-700",
  negotiation: "bg-purple-50 text-purple-700",
  won: "bg-emerald-50 text-emerald-700",
  lost: "bg-red-50 text-red-600",
};

export default function StageBadge({ stage }: { stage: LeadStage }) {
  return (
    <span className={`badge ${styles[stage]}`}>{stageLabel(stage)}</span>
  );
}
