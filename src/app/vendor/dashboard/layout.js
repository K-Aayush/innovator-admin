import { Sidebar } from "@/components/vendor/sidebar";
import { Header } from "@/components/vendor/header";

export default function VendorDashboardLayout({ children }) {
  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden transition-all duration-300 lg:pl-20">
        <Header />
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-100 p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
