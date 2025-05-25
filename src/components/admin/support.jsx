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
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";

export function SupportPage() {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [selectedStatus, setSelectedStatus] = useState("");
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [response, setResponse] = useState("");

  const fetchTickets = async () => {
    try {
      setLoading(true);
      const result = await adminService.getSupportTickets(page, selectedStatus);
      setTickets(result.data.tickets);
    } catch (error) {
      toast.error("Failed to fetch support tickets");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTickets();
  }, [page, selectedStatus]);

  const handleTicket = async () => {
    if (!selectedTicket || !response) return;

    try {
      await adminService.handleSupportTicket({
        ticketId: selectedTicket._id,
        response,
      });
      toast.success("Ticket handled successfully");
      setSelectedTicket(null);
      setResponse("");
      fetchTickets();
    } catch (error) {
      toast.error("Failed to handle ticket");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold">Support Tickets</h1>
        <select
          value={selectedStatus}
          onChange={(e) => setSelectedStatus(e.target.value)}
          className="rounded-md border border-input px-3 py-2"
        >
          <option value="">All Status</option>
          <option value="pending">Pending</option>
          <option value="answered">Answered</option>
        </select>
      </div>

      <Card className="p-6">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead>
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  User
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Subject
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
              {tickets.map((ticket) => (
                <tr key={ticket._id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {ticket.user.name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {ticket.subject}
                  </td>
                  <td className="px-6 py-4">{ticket.message}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <Badge
                      className={`${
                        ticket.status === "answered" ? "bg-orange-500" : ""
                      }`}
                      variant={
                        ticket.status === "answered" ? "default" : "secondary"
                      }
                    >
                      {ticket.status}
                    </Badge>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {ticket.status === "pending" && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setSelectedTicket(ticket)}
                      >
                        Respond
                      </Button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="mt-6 flex justify-between items-center">
          <Button
            onClick={() => setPage(Math.max(0, page - 1))}
            disabled={page === 0}
          >
            Previous
          </Button>
          <span>Page {page + 1}</span>
          <Button
            onClick={() => setPage(page + 1)}
            disabled={tickets.length < 20}
          >
            Next
          </Button>
        </div>
      </Card>

      <AlertDialog
        open={!!selectedTicket}
        onOpenChange={() => setSelectedTicket(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Respond to Support Ticket</AlertDialogTitle>
            <AlertDialogDescription>
              Please provide a response to this support ticket.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="py-4">
            <Input
              value={response}
              onChange={(e) => setResponse(e.target.value)}
              placeholder="Enter your response..."
              className="mt-2"
            />
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className={"bg-orange-500"}
              onClick={handleTicket}
            >
              Submit
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
