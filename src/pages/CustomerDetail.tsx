import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Phone,
  Mail,
  MapPin,
  User,
  Calendar,
  DollarSign,
  MessageSquare,
  Building2,
} from "lucide-react";
import { api } from "@/api/client";
import {
  formatCurrency,
  formatDateTime,
  formatDate,
  communicationLabel,
} from "@/utils/format";
import type {
  Customer,
  Communication,
  CommunicationType,
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

type DetailType = (Customer & { communications: Communication[] }) | null;

export default function CustomerDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [customer, setCustomer] = useState<DetailType>(null);

  useEffect(() => {
    if (!id) return;
    api.customers.get(id).then((c) => setCustomer(c as DetailType));
  }, [id]);

  if (!customer) {
    return (
      <div className="flex items-center justify-center py-20 text-slate-400">
        加载中...
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <button className="btn-ghost" onClick={() => navigate(-1)}>
        <ArrowLeft size={16} />
        返回客户列表
      </button>

      <div className="card p-6">
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <h1 className="font-display text-2xl font-bold text-navy-800">
                {customer.companyName}
              </h1>
              <span className="badge bg-emerald-50 text-emerald-700">
                已成交
              </span>
            </div>
            <p className="text-sm text-slate-500">
              成交于 {formatDate(customer.closedAt)}
            </p>
          </div>
          <div className="text-right">
            <div className="text-sm text-slate-500">成交金额</div>
            <div className="font-display text-2xl font-bold text-emerald-600">
              {formatCurrency(customer.dealValue)}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
          <div className="flex items-center gap-2 text-sm">
            <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-slate-500">
              <User size={16} />
            </div>
            <div>
              <div className="text-slate-500 text-xs">联系人</div>
              <div className="font-medium text-navy-800">
                {customer.contactName}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <div className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center text-emerald-600">
              <Phone size={16} />
            </div>
            <div>
              <div className="text-slate-500 text-xs">电话</div>
              <div className="font-medium text-navy-800">{customer.phone}</div>
            </div>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <div className="w-8 h-8 rounded-lg bg-sky-50 flex items-center justify-center text-sky-600">
              <Mail size={16} />
            </div>
            <div>
              <div className="text-slate-500 text-xs">邮箱</div>
              <div className="font-medium text-navy-800">{customer.email}</div>
            </div>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <div className="w-8 h-8 rounded-lg bg-brand-50 flex items-center justify-center text-brand-600">
              <Calendar size={16} />
            </div>
            <div>
              <div className="text-slate-500 text-xs">建档日期</div>
              <div className="font-medium text-navy-800">
                {formatDate(customer.createdAt)}
              </div>
            </div>
          </div>
          {customer.address && (
            <div className="flex items-center gap-2 text-sm">
              <div className="w-8 h-8 rounded-lg bg-purple-50 flex items-center justify-center text-purple-600">
                <MapPin size={16} />
              </div>
              <div>
                <div className="text-slate-500 text-xs">地址</div>
                <div className="font-medium text-navy-800">
                  {customer.address}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="card p-6">
        <h3 className="section-title flex items-center gap-2 mb-4">
          <MessageSquare size={18} />
          历史沟通记录（从线索迁移）
        </h3>
        {customer.communications.length === 0 ? (
          <div className="text-center py-12 text-slate-400 text-sm">
            暂无沟通记录
          </div>
        ) : (
          <div className="relative">
            <div className="absolute left-3.5 top-2 bottom-2 w-px bg-slate-200" />
            <div className="space-y-5">
              {customer.communications.map((c) => {
                const Icon = commIcons[c.type];
                return (
                  <div
                    key={c.id}
                    className="relative pl-10 animate-slide-in"
                  >
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
    </div>
  );
}
