"use client";

import { useState } from "react";
import Button from "@/components/ui/Button";

interface CreateComplaintModalProps {
  auctionId: string | number;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  title: string;
}

export default function CreateComplaintModal({ auctionId, isOpen, onClose, onSuccess, title }: CreateComplaintModalProps) {
  const [subject, setSubject] = useState("");
  const [description, setDescription] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [formErrors, setFormErrors] = useState<any>({});

  if (!isOpen) return null;

  const validateForm = () => {
    const errors: any = {};
    if (!subject || subject.trim().length < 5) errors.subject = "Vui lòng nhập chủ đề ít nhất 5 ký tự (Subject min 5 chars)";
    if (!description || description.trim().length < 20) errors.description = "Vui lòng nhập mô tả ít nhất 20 ký tự (Description min 20 chars)";
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;
    setSubmitting(true);
    setError("");

    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`http://127.0.0.1:5000/api/complaints`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          auctionId,
          subject,
          description
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || data.message || "Failed to submit complaint");
      }

      setSubject("");
      setDescription("");
      setFormErrors({});
      onSuccess();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in">
      <div className="bg-background rounded-3xl w-full max-w-lg p-8 shadow-2xl border border-border/50">
        <h3 className="text-2xl font-black mb-1 text-primary tracking-tight">File a Complaint</h3>
        <p className="text-sm text-gray-500 mb-6 font-medium">Reporting issue for auction: {title}</p>

        {error && (
          <div className="mb-6 p-3 text-xs font-bold text-red-500 bg-red-50 rounded-xl border border-red-100">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-bold text-primary uppercase tracking-wider">Subject</label>
            <input 
              type="text" 
              placeholder="Briefly describe the issue"
              className={`w-full h-12 rounded-xl border ${formErrors.subject ? 'border-red-500 focus:ring-red-500' : 'border-border/50 focus:ring-accent'} bg-background px-4 text-sm focus:ring-2 outline-none font-medium`}
              value={subject}
              onChange={(e) => { setSubject(e.target.value); setFormErrors({...formErrors, subject: undefined}); }}
            />
            {formErrors.subject && <p className="text-red-500 text-xs font-medium mt-1">{formErrors.subject}</p>}
          </div>
          
          <div className="space-y-2">
            <label className="text-sm font-bold text-primary uppercase tracking-wider">Detailed Description</label>
            <textarea 
              placeholder="Provide as much detail as possible about your complaint..."
              className={`w-full h-32 rounded-xl border ${formErrors.description ? 'border-red-500 focus:ring-red-500' : 'border-border/50 focus:ring-accent'} bg-background px-4 py-3 text-sm focus:ring-2 outline-none resize-none font-medium`}
              value={description}
              onChange={(e) => { setDescription(e.target.value); setFormErrors({...formErrors, description: undefined}); }}
            />
            {formErrors.description && <p className="text-red-500 text-xs font-medium mt-1">{formErrors.description}</p>}
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="outline" onClick={onClose} disabled={submitting}>Cancel</Button>
            <Button type="submit" variant="accent" disabled={submitting || !subject || !description}>
              {submitting ? "Submitting..." : "Submit Complaint"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

