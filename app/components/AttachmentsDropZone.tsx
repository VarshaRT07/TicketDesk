import { File as FileIcon, Upload, X } from "lucide-react";
import { useCallback, useMemo, useState } from "react";
import { fileUploadConfig } from "~/lib/constants";
import type { AttachmentsDropzoneProps } from "~/lib/types";
import { cn, formatFileSize, isImageFile, isValidFileSize } from "~/lib/utils";
import { Button } from "./ui/button";

export function AttachmentsDropzone({
  value = [],
  onChange,
  accept = [...fileUploadConfig.acceptedTypes],
  maxSizeMB = fileUploadConfig.maxSizeMB,
  className,
}: AttachmentsDropzoneProps) {
  const [active, setActive] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onFiles = useCallback(
    (files: FileList | null) => {
      if (!files) return;

      setError(null);
      const validFiles: File[] = [];
      const errors: string[] = [];

      Array.from(files).forEach((file) => {
        // Check file size
        if (!isValidFileSize(file, maxSizeMB)) {
          errors.push(`${file.name} is too large (max ${maxSizeMB}MB)`);
          return;
        }

        // Check if we're at max files limit
        if (value.length + validFiles.length >= fileUploadConfig.maxFiles) {
          errors.push(`Maximum ${fileUploadConfig.maxFiles} files allowed`);
          return;
        }

        // Check for duplicates
        const isDuplicate = value.some(
          (existingFile) =>
            existingFile.name === file.name && existingFile.size === file.size
        );

        if (isDuplicate) {
          errors.push(`${file.name} is already added`);
          return;
        }

        validFiles.push(file);
      });

      if (errors.length > 0) {
        setError(errors.join(", "));
      }

      if (validFiles.length > 0) {
        onChange?.([...value, ...validFiles]);
      }
    },
    [onChange, value, maxSizeMB]
  );

  const removeAt = useCallback(
    (idx: number) => {
      const next = [...value];
      next.splice(idx, 1);
      onChange?.(next);
      setError(null);
    },
    [value, onChange]
  );

  const acceptAttr = useMemo(() => accept.join(","), [accept]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setActive(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    // Only set inactive if we're leaving the dropzone entirely
    if (!e.currentTarget.contains(e.relatedTarget as Node)) {
      setActive(false);
    }
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setActive(false);
      onFiles(e.dataTransfer?.files || null);
    },
    [onFiles]
  );

  return (
    <div className={cn("space-y-4", className)}>
      <label
        className={cn(
          "relative flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer transition-colors",
          "hover:bg-muted/50",
          active ? "border-primary bg-primary/5" : "border-muted-foreground/25",
          error && "border-destructive"
        )}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <input
          type="file"
          multiple
          accept={acceptAttr}
          className="sr-only"
          onChange={(e) => onFiles(e.target.files)}
        />
        <div className="flex flex-col items-center justify-center pt-5 pb-6">
          <Upload
            className={cn(
              "w-8 h-8 mb-4 transition-colors",
              active ? "text-primary" : "text-muted-foreground"
            )}
          />
          <p className="mb-2 text-sm text-muted-foreground">
            <span className="font-semibold">Click to upload</span> or drag and
            drop
          </p>
          <p className="text-xs text-muted-foreground">
            Max {maxSizeMB}MB per file, up to {fileUploadConfig.maxFiles} files
          </p>
        </div>
      </label>

      {error && (
        <div className="text-sm text-destructive bg-destructive/10 p-2 rounded">
          {error}
        </div>
      )}

      {value && value.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {value.map((file, i) => (
            <div
              key={`${file.name}-${i}`}
              className="relative flex items-center gap-3 p-3 bg-muted/50 rounded-lg border"
            >
              <div className="flex-shrink-0">
                {isImageFile(file) ? (
                  <div className="w-10 h-10 rounded overflow-hidden bg-muted">
                    <img
                      alt={file.name}
                      src={URL.createObjectURL(file)}
                      className="w-full h-full object-cover"
                      onLoad={(e) => {
                        // Clean up object URL to prevent memory leaks
                        URL.revokeObjectURL((e.target as HTMLImageElement).src);
                      }}
                    />
                  </div>
                ) : (
                  <div className="w-10 h-10 rounded bg-muted flex items-center justify-center">
                    <FileIcon className="w-5 h-5 text-muted-foreground" />
                  </div>
                )}
              </div>

              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate" title={file.name}>
                  {file.name}
                </p>
                <p className="text-xs text-muted-foreground">
                  {formatFileSize(file.size)}
                </p>
              </div>

              <Button
                type="button"
                size="sm"
                variant="ghost"
                className="flex-shrink-0 h-6 w-6 p-0 hover:bg-destructive hover:text-destructive-foreground"
                onClick={() => removeAt(i)}
                aria-label={`Remove ${file.name}`}
              >
                <X className="h-3 w-3" />
              </Button>
            </div>
          ))}
        </div>
      )}

      {value.length > 0 && (
        <div className="text-xs text-muted-foreground">
          {value.length} of {fileUploadConfig.maxFiles} files selected
        </div>
      )}
    </div>
  );
}
