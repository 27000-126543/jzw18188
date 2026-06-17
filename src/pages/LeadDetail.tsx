import { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Phone,
  Mail,
  MapPin,
  User,
  Calendar,
  DollarSign,
  MessageSquare,
  Plus,
  CheckCircle2,
  AlertTriangle,
  History,
  Building2,
  TrendingUp,
} from "lucide-react";
import { api } from "@/api/client";
import { useAppStore } from "@/store/useAppStore";
import StageBadge from "@/components/StageBadge";
import SourceBadge from "@/components/SourceBadge";
import Modal from "@/components/Modal";
import {
  formatCurrency,
  formatDateTime,
  formatDate,
  communicationLabel,
  stageLabel,
} from "@/utils/format";
import {
  STAGE_LABELS,
  STAGE_ORDER,
  COMMUNICATION_LABELS,
  type Lead,
  type Communication,
  type StageHistory,
  type CommunicationType,
  type LeadStage,
} from "../../shared/types";

const commIcons = {
  phone: Phone,
  email: Mail,
  visit: Building2,
};

const commColors: Record<CommunicationType, string> = {
  phone: "bg-emerald-100 text-emerald-600",
  email: "bg-sky-100 text-sky-600",
  visit: "bg-amber-100 text-amber-600",
};

export default function LeadDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { users, fetchLeads, currentUser } = useAppStore();

  const [lead, setLead] = useState<Lead | null>(null);
  const [comms, setComms] = useState<Communication[]>([]);
  const [history, setHistory] = useState<StageHistory[]>([]);
  const [showAddComm, setShowAddComm] = useState(false);
  const [showConvert, setShowConvert] = useState(false);
  const [showChangeStage, setShowChangeStage] = useState(false);
  const [commForm, setCommForm] = useState({
    type: "phone" as CommunicationType,
    content: "",
  });
  const [dealValue, setDealValue] = useState(0);
  const [newStage, setNewStage] = useState<LeadStage>("needs");

  const refresh = async () => {
    if (!id) return;
    const [l, c, h] = await Promise.all([
      api.leads.get(id),
      api.leads.communications.list(id),
      api.leads.stageHistory(id),
    ]);
    setLead(l || null);
    setComms(c);
    setHistory(h);
  };

  useEffect(() => {
    refresh();
  }, [id]);

  if (!lead) {
    return (
      <div className="flex items-center justify-center py-20 text-slate-400">
        加载中...
      </div>
    );
  }

  const owner = users.find((u) => u.id === lead.ownerId);

  const handleAddComm = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id) return;
    await api.leads.communications.create(id, {
      ...commForm,
      createdBy: currentUser.id,
    });
    setShowAddComm(false);
    setCommForm({ type: "phone", content: "" });
    refresh();
    fetchLeads();
  };

  const handleConvert = async () => {
    if (!id) return;
    await api.leads.convert(id, dealValue || lead.estimatedValue);
    setShowConvert(false);
    fetchLeads();
    navigate("/customers");
  };

  const handleChangeStage = async () => {
    if (!id) return;
    await api.leads.changeStage(id, newStage);
    setShowChangeStage(false);
    refresh();
    fetchLeads();
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <button
          className="btn-ghost"
          onClick={() => navigate(-1)}
        >
          <ArrowLeft size={16} />
          返回看板
        </button>
        <div className="flex items-center gap-2">
          <button className="btn-secondary" onClick={() => setShowChangeStage(true)}>
            <TrendingUp size={16} />
            推进阶段
          </button>
          <button
            className="btn-secondary"
            onClick={() => setShowAddComm(true)}
          >
            <MessageSquare size={16} />
            记录沟通
          </button>
          {lead.stage !== "won" && lead.stage !== "lost" && (
            <button className="btn-primary" onClick={() => {
              setDealValue(lead.estimatedValue);
              setShowConvert(true);
            }}>
              <CheckCircle2 size={16} />
              转化为客户
            </button>
          )}
        </div>
      </div>

      <div className="card p-6">
        <div className="flex items-start justify-between gap-6">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-3 flex-wrap mb-2">
              <h1 className="font-display text-2xl font-bold text-navy-800">
                {lead.companyName}
              </h1>
              <StageBadge stage={lead.stage} />
              <SourceBadge source={lead.source} />
              {lead.isCooling && (
                <span className="badge bg-cooling/15 text-cooling">
                  <AlertTriangle size={11} />
                  {lead.coolingDays}天未跟进
                </span>
              )}
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
              <div className="flex items-center gap-2 text-sm">
                <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-slate-500">
                  <User size={16} />
                </div>
                <div>
                  <div className="text-slate-500 text-xs">联系人</div>
                  <div className="font-medium text-navy-800">
                    {lead.contactName}
                    {lead.contactTitle ? ` · ${lead.contactTitle}` : ""}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <div className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center text-emerald-600">
                  <Phone size={16} />
                </div>
                <div>
                  <div className="text-slate-500 text-xs">电话</div>
                  <div className="font-medium text-navy-800">{lead.phone}</div>
                </div>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <div className="w-8 h-8 rounded-lg bg-sky-50 flex items-center justify-center text-sky-600">
                  <Mail size={16} />
                </div>
                <div>
                  <div className="text-slate-500 text-xs">邮箱</div>
                  <div className="font-medium text-navy-800">{lead.email}</div>
                </div>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <div className="w-8 h-8 rounded-lg bg-amber-50 flex items-center justify-center text-amber-600">
                  <DollarSign size={16} />
                </div>
                <div>
                  <div className="text-slate-500 text-xs">预估金额</div>
                  <div className="font-medium text-navy-800">
                    {formatCurrency(lead.estimatedValue)}
                  </div>
                </div>
              </div>
              {lead.address && (
                <div className="flex items-center gap-2 text-sm">
                  <div className="w-8 h-8 rounded-lg bg-purple-50 flex items-center justify-center text-purple-600">
                    <MapPin size={16} />
                  </div>
                  <div>
                    <div className="text-slate-500 text-xs">地址</div>
                    <div className="font-medium text-navy-800">
                      {lead.address}
                    </div>
                  </div>
                </div>
              )}
              <div className="flex items-center gap-2 text-sm">
                <div className="w-8 h-8 rounded-lg bg-brand-50 flex items-center justify-center text-brand-600">
                  <Calendar size={16} />
                </div>
                <div>
                  <div className="text-slate-500 text-xs">创建时间</div>
                  <div className="font-medium text-navy-800">
                    {formatDate(lead.createdAt)}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <div className="w-8 h-8 rounded-lg bg-navy-100 flex items-center justify-center text-navy-600">
                  {owner?.name.slice(0, 1) || "?"}
                </div>
                <div>
                  <div className="text-slate-500 text-xs">负责人</div>
                  <div className="font-medium text-navy-800">
                    {owner?.name || "未分配"}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 card p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="section-title flex items-center gap-2">
              <MessageSquare size={18} />
              沟通时间线
            </h3>
            <button
              className="btn-ghost text-sm"
              onClick={() => setShowAddComm(true)}
            >
              <Plus size={14} />
              添加记录
            </button>
          </div>
          {comms.length === 0 ? (
            <div className="text-center py-12 text-slate-400 text-sm">
              暂无沟通记录
            </div>
          ) : (
            <div className="relative">
              <div className="absolute left-3.5 top-2 bottom-2 w-px bg-slate-200" />
              <div className="space-y-5">
                {comms.map((c) => {
                  const Icon = commIcons[c.type];
                  return (
                    <div key={c.id} className="relative pl-10 animate-slide-in">
                      <div
                        className={`absolute left-0 top-0 w-7 h-7 rounded-full flex items-center justify-center ${commColors[c.type]}`}
                      >
                        <Icon size={14} />
                      </div>
                      <div className="bg-slate-50 rounded-xl p-4">
                        <div className="flex items-center justify-between mb-1">
                          <div className="flex items-center gap-2">
                            <span className="font-medium text-sm text-navy-800">
                              {communicationLabel(c.type)}沟通
                            </span>
                            <span className="text-xs text-slate-500">
                              {c.createdByName || "未知"}
                            </span>
                          </div>
                          <span className="text-xs text-slate-400">
                            {formatDateTime(c.createdAt)}
                          </span>
                        </div>
                        <p className="text-sm text-slate-600 leading-relaxed">
                          {c.content}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        <div className="card p-6">
          <h3 className="section-title flex items-center gap-2 mb-4">
            <History size={18} />
            阶段推进历史
          </h3>
          <div className="space-y-0">
            {history.map((h, idx) => (
              <div key={h.id} className="relative pl-8 pb-4">
                {idx < history.length - 1 && (
                  <div className="absolute left-[11px] top-5 bottom-0 w-0.5 bg-slate-200" />
                )}
                <div className="absolute left-0 top-1 w-6 h-6 rounded-full bg-brand-500 text-white flex items-center justify-center text-[10px] font-semibold">
                  {idx + 1}
                </div>
                <div className="pt-0.5">
                  <div className="font-medium text-sm text-navy-800">
                    {stageLabel(h.stage)}
                  </div>
                  <div className="text-xs text-slate-500 mt-0.5">
                    进入：{formatDate(h.enteredAt)}
                  </div>
                  {h.leftAt && (
                    <div className="text-xs text-slate-500">
                      离开：{formatDate(h.leftAt)}
                      {h.durationDays !== undefined &&
                        h.durationDays !== null && (
                          <span className="ml-1 text-brand-600">
                            · 停留{h.durationDays}天
                          </span>
                        )}
                    </div>
                  )}
                  {!h.leftAt && (
                    <div className="text-xs text-brand-600 mt-0.5">
                      当前阶段
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <Modal
        open={showAddComm}
        onClose={() => setShowAddComm(false)}
        title="添加沟通记录"
        size="md"
      >
        <form onSubmit={handleAddComm} className="space-y-4">
          <div>
            <label className="label">沟通方式</label>
            <div className="grid grid-cols-3 gap-2">
              {(
                Object.entries(COMMUNICATION_LABELS) as [
                  CommunicationType,
                  string
                ][]
              ).map(([k, v]) => {
                const Icon = commIcons[k];
                const active = commForm.type === k;
                return (
                  <button
                    key={k}
                    type="button"
                    onClick={() => setCommForm({ ...commForm, type: k })}
                    className={`flex flex-col items-center gap-1 py-3 rounded-xl border-2 transition-all ${
                      active
                        ? "border-brand-500 bg-brand-50 text-brand-700"
                        : "border-slate-200 hover:border-slate-300 text-slate-600"
                    }`}
                  >
                    <Icon size={18} />
                    <span className="text-xs font-medium">{v}</span>
                  </button>
                );
              })}
            </div>
          </div>
          <div>
            <label className="label">沟通内容</label>
            <textarea
              className="input min-h-[120px] resize-none"
              required
              value={commForm.content}
              onChange={(e) =>
                setCommForm({ ...commForm, content: e.target.value })
              }
              placeholder="请记录沟通的主要内容..."
            />
          </div>
          <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
            <button
              type="button"
              className="btn-secondary"
              onClick={() => setShowAddComm(false)}
            >
              取消
            </button>
            <button type="submit" className="btn-primary">
              保存记录
            </button>
          </div>
        </form>
      </Modal>

      <Modal
        open={showConvert}
        onClose={() => setShowConvert(false)}
        title="转化为正式客户"
        size="sm"
      >
        <div className="space-y-4">
          <p className="text-sm text-slate-600">
            将 <span className="font-medium text-navy-800">{lead.companyName}</span>{" "}
            标记为成交客户并创建客户档案，所有历史沟通记录将一并迁移。
          </p>
          <div>
            <label className="label">成交金额</label>
            <input
              type="number"
              className="input"
              value={dealValue}
              onChange={(e) => setDealValue(Number(e.target.value))}
            />
          </div>
          <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
            <button
              type="button"
              className="btn-secondary"
              onClick={() => setShowConvert(false)}
            >
              取消
            </button>
            <button onClick={handleConvert} className="btn-primary">
              确认转化
            </button>
          </div>
        </div>
      </Modal>

      <Modal
        open={showChangeStage}
        onClose={() => setShowChangeStage(false)}
        title="推进销售阶段"
        size="sm"
      >
        <div className="space-y-4">
          <div>
            <label className="label">选择目标阶段</label>
            <select
              className="select"
              value={newStage}
              onChange={(e) => setNewStage(e.target.value as LeadStage)}
            >
              {STAGE_ORDER.map((s) => (
                <option key={s} value={s}>
                  {STAGE_LABELS[s]}
                </option>
              ))}
            </select>
          </div>
          <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
            <button
              type="button"
              className="btn-secondary"
              onClick={() => setShowChangeStage(false)}
            >
              取消
            </button>
            <button onClick={handleChangeStage} className="btn-primary">
              确认
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
