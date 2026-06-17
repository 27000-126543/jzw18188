import { Outlet, useLocation } from "react-router-dom";
import Sidebar from "./Sidebar";

const breadcrumbMap: Record<string, string> = {
  "": "仪表盘",
  leads: "线索看板",
  customers: "客户档案",
  analytics: "数据分析",
  targets: "销售目标",
  notifications: "通知中心",
};

export default function Layout() {
  const location = useLocation();
  const pathParts = location.pathname.split("/").filter(Boolean);
  const pageTitle = breadcrumbMap[pathParts[0]] || "仪表盘";

  return (
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <header className="bg-white border-b border-slate-200 px-8 py-4 sticky top-0 z-10">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-xs text-slate-500 mb-0.5">
                CRM / {pageTitle}
              </div>
              <h2 className="font-display text-xl font-bold text-navy-800">
                {pageTitle}
              </h2>
            </div>
          </div>
        </header>
        <main className="flex-1 p-8 overflow-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
