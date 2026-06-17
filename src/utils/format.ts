import {
  STAGE_LABELS,
  SOURCE_LABELS,
  COMMUNICATION_LABELS,
  type LeadStage,
  type LeadSource,
  type CommunicationType,
} from "../../shared/types";

export function formatCurrency(value: number): string {
  return new Intl.NumberFormat("zh-CN", {
    style: "currency",
    currency: "CNY",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
}

export function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString("zh-CN", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
}

export function formatDateTime(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleString("zh-CN", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function relativeTime(dateString: string): string {
  const now = new Date().getTime();
  const date = new Date(dateString).getTime();
  const diffMs = now - date;
  const diffMins = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffMins < 1) return "刚刚";
  if (diffMins < 60) return `${diffMins}分钟前`;
  if (diffHours < 24) return `${diffHours}小时前`;
  if (diffDays < 30) return `${diffDays}天前`;
  return formatDate(dateString);
}

export function stageLabel(stage: LeadStage): string {
  return STAGE_LABELS[stage];
}

export function sourceLabel(source: LeadSource): string {
  return SOURCE_LABELS[source];
}

export function communicationLabel(type: CommunicationType): string {
  return COMMUNICATION_LABELS[type];
}

export function getInitials(name: string): string {
  return name.slice(0, 1);
}

export function currentMonth(): string {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
}
