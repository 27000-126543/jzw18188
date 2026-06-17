import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  TrendingUp,
  Users,
  PhoneCall,
  Target,
  AlertTriangle,
  ChevronRight,
  Snowflake,
} from "lucide-react";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";
import { useAppStore } from "@/store/useAppStore";
import { api } from "@/api/client";
import StageBadge from "@/components/StageBadge";
import SourceBadge from "@/components/SourceBadge";
import { formatCurrency, relativeTime } from "@/utils/format";
import {
  STAGE_ORDER,
  STAGE_LABELS,
  type Lead,
  type SalesTarget,
} from "../../shared/types";

const PIE_COLORS = ["#2563EB", "#3a5faa", "#5a7dc3", "#8ea8d8", "#10B981", "#EF4444"];

export default function Dashboard() {
  const { leads, fetchLeads, users, currentUser } = useAppStore();
  const [targets, setTargets] = useState<SalesTarget[]>([]);
  const [coolingLeads, setCoolingLeads] = useState<Lead[]>([]);

  useEffect(() => {
    fetchLeads();
    api.targets.list().then(setTargets);
  }, [fetchLeads]);

  useEffect(() => {
    setCoolingLeads(leads.filter((l) => l.isCooling).slice(0, 5));
  }, [leads]);

  const stats = [
    {
      label: "本月新增线索",
      value: leads.filter(
        (l) =>
          new Date(l.createdAt).getMonth() === new Date().getMonth()
      ).length,
      icon: Users,
      color: "from-brand-500 to-brand-600",
      trend: "+12%",
    },
    {
      label: "本月跟进次数",
      value: "128",
      icon: PhoneCall,
      color: "from-emerald-500 to-emerald-600",
      trend: "+8%",
    },
    {
      label: "成交转化率",
      value: leads.length > 0
        ? `${Math.round(
            (leads.filter((l) => l.stage === "won").length / leads.length * 100
          ))}%`
        : "0%",
      icon: TrendingUp,
      color: "from-purple-500 to-purple-600",
      trend: "+3%",
    },
    {
      label: "成交金额",
      value: formatCurrency(
        leads
          .filter((l) => l.stage === "won")
          .reduce((a, b) => a + b.estimatedValue, 0)
      ),
      icon: Target,
      color: "from-amber-500 to-amber-600",
      trend: "+18%",
    },
  ];

  const funnelData = STAGE_ORDER.map((s) => ({
    name: STAGE_LABELS[s],
    value: leads.filter((l) => l.stage === s).length,
  }));

  const teamTarget = targets.reduce(
    (acc, t) => ({
      target: acc.target + t.targetAmount,
      achieved: acc.achieved + t.achievedAmount,
    }),
    { target: 0, achieved: 0 }
  );

  const targetProgress =
    teamTarget.target > 0
      ? Math.round((teamTarget.achieved / teamTarget.target) * 100)
      : 0;

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        {stats.map((s) => (
          <div
            key={s.label}
            className="relative overflow-hidden card p-5"
          >
            <div
              className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${s.color} opacity-10 rounded-full -translate-y-1/2 translate-x-1/4`}
            />
            <div className="relative">
              <div
                className={`w-10 h-10 rounded-xl bg-gradient-to-br ${s.color} flex items-center justify-center text-white mb-3`}
              >
                <s.icon size={20} />
              </div>
              <div className="text-sm text-slate-500 mb-1">{s.label}</div>
              <div className="flex items-end justify-between">
                <span className="font-display text-2xl font-bold text-navy-800">
                  {s.value}
                </span>
                <span className="text-xs font-medium text-emerald-600 flex items-center gap-0.5">
                  <TrendingUp size={12} />
                  {s.trend}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="card p-6">
          <h3 className="section-title mb-4">销售漏斗分布</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={funnelData}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={85}
                  paddingAngle={3}
                  dataKey="value"
                >
                  {funnelData.map((_, idx) => (
                    <Cell
                      key={idx}
                      fill={PIE_COLORS[idx % PIE_COLORS.length]}
                    />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex flex-wrap gap-2 mt-2">
            {funnelData.map((d, i) => (
              <div key={d.name} className="flex items-center gap-1.5 text-xs">
                <span
                  className="w-2.5 h-2.5 rounded-full"
                  style={{ background: PIE_COLORS[i] }}
                />
                <span className="text-slate-600">
                  {d.name}
                </span>
                <span className="font-medium text-navy-800">{d.value}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="card p-6">
          <h3 className="section-title mb-4">本月销售目标</h3>
          <div className="flex flex-col items-center justify-center py-4">
            <div className="relative w-40 h-40">
              <svg className="w-full h-full -rotate-90">
                <circle
                  cx="80"
                  cy="80"
                  r="70"
                  fill="none"
                  stroke="#e2e8f0"
                  strokeWidth="14"
                />
                <circle
                  cx="80"
                  cy="80"
                  r="70"
                  fill="none"
                  stroke="#2563EB"
                  strokeWidth="14"
                  strokeLinecap="round"
                  strokeDasharray={`${(targetProgress / 100) * 440} 440`}
                  className="transition-all duration-700"
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="font-display text-3xl font-bold text-navy-800">
                  {targetProgress}%
                </span>
                <span className="text-xs text-slate-500">达成率</span>
              </div>
            </div>
            <div className="mt-4 text-center">
              <div className="text-sm text-slate-500">
                已完成 {formatCurrency(teamTarget.achieved)}
              </div>
              <div className="text-xs text-slate-400">
                目标 {formatCurrency(teamTarget.target)}
              </div>
            </div>
          </div>
          <div className="mt-4 space-y-2">
            {targets.map((t) => {
              const p =
                t.targetAmount > 0
                  ? Math.round((t.achievedAmount / t.targetAmount) * 100)
                  : 0;
              return (
                <div key={t.id}>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-slate-600">{t.userName}</span>
                    <span className="font-medium text-navy-800">{p}%</span>
                  </div>
                  <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-brand-500 to-brand-600 rounded-full transition-all duration-500"
                      style={{ width: `${p}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="card p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="section-title flex items-center gap-2">
              <Snowflake size={18} className="text-cooling" />
              待跟进线索
            </h3>
            <Link
              to="/notifications"
              className="text-xs text-brand-500 hover:text-brand-600 flex items-center gap-0.5"
            >
              全部
              <ChevronRight size={14} />
            </Link>
          </div>
          {coolingLeads.length === 0 ? (
            <div className="text-center text-sm text-slate-400 py-8">
              暂无待跟进线索
            </div>
          ) : (
            <div className="space-y-3">
              {coolingLeads.map((lead) => {
                const owner = users.find((u) => u.id === lead.ownerId);
                return (
                  <Link
                    key={lead.id}
                    to={`/leads/${lead.id}`}
                    className="block p-3 rounded-xl border border-purple-100 bg-purple-50/50 hover:bg-purple-50 transition-colors group"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <div className="font-medium text-sm text-navy-800 truncate group-hover:text-brand-600">
                          {lead.companyName}
                        </div>
                        <div className="text-xs text-slate-500 mt-0.5 truncate">
                          {lead.contactName}
                          {owner ? ` · ${owner.name}` : ""}
                        </div>
                      </div>
                      <span className="badge bg-cooling/20 text-cooling whitespace-nowrap">
                        {lead.coolingDays}天未跟进
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5 mt-2 flex-wrap">
                      <StageBadge stage={lead.stage} />
                      <SourceBadge source={lead.source} />
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      </div>

      <div className="card p-6">
        <h3 className="section-title mb-4">各阶段线索数量
        </h3>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={funnelData}>
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="#f1f5f9"
                vertical={false}
              />
              <XAxis
                dataKey="name"
                axisLine={false}
                tickLine={false}
                tick={{ fill: "#64748b", fontSize: 12 }}
              />
              <YAxis
                axisLine={false}
                tickLine={false}
                tick={{ fill: "#64748b", fontSize: 12 }}
              />
              <Tooltip />
              <Bar
                dataKey="value"
                fill="#2563EB"
                radius={[6, 6, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
