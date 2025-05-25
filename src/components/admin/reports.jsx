"use client";

import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { adminService } from "@/services/admin.service";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogFooter,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";

export function ReportsPage() {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [selectedStatus, setSelectedStatus] = useState("");
  const [selectedReport, setSelectedReport] = useState(null);
  const [response, setResponse] = useState("");
  const [totalPages, setTotalPages] = useState(1);
  const [isHandling, setIsHandling] = useState(false);

  const fetchReports = async () => {
    try {
      setLoading(true);
      const result = await adminService.getReports(page, selectedStatus);
      setReports(result.data.reports || []);
      setTotalPages(result.data.pages || 1);
      console.log("Fetched reports:", result.data);
    } catch (error) {
      console.error("Error fetching reports:", error.message, error);
      toast.error("Failed to fetch reports");
      setReports([]);
      setTotalPages(1);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const debounceTimer = setTimeout(() => {
      fetchReports();
    }, 300);
    return () => clearTimeout(debounceTimer);
  }, [page, selectedStatus]);

  const handleReport = async () => {
    if (!selectedReport || !response.trim()) {
      toast.error("Please provide a response");
      return;
    }

    try {
      setIsHandling(true);
      const result = await adminService.handleReport({
        reportId: selectedReport._id,
        status: "resolved",
        response,
      });
      console.log("Handle report response:", result);
      toast.success("Report handled successfully");
      setSelectedReport(null);
      setResponse("");
      await fetchReports();
    } catch (error) {
      console.error(
        "Error handling report:",
        error.message,
        error.response?.data
      );
      toast.error(`Failed to handle report: ${error.message}`);
    } finally {
      setIsHandling(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold">Reports Management</h1>
        <select
          value={selectedStatus}
          onChange={(e) => {
            setSelectedStatus(e.target.value);
            setPage(0);
          }}
          className="rounded-md border border-input px-3 py-2"
        >
          <option value="">All Status</option>
          <option value="pending">Pending</option>
          <option value="resolved">Resolved</option>
          <option value="rejected">Rejected</option>
        </select>
      </div>

      <Card className="p-6">
        {loading ? (
          <div className="flex justify-center items-center h-32">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
          </div>
        ) : reports.length === 0 ? (
          <div className="text-center py-4">No reports found</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead>
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Reporter
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Reported User
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Reason
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Message
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {reports.map((report) => (
                  <tr key={report._id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {report.reporter?.name || "Unknown"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {report.reportedUser?.name || "Unknown"}
                    </td>
                    <td className="px-6 py-4">
                      {report.reason || "No reason provided"}
                    </td>
                    <td className="px-6 py-4">
                      {report.description || "No message provided"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <Badge
                        className={`${
                          report.status === "resolved" ? "bg-orange-500" : ""
                        }`}
                        variant={
                          report.status === "resolved"
                            ? "default"
                            : report.status === "rejected"
                            ? "destructive"
                            : "secondary"
                        }
                      >
                        {report.status}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {report.status === "pending" && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setSelectedReport(report)}
                          disabled={isHandling}
                        >
                          Handle
                        </Button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <div className="mt-6 flex justify-between items-center">
          <Button
            onClick={() => setPage(Math.max(0, page - 1))}
            disabled={page === 0}
          >
            Previous
          </Button>
          <span>
            Page {page + 1} of {totalPages}
          </span>
          <Button
            onClick={() => setPage(page + 1)}
            disabled={page >= totalPages - 1 || totalPages === 0}
          >
            Next
          </Button>
        </div>
      </Card>

      <AlertDialog
        open={!!selectedReport}
        onOpenChange={() => {
          setSelectedReport(null);
          setResponse("");
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Handle Report</AlertDialogTitle>
            <AlertDialogDescription>
              Please provide a response for this report.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="py-4">
            <Input
              value={response}
              onChange={(e) => setResponse(e.target.value)}
              placeholder="Enter your response..."
              className="mt-2"
              disabled={isHandling}
            />
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isHandling}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className={"bg-orange-500"}
              onClick={handleReport}
              disabled={isHandling}
            >
              Submit
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
