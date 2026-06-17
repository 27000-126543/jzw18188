export type LeadStage =
  | "initial"
  | "needs"
  | "proposal"
  | "negotiation"
  | "won"
  | "lost";

export type LeadSource = "website" | "expo" | "referral";

export type CommunicationType = "phone" | "email" | "visit";

export type UserRole = "sales" | "manager";

export type NotificationType = "cooling" | "stage_change" | "lost";

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar?: string;
}

export interface Lead {
  id: string;
  companyName: string;
  contactName: string;
  contactTitle?: string;
  phone: string;
  email: string;
  address?: string;
  source: LeadSource;
  stage: LeadStage;
  ownerId: string;
  estimatedValue: number;
  isCooling: boolean;
  coolingDays: number;
  createdAt: string;
  updatedAt: string;
  lastFollowUpAt?: string;
}

export interface Communication {
  id: string;
  leadId: string;
  type: CommunicationType;
  content: string;
  createdBy: string;
  createdByName?: string;
  createdAt: string;
}

export interface StageHistory {
  id: string;
  leadId: string;
  stage: LeadStage;
  enteredAt: string;
  leftAt?: string;
  durationDays?: number;
}

export interface Customer {
  id: string;
  leadId: string;
  companyName: string;
  contactName: string;
  phone: string;
  email: string;
  address?: string;
  dealValue: number;
  closedAt: string;
  createdAt: string;
}

export interface SalesTarget {
  id: string;
  userId: string;
  userName?: string;
  month: string;
  targetAmount: number;
  targetCount: number;
  achievedAmount: number;
  achievedCount: number;
}

export interface Notification {
  id: string;
  userId: string;
  type: NotificationType;
  title: string;
  content: string;
  relatedLeadId?: string;
  read: boolean;
  createdAt: string;
}

export interface FunnelData {
  stage: LeadStage;
  stageLabel: string;
  count: number;
  conversionRate: number;
  value: number;
}

export interface StageDurationData {
  stage: LeadStage;
  stageLabel: string;
  avgDays: number;
  medianDays: number;
  minDays: number;
  maxDays: number;
}

export interface CloseCycleBucket {
  range: string;
  min: number;
  max: number;
  count: number;
}

export const STAGE_LABELS: Record<LeadStage, string> = {
  initial: "初步接触",
  needs: "需求确认",
  proposal: "方案报价",
  negotiation: "谈判",
  won: "成交",
  lost: "流失",
};

export const SOURCE_LABELS: Record<LeadSource, string> = {
  website: "官网表单",
  expo: "展会",
  referral: "转介绍",
};

export const COMMUNICATION_LABELS: Record<CommunicationType, string> = {
  phone: "电话",
  email: "邮件",
  visit: "拜访",
};

export const STAGE_ORDER: LeadStage[] = [
  "initial",
  "needs",
  "proposal",
  "negotiation",
  "won",
  "lost",
];

export const COOLING_THRESHOLD_DAYS = 7;
