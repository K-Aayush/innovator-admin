"use client";

import { useEffect, useState } from "react";
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
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
} from "recharts";

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042"];

export function AdminDashboard() {
  const [userStats, setUserStats] = useState(null);
  const [vendorStats, setVendorStats] = useState([]);
  const [leaderboard, setLeaderboard] = useState([]);
  const [adStats, setAdStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        const [userStatsRes, vendorStatsRes, leaderboardRes, adStatsRes] =
          await Promise.all([
            adminService.getUserStats(),
            adminService.getVendorStats(),
            adminService.getLeaderboard(),
            adminService.getAdStats(),
          ]);

        setUserStats(userStatsRes.data);
        setVendorStats(vendorStatsRes.data);
        setLeaderboard(leaderboardRes.data);
        setAdStats(adStatsRes.data);
      } catch (error) {
        toast.error("Failed to fetch dashboard data");
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();

    // Set up real-time updates
    const interval = setInterval(fetchDashboardData, 30000);

    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* User Statistics */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="p-6">
          <h3 className="text-sm font-medium text-gray-500">Total Users</h3>
          <p className="mt-2 text-3xl font-semibold text-gray-900">
            {userStats?.total || 0}
          </p>
        </Card>
        <Card className="p-6">
          <h3 className="text-sm font-medium text-gray-500">New Today</h3>
          <p className="mt-2 text-3xl font-semibold text-gray-900">
            {userStats?.today || 0}
          </p>
        </Card>
        <Card className="p-6">
          <h3 className="text-sm font-medium text-gray-500">This Week</h3>
          <p className="mt-2 text-3xl font-semibold text-gray-900">
            {userStats?.thisWeek || 0}
          </p>
        </Card>
        <Card className="p-6">
          <h3 className="text-sm font-medium text-gray-500">This Month</h3>
          <p className="mt-2 text-3xl font-semibold text-gray-900">
            {userStats?.thisMonth || 0}
          </p>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card className="p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            Vendor Performance
          </h3>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={vendorStats}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="vendor.businessName" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar
                  dataKey="totalProducts"
                  fill="#0088FE"
                  name="Total Products"
                />
                <Bar
                  dataKey="totalValue"
                  fill="#00C49F"
                  name="Total Stock Value"
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card className="p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            Advertisement Performance
          </h3>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={adStats}
                  dataKey="totalBudget"
                  nameKey="_id"
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  label
                >
                  {adStats?.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={COLORS[index % COLORS.length]}
                    />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      {/* Leaderboard */}
      <Card className="p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">
          Top Contributors
        </h3>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead>
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  User
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Posts
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Level
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {leaderboard.map((user) => (
                <tr key={user._id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {user.author.email}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">{user.posts}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {user.author.level}
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
