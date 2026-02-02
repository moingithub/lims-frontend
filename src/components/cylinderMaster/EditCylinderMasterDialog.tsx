import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "../ui/dialog";
import { Button } from "../ui/button";
import { CylinderMasterForm, CylinderMasterFormData } from "./CylinderMasterForm";

interface EditCylinderMasterDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  formData: CylinderMasterFormData;
  onFormChange: (data: CylinderMasterFormData) => void;
  onConfirm: () => void;
}

export function EditCylinderMasterDialog({
  open,
  onOpenChange,
  formData,
  onFormChange,
  onConfirm,
}: EditCylinderMasterDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>Edit Cylinder</DialogTitle>
          <DialogDescription>
            Update cylinder master record information
          </DialogDescription>
        </DialogHeader>
        <CylinderMasterForm formData={formData} onChange={onFormChange} />
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
