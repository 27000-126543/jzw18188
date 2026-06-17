import { NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  Kanban,
  Users,
  BarChart3,
  Target,
  Bell,
} from "lucide-react";
import { useAppStore } from "@/store/useAppStore";

const navItems = [
  { to: "/", label: "仪表盘", icon: LayoutDashboard, end: true },
  { to: "/leads", label: "线索看板", icon: Kanban },
  { to: "/customers", label: "客户档案", icon: Users },
  { to: "/analytics", label: "数据分析", icon: BarChart3 },
  { to: "/targets", label: "销售目标", icon: Target },
  { to: "/notifications", label: "通知中心", icon: Bell, badge: true },
];

export default function Sidebar() {
  const { unreadCount, currentUser } = useAppStore();

  return (
    <aside className="w-64 bg-navy-800 text-white min-h-screen flex flex-col">
      <div className="p-6 border-b border-navy-700">
        <h1 className="font-display text-xl font-bold tracking-tight">
          线索管理系统
        </h1>
        <p className="text-navy-300 text-xs mt-1">Lightweight CRM</p>
      </div>

      <nav className="flex-1 py-4 px-3 space-y-1">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.end}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                isActive
                  ? "bg-brand-500 text-white shadow-md"
                  : "text-navy-200 hover:bg-navy-700/60 hover:text-white"
              }`
            }
          >
            <item.icon size={18} />
            <span>{item.label}</span>
            {item.badge && unreadCount > 0 && (
              <span className="ml-auto bg-danger text-white text-xs px-2 py-0.5 rounded-full min-w-[20px] text-center">
                {unreadCount}
              </span>
            )}
          </NavLink>
        ))}
      </nav>

      <div className="p-4 border-t border-navy-700">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-brand-500 flex items-center justify-center text-sm font-semibold">
            {currentUser.name.slice(0, 1)}
          </div>
          <div className="min-w-0">
            <p className="text-sm font-medium truncate">{currentUser.name}</p>
            <p className="text-xs text-navy-300 truncate">
              {currentUser.role === "manager" ? "销售经理" : "销售人员"}
            </p>
          </div>
        </div>
      </div>
    </aside>
  );
}
