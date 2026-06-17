import { useEffect, useState, useMemo } from "react";
import { Link } from "react-router-dom";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Plus, Search, Filter, Snowflake } from "lucide-react";
import { useAppStore } from "@/store/useAppStore";
import { api } from "@/api/client";
import StageBadge from "@/components/StageBadge";
import SourceBadge from "@/components/SourceBadge";
import Modal from "@/components/Modal";
import {
  formatCurrency,
  relativeTime,
} from "@/utils/format";
import {
  STAGE_ORDER,
  STAGE_LABELS,
  SOURCE_LABELS,
  type Lead,
  type LeadStage,
  type LeadSource,
} from "../../shared/types";

function LeadCard({ lead }: { lead: Lead }) {
  const { users } = useAppStore();
  const owner = users.find((u) => u.id === lead.ownerId);
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: lead.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <Link
      to={`/leads/${lead.id}`}
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={`block p-4 rounded-xl bg-white border cursor-move shadow-card hover:shadow-card-hover transition-all duration-200 group ${
        lead.isCooling
          ? "border-cooling/40 ring-1 ring-cooling/20"
          : "border-slate-200"
      }`}
    >
      <div className="flex items-start justify-between gap-2 mb-2">
        <div className="min-w-0 flex-1">
          <h4 className="font-medium text-sm text-navy-800 truncate group-hover:text-brand-600">
            {lead.companyName}
          </h4>
          <p className="text-xs text-slate-500 truncate mt-0.5">
            {lead.contactName}
            {lead.contactTitle ? ` · ${lead.contactTitle}` : ""}
          </p>
        </div>
        {lead.isCooling && (
          <span
            className="badge bg-cooling/15 text-cooling whitespace-nowrap"
            title={`${lead.coolingDays}天未跟进`}
          >
            <Snowflake size={10} />
            {lead.coolingDays}天
          </span>
        )}
      </div>
      <div className="flex items-center gap-1.5 flex-wrap mb-3">
        <StageBadge stage={lead.stage} />
        <SourceBadge source={lead.source} />
      </div>
      <div className="flex items-center justify-between text-xs text-slate-500 pt-2 border-t border-slate-100">
        <div className="flex items-center gap-1.5">
          {owner && (
            <div className="w-5 h-5 rounded-full bg-brand-500/10 text-brand-600 flex items-center justify-center text-[10px] font-semibold">
              {owner.name.slice(0, 1)}
            </div>
          )}
          <span>{owner?.name || "未分配"}</span>
        </div>
        <span className="font-medium text-navy-700">
          {formatCurrency(lead.estimatedValue)}
        </span>
      </div>
    </Link>
  );
}

function StageColumn({
  stage,
  leads,
}: {
  stage: LeadStage;
  leads: Lead[];
}) {
  const columnStyles: Record<LeadStage, string> = {
    initial: "bg-slate-50 border-slate-200",
    needs: "bg-brand-50 border-brand-200",
    proposal: "bg-amber-50 border-amber-200",
    negotiation: "bg-purple-50 border-purple-200",
    won: "bg-emerald-50 border-emerald-200",
    lost: "bg-red-50 border-red-200",
  };

  const titleStyles: Record<LeadStage, string> = {
    initial: "text-slate-700",
    needs: "text-brand-700",
    proposal: "text-amber-700",
    negotiation: "text-purple-700",
    won: "text-emerald-700",
    lost: "text-red-700",
  };

  return (
    <div
      className={`flex flex-col rounded-xl border ${columnStyles[stage]} min-h-[400px]`}
    >
      <div className="p-3 border-b border-white/60">
        <div className="flex items-center justify-between">
          <h3 className={`font-semibold text-sm ${titleStyles[stage]}`}>
            {STAGE_LABELS[stage]}
          </h3>
          <span
            className={`text-xs font-medium px-2 py-0.5 rounded-full bg-white/70 ${titleStyles[stage]}`}
          >
            {leads.length}
          </span>
        </div>
        <div className="text-xs text-slate-500 mt-1">
          预估金额 {formatCurrency(leads.reduce((a, b) => a + b.estimatedValue, 0))}
        </div>
      </div>
      <div className="p-2 flex-1 space-y-2 overflow-auto">
        <SortableContext
          items={leads.map((l) => l.id)}
          strategy={verticalListSortingStrategy}
        >
          {leads.map((lead) => (
            <LeadCard key={lead.id} lead={lead} />
          ))}
        </SortableContext>
      </div>
    </div>
  );
}

