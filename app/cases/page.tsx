"use client";

import { useState, useEffect } from "react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Select } from "@/components/ui/Input";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/Table";
import { Plus, Pencil, Trash2 } from "lucide-react";
import Link from "next/link";
import { useApp } from "@/contexts/AppContext";
import type { Case } from "@/types";

export default function CasesPage() {
  const { openModal, addToast, refreshKey } = useApp();
  const [cases, setCases] = useState<any[]>([]);
  const [statusFilter, setStatusFilter] = useState("all");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadCases();
  }, [refreshKey]);

  const loadCases = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/cases");
      if (!response.ok) throw new Error("Failed to fetch cases");
      const data = await response.json();
      setCases(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Error loading cases:", error);
    } finally {
      setLoading(false);
    }
  };

  const filteredCases = cases.filter(
    (caseItem) => statusFilter === "all" || caseItem.status === statusFilter
  );

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case "New":
        return "info";
      case "In Progress":
        return "warning";
      case "Waiting":
        return "default";
      case "Closed":
        return "success";
      default:
        return "default";
    }
  };

  const getPriorityBadgeVariant = (priority: string) => {
    switch (priority) {
      case "High":
        return "error";
      case "Medium":
        return "warning";
      case "Low":
        return "info";
      default:
        return "default";
    }
  };

  const handleDelete = async (caseItem: any) => {
    if (!confirm(`Are you sure you want to delete "${caseItem.subject}"?`))
      return;

    try {
      const response = await fetch(`/api/cases/${caseItem.id}`, {
        method: "DELETE",
      });

      if (!response.ok) throw new Error("Failed to delete case");

      addToast("Case deleted successfully", "success");
      loadCases();
    } catch (error) {
      console.error("Error deleting case:", error);
      addToast("Failed to delete case", "error");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Cases</h1>
          <p className="text-muted-foreground">
            Manage customer support requests
          </p>
        </div>
        <Button onClick={() => openModal("createCase")}>
          <Plus className="h-4 w-4 mr-2" />
          New Case
        </Button>
      </div>

      <Card className="p-6">
        <div className="flex items-center gap-4 mb-6">
          <Select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            options={[
              { value: "all", label: "All Statuses" },
              { value: "New", label: "New" },
              { value: "In Progress", label: "In Progress" },
              { value: "Waiting", label: "Waiting" },
              { value: "Closed", label: "Closed" },
            ]}
            className="w-48"
          />
        </div>

        {loading ? (
          <div className="text-center py-8 text-muted-foreground">
            Loading cases...
          </div>
        ) : filteredCases.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            No cases found
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Subject</TableHead>
                <TableHead>Account</TableHead>
                <TableHead>Contact</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Priority</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Owner</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredCases.map((caseItem) => (
                <TableRow key={caseItem.id}>
                  <TableCell>
                    <Link href={`/cases/${caseItem.id}`} className="font-medium hover:text-primary">
                      {caseItem.subject}
                    </Link>
                  </TableCell>
                  <TableCell>
                    {caseItem.account?.name ? (
                      <Link
                        href={`/accounts/${caseItem.accountId}`}
                        className="text-primary hover:underline"
                      >
                        {caseItem.account.name}
                      </Link>
                    ) : (
                      "-"
                    )}
                  </TableCell>
                  <TableCell>
                    {caseItem.contact ? (
                      <Link
                        href={`/contacts/${caseItem.contactId}`}
                        className="text-primary hover:underline"
                      >
                        {caseItem.contact.firstName} {caseItem.contact.lastName}
                      </Link>
                    ) : (
                      "-"
                    )}
                  </TableCell>
                  <TableCell>
                    <Badge variant={getStatusBadgeVariant(caseItem.status)}>
                      {caseItem.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant={getPriorityBadgeVariant(caseItem.priority)}>
                      {caseItem.priority}
                    </Badge>
                  </TableCell>
                  <TableCell>{caseItem.category || "-"}</TableCell>
                  <TableCell>{caseItem.owner || "-"}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() =>
                          openModal("editCase", { case: caseItem })
                        }
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>

                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(caseItem)}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </Card>
    </div>
  );
}
