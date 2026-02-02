import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "../ui/dialog";
import { Button } from "../ui/button";
import { Save, X } from "lucide-react";
import { CompanyAreaForm, CompanyAreaFormData } from "./CompanyAreaForm";

interface CompanyAreaDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  formData: CompanyAreaFormData;
  onFormChange: (data: CompanyAreaFormData) => void;
  onConfirm: () => void;
  isEditing: boolean;
}

export function CompanyAreaDialog({
  open,
  onOpenChange,
  formData,
  onFormChange,
  onConfirm,
  isEditing,
}: CompanyAreaDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent aria-describedby={undefined}>
        <DialogHeader>
          <DialogTitle>
            {isEditing ? "Edit Company Area" : "Add Company Area"}
          </DialogTitle>
        </DialogHeader>
        <CompanyAreaForm formData={formData} onChange={onFormChange} />
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            <X className="w-4 h-4 mr-2" />
            Cancel
          </Button>
          <Button onClick={onConfirm}>
            <Save className="w-4 h-4 mr-2" />
            Save
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
