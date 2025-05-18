"use client";

import { Card } from "@/components/ui/card";
import { useEffect, useState } from "react";
import { vendorService } from "@/services/vendor.service";
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
} from "recharts";

export function VendorDashboard() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [productsRes, categoriesRes] = await Promise.all([
          vendorService.getProducts(),
          vendorService.getCategories(),
        ]);

        setProducts(productsRes.data);
        setCategories(categoriesRes.data);
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
      }
    };

    fetchData();
  }, []);

  // Calculate total stock value
  const totalStockValue = products.reduce((acc, product) => {
    return acc + product.price * product.stock;
  }, 0);

  // Group products by category for the chart
  const productsByCategory = products.reduce((acc, product) => {
    const categoryName = product.category.name;
    if (!acc[categoryName]) {
      acc[categoryName] = {
        name: categoryName,
        count: 0,
        value: 0,
      };
    }
    acc[categoryName].count += 1;
    acc[categoryName].value += product.price * product.stock;
    return acc;
  }, {});

  const chartData = Object.values(productsByCategory);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="p-6">
          <h3 className="text-sm font-medium text-gray-500">Total Products</h3>
          <p className="mt-2 text-3xl font-semibold text-gray-900">
            {products.length}
          </p>
        </Card>
        <Card className="p-6">
          <h3 className="text-sm font-medium text-gray-500">
            Total Categories
          </h3>
          <p className="mt-2 text-3xl font-semibold text-gray-900">
            {categories.length}
          </p>
        </Card>
        <Card className="p-6">
          <h3 className="text-sm font-medium text-gray-500">
            Total Stock Value
          </h3>
          <p className="mt-2 text-3xl font-semibold text-gray-900">
            ${totalStockValue.toFixed(2)}
          </p>
        </Card>
        <Card className="p-6">
          <h3 className="text-sm font-medium text-gray-500">Average Price</h3>
          <p className="mt-2 text-3xl font-semibold text-gray-900">
            $
            {products.length
              ? (
                  products.reduce((acc, p) => acc + p.price, 0) /
                  products.length
                ).toFixed(2)
              : "0.00"}
          </p>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card className="p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            Products by Category
          </h3>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="count" fill="#f97316" name="Number of Products" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card className="p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            Stock Value by Category
          </h3>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="value"
                  stroke="#f97316"
                  name="Stock Value"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      <Card className="p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">
          Recent Products
        </h3>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead>
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Category
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Price
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Stock
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {products.slice(0, 5).map((product) => (
                <tr key={product._id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {product.name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {product.category.name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    ${product.price}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {product.stock}
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
