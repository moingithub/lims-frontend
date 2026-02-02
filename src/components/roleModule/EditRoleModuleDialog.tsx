import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "../ui/dialog";
import { Button } from "../ui/button";
import { RoleModuleForm, RoleModuleFormData } from "./RoleModuleForm";

interface EditRoleModuleDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  formData: RoleModuleFormData;
  onFormChange: (field: string, value: string | number | boolean) => void;
  onConfirm: () => void;
}

export function EditRoleModuleDialog({
  open,
  onOpenChange,
  formData,
  onFormChange,
  onConfirm,
}: EditRoleModuleDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md" aria-describedby={undefined}>
        <DialogHeader>
          <DialogTitle>Edit Module Permission</DialogTitle>
          <DialogDescription>
            Update module access permissions for this role
          </DialogDescription>
        </DialogHeader>
        <RoleModuleForm formData={formData} onChange={onFormChange} />
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