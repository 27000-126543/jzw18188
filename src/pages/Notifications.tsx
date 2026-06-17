import { useEffect } from "react";
import { Link } from "react-router-dom";
import {
  Snowflake,
  TrendingUp,
  AlertTriangle,
  Check,
} from "lucide-react";
import { useAppStore } from "@/store/useAppStore";
import { relativeTime } from "@/utils/format";
import type { NotificationType } from "../../shared/types";

const iconMap: Record<NotificationType, typeof Snowflake> = {
  cooling: Snowflake,
  stage_change: TrendingUp,
  lost: AlertTriangle,
};

const colorMap: Record<NotificationType, string> = {
  cooling: "bg-cooling/15 text-cooling",
  stage_change: "bg-brand-500/15 text-brand-600",
  lost: "bg-danger/15 text-danger",
};

export default function Notifications() {
  const {
    notifications,
    fetchNotifications,
    markNotificationRead,
  } = useAppStore();

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  return (
    <div className="space-y-4 animate-fade-in">
      {notifications.length === 0 ? (
        <div className="card p-16 text-center">
          <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center mx-auto mb-4 text-slate-400">
            <Check size={28} />
          </div>
          <h3 className="font-display text-lg font-semibold text-navy-800 mb-1">
            暂无通知
          </h3>
          <p className="text-sm text-slate-500">
            您的团队线索进展顺利，暂无新的通知
          </p>
        </div>
      ) : (
        notifications.map((n) => {
          const Icon = iconMap[n.type];
          return (
            <div
              key={n.id}
              className={`card p-5 transition-all duration-200 ${
                n.read ? "opacity-70" : ""
              }`}
            >
              <div className="flex items-start gap-4">
                <div
                  className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${colorMap[n.type]}`}
                >
                  <Icon size={18} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <h4 className="font-medium text-navy-800">{n.title}</h4>
                    <span className="text-xs text-slate-400 whitespace-nowrap">
                      {relativeTime(n.createdAt)}
                    </span>
                  </div>
                  <p className="text-sm text-slate-600 mt-1 leading-relaxed">
                    {n.content}
                  </p>
                  <div className="flex items-center gap-2 mt-3">
                    {n.relatedLeadId && (
                      <Link
                        to={`/leads/${n.relatedLeadId}`}
                        className="text-xs text-brand-500 hover:text-brand-600 font-medium"
                      >
                        查看线索详情 →
                      </Link>
                    )}
                    {!n.read && (
                      <button
                        onClick={() => markNotificationRead(n.id)}
                        className="ml-auto text-xs text-slate-500 hover:text-navy-800 transition-colors flex items-center gap-1"
                      >
                        <Check size={12} />
                        标记已读
                      </button>
                    )}
                    {n.read && (
                      <span className="ml-auto text-xs text-slate-400 flex items-center gap-1">
                        <Check size={12} />
                        已读
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          );
        })
      )}
    </div>
  );
}
