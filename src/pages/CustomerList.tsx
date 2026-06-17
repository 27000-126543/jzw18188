import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Search, Phone, Mail, ChevronRight } from "lucide-react";
import { api } from "@/api/client";
import { formatCurrency, formatDate } from "@/utils/format";
import type { Customer } from "../../shared/types";

export default function CustomerList() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [search, setSearch] = useState("");

  useEffect(() => {
    api.customers.list({ search: search || undefined }).then(setCustomers);
  }, [search]);

  return (
    <div className="space-y-5 animate-fade-in">
      <div className="flex items-center justify-between">
        <div className="relative">
          <Search
            size={16}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
          />
          <input
            className="input pl-9 w-80"
            placeholder="搜索客户名称、联系人..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="text-sm text-slate-500">
          共 <span className="font-semibold text-navy-800">{customers.length}</span>{" "}
          位成交客户
        </div>
      </div>

      <div className="card overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200">
              <th className="text-left text-xs font-semibold text-slate-600 uppercase tracking-wider px-6 py-3">
                客户信息
              </th>
              <th className="text-left text-xs font-semibold text-slate-600 uppercase tracking-wider px-6 py-3">
                联系方式
              </th>
              <th className="text-left text-xs font-semibold text-slate-600 uppercase tracking-wider px-6 py-3">
                成交金额
              </th>
              <th className="text-left text-xs font-semibold text-slate-600 uppercase tracking-wider px-6 py-3">
                成交日期
              </th>
              <th className="w-10 px-6 py-3"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {customers.length === 0 ? (
              <tr>
                <td
                  colSpan={5}
                  className="text-center py-16 text-slate-400 text-sm"
                >
                  暂无客户档案
                </td>
              </tr>
            ) : (
              customers.map((c) => (
                <tr key={c.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="font-medium text-navy-800">
                      {c.companyName}
                    </div>
                    <div className="text-xs text-slate-500 mt-0.5">
                      {c.contactName}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-col gap-1 text-sm text-slate-600">
                      <div className="flex items-center gap-1.5">
                        <Phone size={12} />
                        {c.phone}
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Mail size={12} />
                        {c.email}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="font-semibold text-emerald-600">
                      {formatCurrency(c.dealValue)}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-600">
                    {formatDate(c.closedAt)}
                  </td>
                  <td className="px-6 py-4">
                    <Link
                      to={`/customers/${c.id}`}
                      className="inline-flex items-center text-brand-500 hover:text-brand-600 text-sm font-medium"
                    >
                      详情
                      <ChevronRight size={14} />
                    </Link>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
