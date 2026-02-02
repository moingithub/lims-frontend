import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "../ui/dialog";
import { Button } from "../ui/button";
import { Trash2 } from "lucide-react";
import { CompanyArea } from "../../services/companyAreaService";
import { companyMasterService } from "../../services/companyMasterService";

interface DeleteCompanyAreaDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  companyArea: CompanyArea | null;
  onConfirm: () => void;
}

export function DeleteCompanyAreaDialog({
  open,
  onOpenChange,
  companyArea,
  onConfirm,
}: DeleteCompanyAreaDialogProps) {
  // Helper to get company name
  const getCompanyName = (companyId: number): string => {
    const company = companyMasterService.getCompanyById(companyId);
    return company ? company.company_name : `Company #${companyId}`;
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Delete Company Area</DialogTitle>
          <DialogDescription>
            Are you sure you want to delete "{companyArea?.area}" from{" "}
            {companyArea && getCompanyName(companyArea.company_id)} ({companyArea?.region})? This action
            cannot be undone.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
          >
            Cancel
          </Button>
          <Button variant="destructive" onClick={onConfirm}>
            <Trash2 className="w-4 h-4 mr-2" />
            Delete
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}