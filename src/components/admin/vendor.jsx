"use client";

import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { adminService } from "@/services/admin.service";
import { toast } from "sonner";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

export function VendorsPage() {
  const [vendors, setVendors] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchVendors = async () => {
    try {
      const response = await adminService.getVendorStats();
      setVendors(response.data);
    } catch (error) {
      toast.error("Failed to fetch vendor statistics");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVendors();

    // Real-time updates
    const interval = setInterval(fetchVendors, 30000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Vendor Management</h1>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card className="p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            Product Distribution
          </h3>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={vendors}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="vendor.businessName" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="totalProducts"
                  stroke="#8884d8"
                  name="Total Products"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card className="p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            Stock Value Distribution
          </h3>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={vendors}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="vendor.businessName" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="totalValue"
                  stroke="#82ca9d"
                  name="Total Stock Value"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      <Card className="p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">
          Vendor Details
        </h3>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead>
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Business Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Email
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Total Products
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Stock Value
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {vendors.map((vendor) => (
                <tr key={vendor.vendor._id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {vendor.vendor.businessName}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {vendor.vendor.email}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {vendor.totalProducts}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    ${vendor.totalValue.toFixed(2)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
