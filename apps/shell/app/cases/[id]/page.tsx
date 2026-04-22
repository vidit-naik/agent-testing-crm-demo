"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/Table";
import { LifeBuoy, Trash2 } from "lucide-react";
import Link from "next/link";
import { formatDateUTC } from "@/lib/dates";
import { useApp } from "@/contexts/AppContext";

export default function CaseDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { openModal, refreshKey, addToast } = useApp();
  const caseId = params.id as string;

  const [caseData, setCaseData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (caseId) {
      loadCaseData();
    }
  }, [caseId, refreshKey]);

  const loadCaseData = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/cases/${caseId}`);
      if (!response.ok) throw new Error("Failed to fetch case data");
      const data = await response.json();
      setCaseData(data);
    } catch (error) {
      console.error("Error loading case data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!caseData) return;
    if (!confirm(`Are you sure you want to delete ${caseData.subject}?`))
      return;

    try {
      const response = await fetch(`/api/cases/${caseId}`, {
        method: "DELETE",
      });

      if (!response.ok) throw new Error("Failed to delete case");

      router.push("/cases");
      addToast("Case deleted successfully", "success");
    } catch (error) {
      console.error("Error deleting case:", error);
      addToast("Failed to delete case", "error");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">Loading...</div>
    );
  }

  if (!caseData) {
    return (
      <div className="flex items-center justify-center h-full">
        Case not found
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-start gap-4">
          <div className="h-16 w-16 rounded-lg bg-primary/10 flex items-center justify-center">
            <LifeBuoy className="h-8 w-8 text-primary" />
          </div>
          <div>
            <h1 className="text-3xl font-bold">{caseData.subject}</h1>
            <div className="flex items-center gap-2 mt-2">
              <Badge variant={caseData.status === 'New' ? 'info' : caseData.status === 'In Progress' ? 'warning' : caseData.status === 'Closed' ? 'success' : 'default'}>{caseData.status}</Badge>
              <Badge
                variant={
                  caseData.priority === "High"
                    ? "error"
                    : caseData.priority === "Medium"
                    ? "warning"
                    : caseData.priority === "Low"
                    ? "info"
                    : "default"
                }
              >
                {caseData.priority}
              </Badge>
            </div>
          </div>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => openModal("editCase", { case: caseData })}
          >
            Edit
          </Button>

          <Button variant="outline" onClick={handleDelete}>
            <Trash2 className="h-4 w-4 mr-2" />
            Delete
          </Button>
        </div>
      </div>

      {/* Case Details */}
      <Card>
        <CardHeader>
          <CardTitle>Case Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {caseData.description && (
            <div className="text-sm">
              <span className="font-medium">Description:</span>
              <p className="mt-1 text-muted-foreground">
                {caseData.description}
              </p>
            </div>
          )}
          <div className="text-sm">
            <span className="font-medium">Status:</span> {caseData.status}
          </div>
          <div className="text-sm">
            <span className="font-medium">Priority:</span> {caseData.priority}
          </div>
          {caseData.category && (
            <div className="text-sm">
              <span className="font-medium">Category:</span> {caseData.category}
            </div>
          )}
          {caseData.resolution && (
            <div className="text-sm">
              <span className="font-medium">Resolution:</span>
              <p className="mt-1 text-muted-foreground">
                {caseData.resolution}
              </p>
            </div>
          )}
          {caseData.satisfactionRating != null && (
            <div className="text-sm">
              <span className="font-medium">Satisfaction Rating:</span>{" "}
              {caseData.satisfactionRating}/5
            </div>
          )}
          <div className="text-sm">
            <span className="font-medium">Owner:</span> {caseData.owner || "-"}
          </div>
          {caseData.account && (
            <div className="text-sm">
              <span className="font-medium">Account:</span>{" "}
              <Link
                href={`/accounts/${caseData.account.id}`}
                className="text-primary hover:underline"
              >
                {caseData.account.name}
              </Link>
            </div>
          )}
          {caseData.contact && (
            <div className="text-sm">
              <span className="font-medium">Contact:</span>{" "}
              <Link
                href={`/contacts/${caseData.contact.id}`}
                className="text-primary hover:underline"
              >
                {caseData.contact.firstName} {caseData.contact.lastName}
              </Link>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Tasks */}
      {caseData.tasks && caseData.tasks.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Related Tasks</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Title</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Priority</TableHead>
                  <TableHead>Due Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {caseData.tasks.map((task: any) => (
                  <TableRow key={task.id}>
                    <TableCell>
                      <Link
                        href={`/tasks/${task.id}`}
                        className="font-medium hover:text-primary"
                      >
                        {task.title}
                      </Link>
                    </TableCell>
                    <TableCell>
                      <Badge>{task.status}</Badge>
                    </TableCell>
                    <TableCell>
                      <Badge>{task.priority}</Badge>
                    </TableCell>
                    <TableCell>
                      {task.dueDate
                        ? formatDateUTC(task.dueDate)
                        : "-"}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
