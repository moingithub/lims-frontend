import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { Upload } from "lucide-react";

interface ImportUploadFormProps {
  sourceMachine: string;
  selectedFile: File | null;
  onSourceMachineChange: (value: string) => void;
  onFileChange: (file: File | null) => void;
  onUpload: () => void;
}

export function ImportUploadForm({
  sourceMachine,
  selectedFile,
  onSourceMachineChange,
  onFileChange,
  onUpload,
}: ImportUploadFormProps) {
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    onFileChange(file);
  };

  return (
    <div className="mb-6 p-3 border rounded-lg bg-muted/50">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <Select value={sourceMachine} onValueChange={onSourceMachineChange}>
            <SelectTrigger
              id="source-machine"
              className="border-2 border-black"
            >
              <SelectValue placeholder="Select Machine" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Inficon">Inficon</SelectItem>
              <SelectItem value="GC">GC</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <Input
            id="file-upload"
            type="file"
            accept=".xlsx,.xls,.csv"
            onChange={handleFileChange}
            className="border-2 border-black cursor-pointer"
          />
        </div>
        <div>
          <Button onClick={onUpload} className="w-full">
            <Upload className="w-4 h-4 mr-2" />
            Upload File
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
