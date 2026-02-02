import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "../ui/dialog";
import { Button } from "../ui/button";
import { CompanyAreaForm, CompanyAreaFormData } from "./CompanyAreaForm";

interface AddCompanyAreaDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  formData: CompanyAreaFormData;
  onFormChange: (data: CompanyAreaFormData) => void;
  onConfirm: () => void;
}

export function AddCompanyAreaDialog({
  open,
  onOpenChange,
  formData,
  onFormChange,
  onConfirm,
}: AddCompanyAreaDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Add New Company Area</DialogTitle>
          <DialogDescription>Add a new geographic area for a company</DialogDescription>
        </DialogHeader>
        <CompanyAreaForm formData={formData} onChange={onFormChange} />
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={onConfirm}>Save</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
