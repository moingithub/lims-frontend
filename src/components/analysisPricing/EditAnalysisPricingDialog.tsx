import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "../ui/dialog";
import { Button } from "../ui/button";
import { AnalysisPricingForm, AnalysisPricingFormData } from "./AnalysisPricingForm";

interface EditAnalysisPricingDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  formData: AnalysisPricingFormData;
  onFormChange: (data: AnalysisPricingFormData) => void;
  onConfirm: () => void;
}

export function EditAnalysisPricingDialog({
  open,
  onOpenChange,
  formData,
  onFormChange,
  onConfirm,
}: EditAnalysisPricingDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Edit Analysis Pricing</DialogTitle>
          <DialogDescription>
            Update the analysis pricing details. Click save when you're done.
          </DialogDescription>
        </DialogHeader>
        <AnalysisPricingForm formData={formData} onChange={onFormChange} />
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
