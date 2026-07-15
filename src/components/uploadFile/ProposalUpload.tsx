"use client";

import React, { useRef, useState } from "react";
import { cloudinaryService } from "@/libs/services/cloudinaryService";
import {
  Upload,
  FileText,
  CheckCircle,
  AlertCircle,
  Loader2,
  ExternalLink,
  Download,
} from "lucide-react";
import { competitionService } from "@/libs/services/competitionService";

interface ProposalUploadProps {
  registrationId: string;
  existingUrl?: string; // URL file yang sudah ada
  qualificationEnd?: string; // Deadline pengumpulan
  onUploaded: (url: string) => void;
  onError?: (message: string) => void;
}

export const ProposalUpload: React.FC<ProposalUploadProps> = ({
  registrationId,
  existingUrl,
  qualificationEnd,
  onUploaded,
  onError,
}) => {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  const handleSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    const validation = cloudinaryService.validatePdf(f);
    if (!validation.isValid) {
      setMessage({
        type: "error",
        text: validation.error || "File tidak valid",
      });
      onError?.(validation.error || "File tidak valid");
      return;
    }
    setMessage(null);
    setFile(f);
  };

  const isDeadlinePassed = () => {
    if (!qualificationEnd) return false;
    return new Date() > new Date(qualificationEnd);
  };

  const handleUpload = async () => {
    if (!file) {
      setMessage({ type: "error", text: "Pilih file PDF terlebih dahulu" });
      return;
    }

    // Check deadline before upload
    if (isDeadlinePassed()) {
      const deadlineText = qualificationEnd
        ? new Date(qualificationEnd).toLocaleString("id-ID", {
            year: "numeric",
            month: "long",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
          })
        : "";
      setMessage({
        type: "error",
        text: `Batas waktu pengumpulan proposal telah berakhir pada ${deadlineText}. Upload tidak dapat dilakukan.`,
      });
      onError?.(
        `Batas waktu pengumpulan proposal telah berakhir pada ${deadlineText}`
      );
      return;
    }

    setIsUploading(true);
    setMessage(null);
    try {
      const folder = `proposals/${registrationId}`;
      const result = await cloudinaryService.uploadPdf(file, folder);
      if (!result.success || !result.data?.secure_url) {
        const err = result.error || "Gagal mengunggah proposal";
        setMessage({ type: "error", text: err });
        onError?.(err);
        return;
      }

      // Langsung save ke database setelah upload ke Cloudinary berhasil
      const saveResult = await competitionService.submitProposal(
        registrationId,
        result.data.secure_url
      );
      if (!saveResult.success) {
        const err = saveResult.error || "Gagal menyimpan proposal";
        setMessage({ type: "error", text: err });
        onError?.(err);
        return;
      }

      onUploaded(result.data.secure_url);
      setMessage({
        type: "success",
        text: "Proposal berhasil diunggah dan disimpan",
      });
      setFile(null);
      if (inputRef.current) inputRef.current.value = "";
    } catch (err: any) {
      const text = err.message || "Terjadi kesalahan saat upload";
      setMessage({ type: "error", text });
      onError?.(text);
    } finally {
      setIsUploading(false);
    }
  };

  const getFileName = (url: string) => {
    try {
      const urlParts = url.split("/");
      const fileName = urlParts[urlParts.length - 1];
      return fileName.split(".")[0] + ".pdf";
    } catch {
      return "proposal.pdf";
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-3">
        <div>
          <p className="text-neutral_01 font-medium">
            Upload Proposal Penyisihan (PDF)
          </p>
          <p className="text-xs text-neutral_01/70">
            Maksimal 10MB, format PDF
          </p>
        </div>
      </div>

      {/* Show existing file if available */}
      {existingUrl && (
        <div className="bg-green-500/10 border border-green-400/20 rounded-lg p-3 mb-3 overflow-hidden w-full">
          <div className="flex items-center gap-3 w-full">
            <FileText className="w-4 h-4 text-green-400" />
            <div className="flex-1">
              <p className="text-green-400 font-medium text-sm">
                File sudah terupload:
              </p>
              <p onClick={() => window.open(existingUrl, "_blank")} className="text-green-400/80 w-2/3 md:w-full text-xs truncate underline">
                {getFileName(existingUrl)}
              </p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => window.open(existingUrl, "_blank")}
                className="p-1.5 text-green-400 hover:bg-green-400/10 rounded transition-colors"
                title="Lihat file"
              >
                <ExternalLink className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="flex items-center gap-3">
        <input
          ref={inputRef}
          type="file"
          accept="application/pdf"
          onChange={handleSelect}
          className="hidden"
          disabled={isDeadlinePassed()}
        />
        <button
          onClick={() => inputRef.current?.click()}
          disabled={isDeadlinePassed()}
          className="px-4 py-2 bg-neutral_01/10 border border-neutral_01/15 rounded-lg text-sm text-neutral_01 hover:bg-neutral_01/5 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {existingUrl ? "Pilih File Baru" : "Pilih File PDF"}
        </button>
        {file && (
          <span className="text-sm text-neutral_01/80 truncate max-w-[240px]">
            {file.name}
          </span>
        )}
        <button
          onClick={handleUpload}
          disabled={!file || isUploading || isDeadlinePassed()}
          className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-neutral_02 to-neutral_01 text-brand_01 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isUploading ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Upload className="w-4 h-4" />
          )}
          {isUploading ? "Mengunggah..." : existingUrl ? "Update" : "Upload"}
        </button>
      </div>

      {message && (
        <div
          className={`flex items-start gap-2 p-3 rounded-lg text-sm ${
            message.type === "success"
              ? "bg-green-500/10 text-green-400 border border-green-400/20"
              : "bg-red-500/10 text-red-400 border border-red-400/20"
          }`}
        >
          {message.type === "success" ? (
            <CheckCircle className="w-4 h-4 mt-0.5" />
          ) : (
            <AlertCircle className="w-4 h-4 mt-0.5" />
          )}
          <span>{message.text}</span>
        </div>
      )}
    </div>
  );
};

export default ProposalUpload;
