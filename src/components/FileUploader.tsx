
import React, { useState, useRef } from 'react';
import { useToast } from '@/hooks/use-toast';
import { Upload, FileText, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface FileUploaderProps {
  onFileSelected: (file: File) => void;
  isLoading: boolean;
  acceptedFileTypes?: string[];
}

const FileUploader: React.FC<FileUploaderProps> = ({ 
  onFileSelected, 
  isLoading,
  acceptedFileTypes = ['.zip', '.html'] 
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [fileName, setFileName] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      processFile(e.target.files[0]);
    }
  };

  const processFile = (file: File) => {
    const fileExtension = `.${file.name.split('.').pop()?.toLowerCase()}`;
    
    if (!acceptedFileTypes.includes(fileExtension)) {
      toast({
        title: "Invalid file type",
        description: `Please upload ${acceptedFileTypes.join(' or ')} files only`,
        variant: "destructive"
      });
      return;
    }

    setFileName(file.name);
    onFileSelected(file);
  };

  const handleButtonClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div 
      className={cn(
        "w-full max-w-2xl mx-auto transition-all duration-300",
        "rounded-xl glass card-shadow inner-border p-10",
        "flex flex-col items-center justify-center text-center",
        isDragging ? "ring-2 ring-primary bg-primary/5" : ""
      )}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileInputChange}
        accept={acceptedFileTypes.join(',')}
        className="hidden"
      />
      
      <div className="mb-6">
        {fileName ? (
          <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center text-primary mb-3 mx-auto animate-scale-in">
            <FileText size={30} />
          </div>
        ) : (
          <div className="w-16 h-16 rounded-full bg-secondary flex items-center justify-center text-primary/80 mb-3 mx-auto">
            <Upload size={30} />
          </div>
        )}
      </div>
      
      {fileName ? (
        <div className="animate-slide-up">
          <p className="text-sm font-medium text-foreground mb-1">{fileName}</p>
          <p className="text-sm text-muted-foreground mb-4">
            {isLoading ? 'Analyzing file...' : 'File ready for analysis'}
          </p>
        </div>
      ) : (
        <>
          <h3 className="text-xl font-medium mb-2">Upload Chat Export</h3>
          <p className="text-muted-foreground mb-6 max-w-md">
            Drag and drop your WhatsApp or Telegram chat export file here, 
            or click to browse
          </p>
        </>
      )}
      
      <button
        onClick={handleButtonClick}
        disabled={isLoading}
        className={cn(
          "py-2.5 px-5 font-medium rounded-lg transition-all",
          "focus:outline-none focus:ring-2 focus:ring-primary/50",
          isLoading 
            ? "bg-secondary text-muted-foreground cursor-not-allowed" 
            : fileName 
              ? "bg-primary/10 text-primary hover:bg-primary/20"
              : "bg-primary text-white hover:bg-primary/90"
        )}
      >
        {isLoading ? 'Analyzing...' : fileName ? 'Replace File' : 'Select File'}
      </button>
      
      <div className="mt-4 flex items-center text-xs text-muted-foreground">
        <AlertCircle size={12} className="mr-1" />
        <span>Upload WhatsApp (.zip) or Telegram (.html) chat exports</span>
      </div>
    </div>
  );
};

export default FileUploader;
