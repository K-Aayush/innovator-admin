import { Sidebar } from "@/components/admin/sidebar";
import { Header } from "@/components/admin/header";

export default function AdminDashboardLayout({ children }) {
  return (
    <div className="flex min-h-screen bg-gray-100">
      <div className="w-20 lg:w-72 transition-all duration-300">
        <Sidebar />
      </div>
      <div className="flex-1">
        <Header />
        <main className="p-6">{children}</main>
      </div>
    </div>
  );
}
