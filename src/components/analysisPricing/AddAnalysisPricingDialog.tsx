import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "../ui/dialog";
import { Button } from "../ui/button";
import { AnalysisPricingForm, AnalysisPricingFormData } from "./AnalysisPricingForm";

interface AddAnalysisPricingDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  formData: AnalysisPricingFormData;
  onFormChange: (data: AnalysisPricingFormData) => void;
  onConfirm: () => void;
}

export function AddAnalysisPricingDialog({
  open,
  onOpenChange,
  formData,
  onFormChange,
  onConfirm,
}: AddAnalysisPricingDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Add New Analysis Pricing</DialogTitle>
          <DialogDescription>Add pricing for a new analysis type</DialogDescription>
        </DialogHeader>
        <AnalysisPricingForm formData={formData} onChange={onFormChange} />
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
