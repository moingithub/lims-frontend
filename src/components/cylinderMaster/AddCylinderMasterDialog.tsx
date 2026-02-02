import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "../ui/dialog";
import { Button } from "../ui/button";
import { CylinderMasterForm, CylinderMasterFormData } from "./CylinderMasterForm";

interface AddCylinderMasterDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  formData: CylinderMasterFormData;
  onFormChange: (data: CylinderMasterFormData) => void;
  onConfirm: () => void;
}

export function AddCylinderMasterDialog({
  open,
  onOpenChange,
  formData,
  onFormChange,
  onConfirm,
}: AddCylinderMasterDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>Add New Cylinder</DialogTitle>
          <DialogDescription>Add a new cylinder to the master records</DialogDescription>
        </DialogHeader>
        <CylinderMasterForm formData={formData} onChange={onFormChange} />
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={onConfirm}>Add Cylinder</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
