// src/app/(admin)/layout.tsx

import AdminNavbar from "@/components/admin/AdminNavbar";
import Navbar from "@/components/ui/head/Navbar";


export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-[#f5f5f5] dark:bg-gray-900">
      {/* Navbar */}
      <AdminNavbar />

      {/* Page Content */}
      <main className="pt-6"> 
        {children}
      </main>
    </div>
  );
}