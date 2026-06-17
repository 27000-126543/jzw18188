import { Globe, Building2, UserPlus } from "lucide-react";
import type { LeadSource } from "../../shared/types";
import { sourceLabel } from "@/utils/format";

const icons = {
  website: Globe,
  expo: Building2,
  referral: UserPlus,
};

const styles: Record<LeadSource, string> = {
  website: "bg-sky-50 text-sky-700",
  expo: "bg-orange-50 text-orange-700",
  referral: "bg-teal-50 text-teal-700",
};

export default function SourceBadge({ source }: { source: LeadSource }) {
  const Icon = icons[source];
  return (
    <span className={`badge ${styles[source]}`}>
      <Icon size={12} />
      {sourceLabel(source)}
    </span>
  );
}
