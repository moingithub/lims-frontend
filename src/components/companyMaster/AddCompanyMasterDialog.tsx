import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "../ui/dialog";
import { Button } from "../ui/button";
import { CompanyMasterForm, CompanyMasterFormData } from "./CompanyMasterForm";

interface AddCompanyMasterDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  formData: CompanyMasterFormData;
  onFormChange: (data: CompanyMasterFormData) => void;
  onConfirm: () => void;
}

export function AddCompanyMasterDialog({
  open,
  onOpenChange,
  formData,
  onFormChange,
  onConfirm,
}: AddCompanyMasterDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Add New Company</DialogTitle>
          <DialogDescription>Enter the details for the new company.</DialogDescription>
        </DialogHeader>
        <CompanyMasterForm formData={formData} onChange={onFormChange} />
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={onConfirm}>Save Company</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
