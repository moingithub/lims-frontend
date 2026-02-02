import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "../ui/dialog";
import { Button } from "../ui/button";
import { CompanyAreaForm, CompanyAreaFormData } from "./CompanyAreaForm";

interface EditCompanyAreaDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  formData: CompanyAreaFormData;
  onFormChange: (data: CompanyAreaFormData) => void;
  onConfirm: () => void;
}

export function EditCompanyAreaDialog({
  open,
  onOpenChange,
  formData,
  onFormChange,
  onConfirm,
}: EditCompanyAreaDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Edit Company Area</DialogTitle>
          <DialogDescription>
            Update the company area details. Click save when you're done.
          </DialogDescription>
        </DialogHeader>
        <CompanyAreaForm formData={formData} onChange={onFormChange} />
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
