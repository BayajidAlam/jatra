"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { AddTrainDialog } from "@/components/admin/add-train-dialog";

// Mock Data
const trains = [
  { id: 1, name: "Suborno Express", number: "701", type: "Intercity", seats: 850, status: "Active" },
  { id: 2, name: "Parabat Express", number: "709", type: "Intercity", seats: 920, status: "Maintenance" },
  { id: 3, name: "Sonar Bangla", number: "788", type: "Non-Stop", seats: 600, status: "Active" },
];

export default function TrainsPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
          Train Management
        </h1>
        <AddTrainDialog />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Trains</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Train Name</TableHead>
                <TableHead>Train No</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Capacity</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {trains.map((train) => (
                <TableRow key={train.id}>
                  <TableCell className="font-medium">{train.name}</TableCell>
                  <TableCell>{train.number}</TableCell>
                  <TableCell>{train.type}</TableCell>
                  <TableCell>{train.seats} seats</TableCell>
                  <TableCell>
                    <span
                      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                        train.status === "Active"
                          ? "bg-green-100 text-green-800"
                          : "bg-yellow-100 text-yellow-800"
                      }`}
                    >
                      {train.status}
                    </span>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="sm" className="text-slate-500">
                      Edit
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
