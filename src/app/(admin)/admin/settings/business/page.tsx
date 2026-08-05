import BusinessSettingsForm from "@/components/admin/settings/BusinessSettingsForm";
import AdminGuard from "@/components/guards/AdminGuard";

export default function BusinessSettingsPage() {
  return (
       <AdminGuard>
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">
          Business Settings
        </h1>
        <p className="mt-1 text-sm text-gray-500">
          Manage your logo, business information, and social links.
        </p>
      </div>

      <BusinessSettingsForm />
    </div>

    </AdminGuard>
  );
}