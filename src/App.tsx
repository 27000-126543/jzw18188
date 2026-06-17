import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { useEffect } from "react";
import Layout from "@/components/Layout";
import Dashboard from "@/pages/Dashboard";
import LeadBoard from "@/pages/LeadBoard";
import LeadDetail from "@/pages/LeadDetail";
import CustomerList from "@/pages/CustomerList";
import CustomerDetail from "@/pages/CustomerDetail";
import Analytics from "@/pages/Analytics";
import SalesTargets from "@/pages/SalesTargets";
import Notifications from "@/pages/Notifications";
import { useAppStore } from "@/store/useAppStore";

function AppInit() {
  const fetchUsers = useAppStore((s) => s.fetchUsers);
  const fetchNotifications = useAppStore((s) => s.fetchNotifications);

  useEffect(() => {
    fetchUsers();
    fetchNotifications();

    const interval = setInterval(() => {
      fetchNotifications();
    }, 3000);

    return () => clearInterval(interval);
  }, [fetchUsers, fetchNotifications]);

  return null;
}

export default function App() {
  return (
    <Router>
      <AppInit />
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<Dashboard />} />
          <Route path="/leads" element={<LeadBoard />} />
          <Route path="/leads/:id" element={<LeadDetail />} />
          <Route path="/customers" element={<CustomerList />} />
          <Route path="/customers/:id" element={<CustomerDetail />} />
          <Route path="/analytics" element={<Analytics />} />
          <Route path="/targets" element={<SalesTargets />} />
          <Route path="/notifications" element={<Notifications />} />
        </Route>
      </Routes>
    </Router>
  );
}