export default function LeadBoard() {
  const { leads, fetchLeads, users } = useAppStore();
  const [showCreate, setShowCreate] = useState(false);
  const [search, setSearch] = useState("");
  const [filterOwner, setFilterOwner] = useState("");
  const [filterSource, setFilterSource] = useState("");
  const [form, setForm] = useState({
    companyName: "",
    contactName: "",
    contactTitle: "",
    phone: "",
    email: "",
    address: "",
    source: "website" as LeadSource,
    stage: "initial" as LeadStage,
    ownerId: "u1",
    estimatedValue: 100000,
  });

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  useEffect(() => {
    fetchLeads({
      search: search || undefined,
      ownerId: filterOwner || undefined,
      source: (filterSource as LeadSource) || undefined,
    });
  }, [fetchLeads, search, filterOwner, filterSource]);

  const groupedLeads = useMemo(() => {
    const grouped: Record<LeadStage, Lead[]> = {
      initial: [],
      needs: [],
      proposal: [],
      negotiation: [],
      won: [],
      lost: [],
    };
    leads.forEach((l) => grouped[l.stage].push(l));
    return grouped;
  }, [leads]);

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over) return;

    const leadId = String(active.id);
    let targetStage: LeadStage | null = null;

    for (const stage of STAGE_ORDER) {
      if (groupedLeads[stage].some((l) => l.id === String(over.id))) {
        targetStage = stage;
        break;
      }
    }
    if (over.id && STAGE_ORDER.includes(String(over.id) as LeadStage)) {
      targetStage = String(over.id) as LeadStage;
    }

    const lead = leads.find((l) => l.id === leadId);
    if (targetStage && lead && lead.stage !== targetStage) {
      await api.leads.changeStage(leadId, targetStage);
      await fetchLeads({
        search: search || undefined,
        ownerId: filterOwner || undefined,
        source: (filterSource as LeadSource) || undefined,
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await api.leads.create(form);
    setShowCreate(false);
    setForm({
      companyName: "",
      contactName: "",
      contactTitle: "",
      phone: "",
      email: "",
      address: "",
      source: "website",
      stage: "initial",
      ownerId: "u1",
      estimatedValue: 100000,
    });
    fetchLeads();
  };

  return (
    <div className="space-y-5 animate-fade-in">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          <div className="relative">
            <Search
              size={16}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
            />
            <input
              className="input pl-9 w-64"
              placeholder="搜索客户名称、联系人..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <select
            className="select w-40"
            value={filterOwner}
            onChange={(e) => setFilterOwner(e.target.value)}
          >
            <option value="">全部负责人</option>
            {users.map((u) => (
              <option key={u.id} value={u.id}>
                {u.name}
              </option>
            ))}
          </select>
          <select
            className="select w-36"
            value={filterSource}
            onChange={(e) => setFilterSource(e.target.value)}
          >
            <option value="">全部来源</option>
            {Object.entries(SOURCE_LABELS).map(([k, v]) => (
              <option key={k} value={k}>
                {v as string}
              </option>
            ))}
          </select>
        </div>
        <button className="btn-primary" onClick={() => setShowCreate(true)}>
          <Plus size={16} />
          新建线索
        </button>
      </div>

      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-6 gap-4">
          {STAGE_ORDER.map((stage) => (
            <div key={stage} data-stage={stage}>
              <SortableContext
                items={[stage, ...groupedLeads[stage].map((l) => l.id)]}
                strategy={verticalListSortingStrategy}
              >
                <StageColumn stage={stage} leads={groupedLeads[stage]} />
              </SortableContext>
            </div>
          ))}
        </div>
      </DndContext>

      <Modal
        open={showCreate}
        onClose={() => setShowCreate(false)}
        title="新建销售线索"
        size="lg"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">公司名称 *</label>
              <input
                className="input"
                required
                value={form.companyName}
                onChange={(e) =>
                  setForm({ ...form, companyName: e.target.value })
                }
                placeholder="请输入公司名称"
              />
            </div>
            <div>
              <label className="label">联系人 *</label>
              <input
                className="input"
                required
                value={form.contactName}
                onChange={(e) =>
                  setForm({ ...form, contactName: e.target.value })
                }
                placeholder="请输入联系人姓名"
              />
            </div>
            <div>
              <label className="label">职位</label>
              <input
                className="input"
                value={form.contactTitle}
                onChange={(e) =>
                  setForm({ ...form, contactTitle: e.target.value })
                }
              />
            </div>
            <div>
              <label className="label">电话 *</label>
              <input
                className="input"
                required
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
              />
            </div>
            <div>
              <label className="label">邮箱 *</label>
              <input
                className="input"
                type="email"
                required
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
              />
            </div>
            <div>
              <label className="label">预估金额</label>
              <input
                className="input"
                type="number"
                value={form.estimatedValue}
                onChange={(e) =>
                  setForm({
                    ...form,
                    estimatedValue: Number(e.target.value),
                  })
                }
              />
            </div>
            <div>
              <label className="label">来源渠道</label>
              <select
                className="select"
                value={form.source}
                onChange={(e) =>
                  setForm({ ...form, source: e.target.value as LeadSource })
                }
              >
                {Object.entries(SOURCE_LABELS).map(([k, v]) => (
                  <option key={k} value={k}>
                    {v as string}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="label">初始阶段</label>
              <select
                className="select"
                value={form.stage}
                onChange={(e) =>
                  setForm({ ...form, stage: e.target.value as LeadStage })
                }
              >
                {Object.entries(STAGE_LABELS).map(([k, v]) => (
                  <option key={k} value={k}>
                    {v as string}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="label">负责人</label>
              <select
                className="select"
                value={form.ownerId}
                onChange={(e) => setForm({ ...form, ownerId: e.target.value })}
              >
                {users
                  .filter((u) => u.role === "sales")
                  .map((u) => (
                    <option key={u.id} value={u.id}>
                      {u.name}
                    </option>
                  ))}
              </select>
            </div>
            <div className="col-span-2">
              <label className="label">地址</label>
              <input
                className="input"
                value={form.address}
                onChange={(e) => setForm({ ...form, address: e.target.value })}
              />
            </div>
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
              创建线索
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
