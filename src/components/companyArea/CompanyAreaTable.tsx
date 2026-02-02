import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../ui/table";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { Edit, Trash2, MapPin } from "lucide-react";
import { CompanyArea } from "../../services/companyAreaService";
import { companyMasterService } from "../../services/companyMasterService";

interface CompanyAreaTableProps {
  companyAreas: CompanyArea[];
  onEdit: (companyArea: CompanyArea) => void;
  onDelete: (companyArea: CompanyArea) => void;
  onToggleStatus: (id: number) => void;
}

export function CompanyAreaTable({ companyAreas, onEdit, onDelete, onToggleStatus }: CompanyAreaTableProps) {
  // Helper to get company name and code by ID
  const getCompanyDisplay = (companyId: number): string => {
    const company = companyMasterService.getCompanyById(companyId);
    return company ? `${company.company_name} (${company.company_code})` : `Company #${companyId}`;
  };

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Company</TableHead>
          <TableHead>Area</TableHead>
          <TableHead>Region</TableHead>
          <TableHead>Description</TableHead>
          <TableHead>Active</TableHead>
          <TableHead className="text-right">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {companyAreas.map((companyArea) => (
          <TableRow key={companyArea.id}>
            <TableCell>{getCompanyDisplay(companyArea.company_id)}</TableCell>
            <TableCell>
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-muted-foreground" />
                {companyArea.area}
              </div>
            </TableCell>
            <TableCell className="text-sm text-muted-foreground">
              {companyArea.region}
            </TableCell>
            <TableCell className="text-sm text-muted-foreground">
              {companyArea.description}
            </TableCell>
            <TableCell>
              <span
                className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs cursor-pointer ${
                  companyArea.active
                    ? "bg-green-100 text-green-800"
                    : "bg-red-100 text-red-800"
                }`}
                onClick={() => onToggleStatus(companyArea.id)}
              >
                {companyArea.active ? "True" : "False"}
              </span>
            </TableCell>
            <TableCell className="text-right">
              <div className="flex justify-end gap-1">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onEdit(companyArea)}
                >
                  <Edit className="w-4 h-4 text-green-600" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onDelete(companyArea)}
                >
                  <Trash2 className="w-4 h-4 text-red-600" />
                </Button>
              </div>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}