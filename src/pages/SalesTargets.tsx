import { useEffect, useState } from "react";
import { Plus, TrendingUp } from "lucide-react";
import { api } from "@/api/client";
import { formatCurrency, currentMonth } from "@/utils/format";
import { useAppStore } from "@/store/useAppStore";
import Modal from "@/components/Modal";
import type { SalesTarget } from "../../shared/types";

export default function SalesTargets() {
  const { users } = useAppStore();
  const [targets, setTargets] = useState<SalesTarget[]>([]);
  const [month, setMonth] = useState(currentMonth());
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState({
    userId: "",
    targetAmount: 1000000,
    targetCount: 5,
  });

  useEffect(() => {
    api.targets.list({ month }).then(setTargets);
  }, [month]);

  const teamTarget = targets.reduce(
    (acc, t) => ({
      amount: acc.amount + t.targetAmount,
      count: acc.count + t.targetCount,
      achievedAmount: acc.achievedAmount + t.achievedAmount,
      achievedCount: acc.achievedCount + t.achievedCount,
    }),
    { amount: 0, count: 0, achievedAmount: 0, achievedCount: 0 }
  );

  const amountProgress =
    teamTarget.amount > 0
      ? Math.round((teamTarget.achievedAmount / teamTarget.amount) * 100)
      : 0;
  const countProgress =
    teamTarget.count > 0
      ? Math.round((teamTarget.achievedCount / teamTarget.count) * 100)
      : 0;

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    await api.targets.create({ ...form, month });
    setShowCreate(false);
    setForm({ userId: "", targetAmount: 1000000, targetCount: 5 });
    api.targets.list({ month }).then(setTargets);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <select
            className="select w-40"
            value={month}
            onChange={(e) => setMonth(e.target.value)}
          >
            {Array.from({ length: 6 }).map((_, i) => {
              const d = new Date();
              d.setMonth(d.getMonth() - i);
              const m = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
              return (
                <option key={m} value={m}>
                  {d.getFullYear()}年{d.getMonth() + 1}月
                </option>
              );
            })}
          </select>
        </div>
        <button className="btn-primary" onClick={() => setShowCreate(true)}>
          <Plus size={16} />
          分配目标
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="card p-6">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-9 h-9 rounded-xl bg-brand-500 text-white flex items-center justify-center">
              <TrendingUp size={18} />
            </div>
            <div>
              <h3 className="section-title">团队金额目标</h3>
              <p className="text-xs text-slate-500">
                已达成 {formatCurrency(teamTarget.achievedAmount)} /{" "}
                {formatCurrency(teamTarget.amount)}
              </p>
            </div>
          </div>
          <div className="relative h-6 bg-slate-100 rounded-full overflow-hidden">
            <div
              className="absolute inset-y-0 left-0 bg-gradient-to-r from-brand-500 to-brand-600 rounded-full transition-all duration-700 flex items-center justify-end px-3"
              style={{ width: `${Math.min(amountProgress, 100)}%` }}
            >
              {amountProgress > 10 && (
                <span className="text-white text-xs font-semibold">
                  {amountProgress}%
                </span>
              )}
            </div>
          </div>
          {amountProgress < 10 && (
            <div className="text-xs text-slate-500 mt-1 text-right">
              {amountProgress}%
            </div>
          )}
        </div>

        <div className="card p-6">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-9 h-9 rounded-xl bg-emerald-500 text-white flex items-center justify-center">
              <TrendingUp size={18} />
            </div>
            <div>
              <h3 className="section-title">团队成单数量</h3>
              <p className="text-xs text-slate-500">
                已成交 {teamTarget.achievedCount} / {teamTarget.count} 单
              </p>
            </div>
          </div>
          <div className="relative h-6 bg-slate-100 rounded-full overflow-hidden">
            <div
              className="absolute inset-y-0 left-0 bg-gradient-to-r from-emerald-500 to-emerald-600 rounded-full transition-all duration-700 flex items-center justify-end px-3"
              style={{ width: `${Math.min(countProgress, 100)}%` }}
            >
              {countProgress > 10 && (
                <span className="text-white text-xs font-semibold">
                  {countProgress}%
                </span>
              )}
            </div>
          </div>
          {countProgress < 10 && (
            <div className="text-xs text-slate-500 mt-1 text-right">
              {countProgress}%
            </div>
          )}
        </div>
      </div>

      <div className="card overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200">
              <th className="text-left text-xs font-semibold text-slate-600 uppercase tracking-wider px-6 py-3">
                销售
              </th>
              <th className="text-left text-xs font-semibold text-slate-600 uppercase tracking-wider px-6 py-3">
                金额目标
              </th>
              <th className="text-left text-xs font-semibold text-slate-600 uppercase tracking-wider px-6 py-3">
                金额达成
              </th>
              <th className="text-left text-xs font-semibold text-slate-600 uppercase tracking-wider px-6 py-3">
                成单目标
              </th>
              <th className="text-left text-xs font-semibold text-slate-600 uppercase tracking-wider px-6 py-3">
                成单达成
              </th>
              <th className="text-left text-xs font-semibold text-slate-600 uppercase tracking-wider px-6 py-3 w-64">
                金额进度
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {targets.length === 0 ? (
              <tr>
                <td
                  colSpan={6}
                  className="text-center py-16 text-slate-400 text-sm"
                >
                  暂无销售目标
                </td>
              </tr>
            ) : (
              targets.map((t) => {
                const p =
                  t.targetAmount > 0
                    ? Math.round((t.achievedAmount / t.targetAmount) * 100)
                    : 0;
                return (
                  <tr key={t.id} className="hover:bg-slate-50/50">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-brand-500/10 text-brand-600 flex items-center justify-center text-sm font-semibold">
                          {t.userName?.slice(0, 1) || "?"}
                        </div>
                        <span className="font-medium text-navy-800">
                          {t.userName}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-600">
                      {formatCurrency(t.targetAmount)}
                    </td>
                    <td className="px-6 py-4 text-sm font-semibold text-emerald-600">
                      {formatCurrency(t.achievedAmount)}
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-600">
                      {t.targetCount} 单
                    </td>
                    <td className="px-6 py-4 text-sm font-semibold text-emerald-600">
                      {t.achievedCount} 单
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all duration-500 ${
                              p >= 100
                                ? "bg-emerald-500"
                                : p >= 60
                                ? "bg-brand-500"
                                : p >= 30
                                ? "bg-amber-500"
                                : "bg-red-500"
                            }`}
                            style={{ width: `${Math.min(p, 100)}%` }}
                          />
                        </div>
                        <span
                          className={`text-xs font-semibold w-10 text-right ${
                            p >= 100
                              ? "text-emerald-600"
                              : p >= 60
                              ? "text-brand-600"
                              : p >= 30
                              ? "text-amber-600"
                              : "text-red-600"
                          }`}
                        >
                          {p}%
                        </span>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      <Modal
        open={showCreate}
        onClose={() => setShowCreate(false)}
        title="分配销售目标"
        size="sm"
      >
        <form onSubmit={handleCreate} className="space-y-4">
          <div>
            <label className="label">销售人员</label>
            <select
              className="select"
              required
              value={form.userId}
              onChange={(e) => setForm({ ...form, userId: e.target.value })}
            >
              <option value="">请选择</option>
              {users
                .filter((u) => u.role === "sales")
                .map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.name}
                  </option>
                ))}
            </select>
          </div>
          <div>
            <label className="label">金额目标（元）</label>
            <input
              type="number"
              className="input"
              required
              value={form.targetAmount}
              onChange={(e) =>
                setForm({ ...form, targetAmount: Number(e.target.value) })
              }
            />
          </div>
          <div>
            <label className="label">成单数量目标</label>
            <input
              type="number"
              className="input"
              required
              value={form.targetCount}
              onChange={(e) =>
                setForm({ ...form, targetCount: Number(e.target.value) })
              }
            />
          </div>
          <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
            <button
              type="button"
              className="btn-secondary"
              onClick={() => setShowCreate(false)}
            >
              取消
            </button>
            <button type="submit" className="btn-primary">
              创建目标
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
