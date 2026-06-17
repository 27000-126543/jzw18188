import { useEffect, useState } from "react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Cell,
} from "recharts";
import { api } from "@/api/client";
import { formatCurrency } from "@/utils/format";
import type {
  FunnelData,
  StageDurationData,
  CloseCycleBucket,
} from "../../shared/types";

const FUNNEL_COLORS = [
  "#94a3b8",
  "#2563EB",
  "#f59e0b",
  "#8B5CF6",
  "#10B981",
  "#EF4444",
];

export default function Analytics() {
  const [funnel, setFunnel] = useState<FunnelData[]>([]);
  const [duration, setDuration] = useState<StageDurationData[]>([]);
  const [cycle, setCycle] = useState<CloseCycleBucket[]>([]);

  useEffect(() => {
    Promise.all([
      api.analytics.funnel(),
      api.analytics.stageDuration(),
      api.analytics.closeCycle(),
    ]).then(([f, d, c]) => {
      setFunnel(f);
      setDuration(d);
      setCycle(c);
    });
  }, []);

  const maxFunnelCount = Math.max(...funnel.map((f) => f.count), 1);

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="card p-6">
        <h3 className="section-title mb-6">销售漏斗与转化率</h3>
        <div className="space-y-3">
          {funnel.map((f, idx) => {
            const width = (f.count / maxFunnelCount) * 100;
            return (
              <div key={f.stage}>
                <div className="flex items-center justify-between text-sm mb-1.5">
                  <div className="flex items-center gap-2">
                    <span
                      className="w-3 h-3 rounded"
                      style={{ background: FUNNEL_COLORS[idx] }}
                    />
                    <span className="font-medium text-navy-800">
                      {f.stageLabel}
                    </span>
                  </div>
                  <div className="flex items-center gap-4 text-xs">
                    <span className="text-slate-500">
                      预估金额 {formatCurrency(f.value)}
                    </span>
                    <span className="font-semibold text-navy-800 w-12 text-right">
                      {f.count}条
                    </span>
                    {idx > 0 && (
                      <span
                        className={`badge ${
                          f.conversionRate >= 50
                            ? "bg-emerald-50 text-emerald-700"
                            : f.conversionRate >= 30
                            ? "bg-amber-50 text-amber-700"
                            : "bg-red-50 text-red-600"
                        }`}
                      >
                        转化率 {f.conversionRate}%
                      </span>
                    )}
                  </div>
                </div>
                <div className="h-8 bg-slate-100 rounded-lg overflow-hidden">
                  <div
                    className="h-full rounded-lg transition-all duration-700 flex items-center px-3"
                    style={{
                      width: `${width}%`,
                      background: `linear-gradient(90deg, ${FUNNEL_COLORS[idx]}, ${FUNNEL_COLORS[idx]}cc)`,
                    }}
                  >
                    {width > 15 && (
                      <span className="text-white text-xs font-medium">
                        {f.count}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card p-6">
          <h3 className="section-title mb-4">各阶段停留时长（天）</h3>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={duration.map((d) => ({
                  name: d.stageLabel,
                  平均: d.avgDays,
                  中位数: d.medianDays,
                }))}
              >
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
                <Bar dataKey="平均" fill="#2563EB" radius={[4, 4, 0, 0]} />
                <Bar dataKey="中位数" fill="#10B981" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="card p-6">
          <h3 className="section-title mb-4">成交周期分布</h3>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={cycle}>
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="#f1f5f9"
                  vertical={false}
                />
                <XAxis
                  dataKey="range"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "#64748b", fontSize: 12 }}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "#64748b", fontSize: 12 }}
                  allowDecimals={false}
                />
                <Tooltip />
                <Bar dataKey="count" radius={[6, 6, 0, 0]} name="成交数">
                  {cycle.map((_, idx) => (
                    <Cell
                      key={idx}
                      fill={
                        [
                          "#10B981",
                          "#2563EB",
                          "#8B5CF6",
                          "#F59E0B",
                          "#EF4444",
                        ][idx]
                      }
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="card p-6">
        <h3 className="section-title mb-4">阶段停留明细</h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                <th className="text-left text-xs font-semibold text-slate-600 uppercase tracking-wider px-4 py-3">
                  阶段
                </th>
                <th className="text-right text-xs font-semibold text-slate-600 uppercase tracking-wider px-4 py-3">
                  最短（天）
                </th>
                <th className="text-right text-xs font-semibold text-slate-600 uppercase tracking-wider px-4 py-3">
                  平均（天）
                </th>
                <th className="text-right text-xs font-semibold text-slate-600 uppercase tracking-wider px-4 py-3">
                  中位数（天）
                </th>
                <th className="text-right text-xs font-semibold text-slate-600 uppercase tracking-wider px-4 py-3">
                  最长（天）
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {duration.map((d) => (
                <tr key={d.stage}>
                  <td className="px-4 py-3 font-medium text-navy-800 text-sm">
                    {d.stageLabel}
                  </td>
                  <td className="px-4 py-3 text-right text-sm text-slate-600">
                    {d.minDays}
                  </td>
                  <td className="px-4 py-3 text-right text-sm text-brand-600 font-semibold">
                    {d.avgDays}
                  </td>
                  <td className="px-4 py-3 text-right text-sm text-emerald-600 font-semibold">
                    {d.medianDays}
                  </td>
                  <td className="px-4 py-3 text-right text-sm text-slate-600">
                    {d.maxDays}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
