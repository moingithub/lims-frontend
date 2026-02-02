import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "../ui/dialog";
import { Button } from "../ui/button";
import { RoleModuleForm, RoleModuleFormData } from "./RoleModuleForm";

interface AddRoleModuleDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  formData: RoleModuleFormData;
  onFormChange: (field: string, value: string | number | boolean) => void;
  onConfirm: () => void;
}

export function AddRoleModuleDialog({
  open,
  onOpenChange,
  formData,
  onFormChange,
  onConfirm,
}: AddRoleModuleDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md" aria-describedby={undefined}>
        <DialogHeader>
          <DialogTitle>Add Module Permission</DialogTitle>
          <DialogDescription>Assign module access permissions to a role</DialogDescription>
        </DialogHeader>
        <RoleModuleForm formData={formData} onChange={onFormChange} />
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={onConfirm}>Add Permission</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}