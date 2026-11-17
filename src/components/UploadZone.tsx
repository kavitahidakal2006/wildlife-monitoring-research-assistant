import React, { useRef, useState } from 'react';
import { FileImage, Trash2, UploadCloud } from 'lucide-react';
import { WildlifeImage } from './WildlifeImage';

export interface SelectedUploadFile {
  id: string;
  file?: File;
  filename: string;
  sizeBytes: number;
  mimeType: string;
  previewUrl: string;
  status: 'queued' | 'uploading' | 'analyzing' | 'completed' | 'failed';
  errorMessage?: string;
}

interface UploadZoneProps {
  files: SelectedUploadFile[];
  onAddFiles: (newFiles: File[]) => void;
  onRemoveFile: (id: string) => void;
  disabled?: boolean;
}

export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

export function UploadZone({
  files,
  onAddFiles,
  onRemoveFile,
  disabled = false,
}: UploadZoneProps) {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    if (disabled) return;
    const dropped = Array.from(e.dataTransfer.files).filter((f) =>
      ['image/jpeg', 'image/jpg', 'image/png'].includes(f.type)
    );
    if (dropped.length > 0) {
      onAddFiles(dropped);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    const picked = Array.from(e.target.files).filter((f) =>
      ['image/jpeg', 'image/jpg', 'image/png'].includes(f.type)
    );
    if (picked.length > 0) {
      onAddFiles(picked);
    }
    e.target.value = '';
  };

  return (
    <div className="space-y-4">
      <div
        onDragOver={(e) => {
          e.preventDefault();
          if (!disabled) setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
        className={`flex flex-col items-center justify-center rounded-xl border-2 border-dashed px-6 py-10 text-center transition-colors ${
          isDragging
            ? 'border-[#244B35] bg-[#244B35]/5'
            : 'border-[#CFD5C5] bg-[#FAFBF7] hover:border-[#547A50]'
        } ${disabled ? 'cursor-not-allowed opacity-60' : 'cursor-pointer'}`}
        onClick={() => !disabled && inputRef.current?.click()}
      >
        <input
          ref={inputRef}
          type="file"
          multiple
          accept=".jpg,.jpeg,.png,image/jpeg,image/png"
          onChange={handleInputChange}
          className="hidden"
          disabled={disabled}
        />
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#244B35]/10 text-[#244B35]">
          <UploadCloud className="h-6 w-6" aria-hidden="true" />
        </div>
        <p className="mt-3 font-display text-base font-semibold text-[#202B24]">
          Drop camera-trap photographs here
        </p>
        <p className="mt-1 text-xs text-[#788078]">
          Supports JPG, JPEG, and PNG · Multiple images allowed
        </p>
        <button
          type="button"
          disabled={disabled}
          onClick={(e) => {
            e.stopPropagation();
            inputRef.current?.click();
          }}
          className="mt-4 rounded-lg border border-[#D4D9CB] bg-white px-4 py-2 text-xs font-semibold text-[#202B24] transition-colors hover:bg-[#F5F6EF] disabled:opacity-50"
        >
          Browse Files
        </button>
      </div>

      {files.length > 0 && (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {files.map((item) => (
            <div
              key={item.id}
              className="flex items-center gap-3 rounded-xl border border-[#E2E5DA] bg-white p-2.5"
            >
              <WildlifeImage
                src={item.previewUrl}
                alt={item.filename}
                className="h-14 w-16 shrink-0 rounded-lg object-cover"
              />
              <div className="min-w-0 flex-1">
                <p className="truncate text-xs font-semibold text-[#202B24]">
                  {item.filename}
                </p>
                <div className="mt-0.5 flex items-center gap-1.5 text-[11px] text-[#788078]">
                  <FileImage className="h-3 w-3 shrink-0" aria-hidden="true" />
                  <span className="tabular-nums">{formatFileSize(item.sizeBytes)}</span>
                  <span aria-hidden="true">·</span>
                  <span className="capitalize">
                    {item.status === 'queued'
                      ? 'Uploaded (Queued)'
                      : item.status === 'analyzing'
                        ? 'Analysing...'
                        : item.status === 'completed'
                          ? 'Analysed'
                          : item.status === 'failed'
                            ? 'Failed'
                            : 'Uploading'}
                  </span>
                </div>
                {item.errorMessage && (
                  <p className="mt-0.5 truncate text-[11px] text-[#C65B4B]">
                    {item.errorMessage}
                  </p>
                )}
              </div>
              <button
                type="button"
                disabled={disabled}
                onClick={() => onRemoveFile(item.id)}
                className="rounded-lg p-1.5 text-[#788078] transition-colors hover:bg-[#C65B4B]/10 hover:text-[#C65B4B] disabled:opacity-40"
                aria-label={`Remove ${item.filename}`}
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
