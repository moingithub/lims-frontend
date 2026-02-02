import { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Plus } from "lucide-react";
import { toast } from "sonner";
import {
  AnalysisPrice,
  analysisPricingService,
} from "../services/analysisPricingService";
import { SearchBar } from "../components/shared/SearchBar";
import { AnalysisPricingTable } from "../components/analysisPricing/AnalysisPricingTable";
import { AddAnalysisPricingDialog } from "../components/analysisPricing/AddAnalysisPricingDialog";
import { EditAnalysisPricingDialog } from "../components/analysisPricing/EditAnalysisPricingDialog";
import { DeleteAnalysisPricingDialog } from "../components/analysisPricing/DeleteAnalysisPricingDialog";
import { AnalysisPricingFormData } from "../components/analysisPricing/AnalysisPricingForm";

export function AnalysisPricing() {
  const [searchTerm, setSearchTerm] = useState("");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedAnalysis, setSelectedAnalysis] =
    useState<AnalysisPrice | null>(null);

  const [formData, setFormData] = useState<AnalysisPricingFormData>({
    id: 0,
    analysis_code: "",
    description: "",
    standard_rate: "",
    sample_fee: "",
    rushed_rate: "",
    active: true,
  });

  const [analysisData, setAnalysisData] = useState<AnalysisPrice[]>(
    analysisPricingService.getAnalysisPrices(),
  );
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    const loadAnalysis = async () => {
      try {
        const data = await analysisPricingService.fetchAnalysisPrices();
        if (isMounted) setAnalysisData(data);
      } catch (error) {
        const message =
          error instanceof Error
            ? error.message
            : "Failed to load analysis pricing";
        toast.error(message);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    loadAnalysis();

    return () => {
      isMounted = false;
    };
  }, []);

  const filteredData = analysisPricingService.searchAnalysisPrices(
    analysisData,
    searchTerm,
  );

  const handleAdd = () => {
    setFormData({
      id: 0,
      analysis_code: "",
      description: "",
      standard_rate: "",
      sample_fee: "",
      rushed_rate: "",
      active: true,
    });
    setIsAddDialogOpen(true);
  };

  const handleEdit = (analysis: AnalysisPrice) => {
    setSelectedAnalysis(analysis);
    setFormData({
      id: analysis.id,
      analysis_code: analysis.analysis_code,
      description: analysis.description,
      standard_rate: analysis.standard_rate.toString(),
      sample_fee: analysis.sample_fee?.toString() || "",
      rushed_rate: analysis.rushed_rate.toString(),
      active: analysis.active,
    });
    setIsEditDialogOpen(true);
  };

  const handleDelete = (analysis: AnalysisPrice) => {
    setSelectedAnalysis(analysis);
    setIsDeleteDialogOpen(true);
  };

  const confirmAdd = async () => {
    const newAnalysis: Partial<AnalysisPrice> = {
      analysis_code: formData.analysis_code,
      description: formData.description,
      standard_rate: parseFloat(formData.standard_rate),
      sample_fee: formData.sample_fee
        ? parseFloat(formData.sample_fee)
        : undefined,
      rushed_rate: parseFloat(formData.rushed_rate),
      active: formData.active,
    };

    const validation =
      analysisPricingService.validateAnalysisPrice(newAnalysis);
    if (!validation.valid) {
      toast.error(validation.error || "Please fill in all fields");
      return;
    }

    try {
      const savedAnalysis = await analysisPricingService.addAnalysisPrice({
        analysis_code: formData.analysis_code,
        analysis_name: formData.analysis_code,
        description: formData.description,
        price: parseFloat(formData.standard_rate),
        standard_rate: parseFloat(formData.standard_rate),
        rushed_rate: parseFloat(formData.rushed_rate),
        sample_fee: formData.sample_fee
          ? parseFloat(formData.sample_fee)
          : undefined,
        active: formData.active,
      });
      const updatedAnalysis = [...analysisData, savedAnalysis];
      setAnalysisData(updatedAnalysis);
      analysisPricingService.setAnalysisPrices(updatedAnalysis);
      toast.success(
        `Analysis "${savedAnalysis.analysis_code}" added successfully`,
      );
      setIsAddDialogOpen(false);
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Failed to create analysis pricing";
      toast.error(message);
    }
  };

  const confirmEdit = async () => {
    if (!selectedAnalysis) return;

    const updatedAnalysis: Partial<AnalysisPrice> = {
      analysis_code: formData.analysis_code,
      description: formData.description,
      standard_rate: parseFloat(formData.standard_rate),
      sample_fee: formData.sample_fee
        ? parseFloat(formData.sample_fee)
        : undefined,
      rushed_rate: parseFloat(formData.rushed_rate),
      active: formData.active,
    };

    const validation =
      analysisPricingService.validateAnalysisPrice(updatedAnalysis);
    if (!validation.valid) {
      toast.error(validation.error || "Please fill in all required fields");
      return;
    }

    try {
      const savedAnalysis = await analysisPricingService.updateAnalysisPrice(
        selectedAnalysis.id,
        {
          id: selectedAnalysis.id,
          analysis_code: formData.analysis_code,
          analysis_name: formData.analysis_code,
          description: formData.description,
          price: parseFloat(formData.standard_rate),
          standard_rate: parseFloat(formData.standard_rate),
          rushed_rate: parseFloat(formData.rushed_rate),
          sample_fee: formData.sample_fee
            ? parseFloat(formData.sample_fee)
            : undefined,
          active: formData.active,
        },
      );
      const updatedAnalysis = analysisData.map((item) =>
        item.id === selectedAnalysis.id ? savedAnalysis : item,
      );
      setAnalysisData(updatedAnalysis);
      analysisPricingService.setAnalysisPrices(updatedAnalysis);
      toast.success(
        `Analysis Type "${savedAnalysis.analysis_code}" updated successfully`,
      );
      setIsEditDialogOpen(false);
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Failed to update analysis pricing";
      toast.error(message);
    }
  };

  const confirmDelete = async () => {
    if (!selectedAnalysis) return;

    try {
      await analysisPricingService.deleteAnalysisPrice(selectedAnalysis.id);
      const updatedAnalysis = analysisData.filter(
        (item) => item.id !== selectedAnalysis.id,
      );
      setAnalysisData(updatedAnalysis);
      analysisPricingService.setAnalysisPrices(updatedAnalysis);
      toast.success(
        `Analysis Type "${selectedAnalysis.analysis_code}" deleted successfully`,
      );
      setIsDeleteDialogOpen(false);
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Failed to delete analysis pricing";
      toast.error(message);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="font-bold">Analysis Pricing</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex justify-between items-center mb-6">
            <SearchBar
              value={searchTerm}
              onChange={setSearchTerm}
              placeholder="Search by code or description..."
            />
            <Button onClick={handleAdd}>
              <Plus className="w-4 h-4 mr-2" />
              Add Analysis
            </Button>
          </div>

          <AnalysisPricingTable
            analysisPrices={isLoading ? [] : filteredData}
            onEdit={handleEdit}
            onDelete={handleDelete}
          />

          <div className="mt-4 text-sm text-muted-foreground">
            Showing {filteredData.length} of {analysisData.length} analysis
            types
          </div>
        </CardContent>
      </Card>

      <AddAnalysisPricingDialog
        open={isAddDialogOpen}
        onOpenChange={setIsAddDialogOpen}
        formData={formData}
        onFormChange={setFormData}
        onConfirm={confirmAdd}
      />

      <EditAnalysisPricingDialog
        open={isEditDialogOpen}
        onOpenChange={setIsEditDialogOpen}
        formData={formData}
        onFormChange={setFormData}
        onConfirm={confirmEdit}
      />

      <DeleteAnalysisPricingDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        analysisCode={selectedAnalysis?.analysis_code || null}
        onConfirm={confirmDelete}
      />
    </div>
  );
}
