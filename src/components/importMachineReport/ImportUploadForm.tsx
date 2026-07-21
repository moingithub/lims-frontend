import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { Upload } from "lucide-react";
import { Company } from "../../services/companyMasterService";

interface ImportUploadFormProps {
  companies: Company[];
  selectedCompanyId: string;
  sourceMachine: string;
  selectedFile: File | null;
  onCompanyChange: (value: string) => void;
  onSourceMachineChange: (value: string) => void;
  onFileChange: (file: File | null) => void;
  onUpload: () => void;
  isUploading?: boolean;
}

export function ImportUploadForm({
  companies,
  selectedCompanyId,
  sourceMachine,
  selectedFile,
  onCompanyChange,
  onSourceMachineChange,
  onFileChange,
  onUpload,
  isUploading = false,
}: ImportUploadFormProps) {
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    onFileChange(file);
  };

  return (
    <div className="mb-6 p-3 border rounded-lg bg-muted/50">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div>
          <Select value={selectedCompanyId} onValueChange={onCompanyChange}>
            <SelectTrigger
              id="company-select"
              className="border-2 border-black"
            >
              <SelectValue placeholder="Select Company" />
            </SelectTrigger>
            <SelectContent>
              {companies.map((company) => (
                <SelectItem key={company.id} value={String(company.id)}>
                  {company.company_name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div>
          <Select value={sourceMachine} onValueChange={onSourceMachineChange}>
            <SelectTrigger
              id="source-machine"
              className="border-2 border-black"
            >
              <SelectValue placeholder="Select Machine" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Inficon GC">Inficon GC</SelectItem>
              <SelectItem value="Scion GC">Scion GC</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <Input
            id="file-upload"
            type="file"
            accept=".xlsx,.xls,.csv,.json,.fusion-data"
            onChange={handleFileChange}
            className="border-2 border-black cursor-pointer"
          />
        </div>
        <div>
          <Button onClick={onUpload} className="w-full" disabled={isUploading}>
            <Upload className="w-4 h-4 mr-2" />
            {isUploading ? "Uploading..." : "Upload File"}
          </Button>
        </div>
      </div>
      {selectedFile && (
        <p className="text-sm text-muted-foreground mt-2">
          Selected: {selectedFile.name}
        </p>
      )}
    </div>
  );
}
