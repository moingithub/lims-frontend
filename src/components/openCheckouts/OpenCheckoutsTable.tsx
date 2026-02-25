// ...existing code...
import React from "react";
import { OpenCheckout } from "../../services/openCheckoutsService";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "../ui/table";

interface Props {
  checkouts: OpenCheckout[];
  searchTerm: string;
}

export function OpenCheckoutsTable({ checkouts, searchTerm }: Props) {
  const filtered = Array.isArray(checkouts)
    ? checkouts.filter((row) => {
        const term = searchTerm.toLowerCase();
        return (
          row.company_name.toLowerCase().includes(term) ||
          row.cylinder_type.toLowerCase().includes(term) ||
          row.cylinder_number.toLowerCase().includes(term) ||
          row.contact_name.toLowerCase().includes(term) ||
          row.phone.toLowerCase().includes(term) ||
          row.email.toLowerCase().includes(term)
        );
      })
    : [];

  return (
    <div className="border rounded-lg overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Company</TableHead>
            <TableHead>Cylinder Type</TableHead>
            <TableHead>Cylinder Number</TableHead>
            <TableHead>Contact Name</TableHead>
            <TableHead>Phone</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Checkout Date</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filtered.length === 0 ? (
            <TableRow>
              <TableCell
                colSpan={7}
                className="text-center text-muted-foreground py-8"
              >
                No open checkouts found
              </TableCell>
            </TableRow>
          ) : (
            filtered.map((row) => (
              <TableRow key={row.id}>
                <TableCell>{row.company_name}</TableCell>
                <TableCell>{row.cylinder_type}</TableCell>
                <TableCell>{row.cylinder_number}</TableCell>
                <TableCell>{row.contact_name}</TableCell>
                <TableCell>{row.phone}</TableCell>
                <TableCell>{row.email}</TableCell>
                <TableCell>
                  {new Date(row.checkout_date).toLocaleDateString()}
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}
