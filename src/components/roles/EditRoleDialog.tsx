import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "../ui/dialog";
import { Button } from "../ui/button";
import { RoleForm, RoleFormData } from "./RoleForm";

interface EditRoleDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  formData: RoleFormData;
  onFormChange: (data: RoleFormData) => void;
  onConfirm: () => void;
}

export function EditRoleDialog({
  open,
  onOpenChange,
  formData,
  onFormChange,
  onConfirm,
}: EditRoleDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Edit Record</DialogTitle>
          <DialogDescription>
            Update the details for this record. Click save when you're done.
          </DialogDescription>
        </DialogHeader>
        <RoleForm formData={formData} onChange={onFormChange} />
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
