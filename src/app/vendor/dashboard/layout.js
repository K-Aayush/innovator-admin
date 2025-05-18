import { Sidebar } from "@/components/vendor/sidebar";
import { Header } from "@/components/vendor/header";

export default function VendorDashboardLayout({ children }) {
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
