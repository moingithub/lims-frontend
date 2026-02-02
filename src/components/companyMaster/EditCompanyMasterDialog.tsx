import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "../ui/dialog";
import { Button } from "../ui/button";
import { CompanyMasterForm, CompanyMasterFormData } from "./CompanyMasterForm";

interface EditCompanyMasterDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  formData: CompanyMasterFormData;
  onFormChange: (data: CompanyMasterFormData) => void;
  onConfirm: () => void;
}

export function EditCompanyMasterDialog({
  open,
  onOpenChange,
  formData,
  onFormChange,
  onConfirm,
}: EditCompanyMasterDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Edit Company</DialogTitle>
          <DialogDescription>
            Update the details for this company.
          </DialogDescription>
        </DialogHeader>
        <CompanyMasterForm formData={formData} onChange={onFormChange} />
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={onConfirm}>Save Changes</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
