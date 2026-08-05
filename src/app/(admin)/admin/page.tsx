


import AdminDashboard from "@/components/admin/dashboard/admin_Dashboard";
import AdminGuard from "@/components/guards/AdminGuard";

export default function AdminPage() {
  return (
    <AdminGuard>
      
      <AdminDashboard/>

    </AdminGuard>
  );
}