import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "../ui/dialog";
import { Button } from "../ui/button";
import { RoleForm, RoleFormData } from "./RoleForm";

interface AddRoleDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  formData: RoleFormData;
  onFormChange: (data: RoleFormData) => void;
  onConfirm: () => void;
}

export function AddRoleDialog({
  open,
  onOpenChange,
  formData,
  onFormChange,
  onConfirm,
}: AddRoleDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Add New Record</DialogTitle>
          <DialogDescription>Add a new role to the system</DialogDescription>
        </DialogHeader>
        <RoleForm formData={formData} onChange={onFormChange} />
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
