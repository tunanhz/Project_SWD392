"use client";

import { useState } from "react";
import Button from "@/components/ui/Button";

interface UploadDocumentModalProps {
  propertyId: number | string;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function UploadDocumentModal({ propertyId, isOpen, onClose, onSuccess }: UploadDocumentModalProps) {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");

  if (!isOpen) return null;

  const handleUpload = async () => {
    if (!file) {
      setError("Please select a file to upload.");
      return;
    }

    setUploading(true);
    setError("");

    const formData = new FormData();
    formData.append("document", file);

    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`http://localhost:5000/api/properties/${propertyId}/documents`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`
        },
        body: formData,
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || data.message || "Failed to upload document");
      }

      onSuccess();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in">
      <div className="bg-background rounded-2xl w-full max-w-md p-6 shadow-2xl border border-border">
        <h3 className="text-xl font-bold mb-2 text-primary">Upload Legal Document</h3>
        <p className="text-sm text-gray-500 mb-6">Attach PDF or image files to verify your property.</p>

        {error && (
          <div className="mb-4 p-3 text-xs font-bold text-red-500 bg-red-50 rounded-xl border border-red-100">
            {error}
          </div>
        )}

        <div className="space-y-4">
          <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-border/50 rounded-xl cursor-pointer bg-accent/5 hover:bg-accent/10 transition">
            <div className="flex flex-col items-center justify-center pt-5 pb-6">
              <svg className="w-8 h-8 mb-3 text-accent" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 16">
                <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 13h3a3 3 0 0 0 0-6h-.025A5.56 5.56 0 0 0 16 6.5 5.5 5.5 0 0 0 5.207 5.021C5.137 5.017 5.071 5 5 5a4 4 0 0 0 0 8h2.167M10 15V6m0 0L8 8m2-2 2 2" />
              </svg>
              <p className="mb-2 text-sm text-gray-500 font-semibold">{file ? file.name : "Click to upload or drag and drop"}</p>
              <p className="text-xs text-gray-400">PDF, JPG, PNG (MAX. 10MB)</p>
            </div>
            <input type="file" className="hidden" accept=".pdf,image/jpeg,image/png" onChange={(e) => setFile(e.target.files?.[0] || null)} />
          </label>

          <div className="flex justify-end gap-3 mt-6">
            <Button variant="outline" onClick={onClose} disabled={uploading}>Cancel</Button>
            <Button variant="accent" onClick={handleUpload} disabled={uploading || !file}>
              {uploading ? "Uploading..." : "Upload File"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
