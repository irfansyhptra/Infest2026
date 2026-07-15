"use client";

import { useState } from "react";
import {
  Upload,
  Image,
  CheckCircle,
  X,
  AlertCircle,
  FileText,
} from "lucide-react";
import { cloudinaryService } from "../../libs/services/cloudinaryService";
import { competitionService } from "../../libs/services/competitionService";

interface PaymentProofUploadProps {
  registrationId?: string;
  competitionId?: string;
  teamId?: string;
  onSuccess?: (url: string) => void;
  onError?: (error: string) => void;
}

export const PaymentProofUpload: React.FC<PaymentProofUploadProps> = ({
  registrationId,
  competitionId,
  teamId,
  onSuccess,
  onError,
}) => {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [uploadedUrl, setUploadedUrl] = useState<string | null>(null);
  const [twibbonFile, setTwibbonFile] = useState<File | null>(null);

  // Payment form data
  const [paymentData, setPaymentData] = useState({
    paymentDate: "",
    accountName: "",
    notes: "",
  });

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (!selectedFile) return;

    // Validate file
    const validation = cloudinaryService.validateFile(selectedFile);
    if (!validation.isValid) {
      setError(validation.error || "File tidak valid");
      return;
    }

    setFile(selectedFile);
    setError(null);
    setUploadSuccess(false);

    // Create preview
    const reader = new FileReader();
    reader.onload = (e) => {
      setPreview(e.target?.result as string);
    };
    reader.readAsDataURL(selectedFile);
  };

  const handleTwibbonSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (!selectedFile) return;

    // Validate PDF
    const validation = cloudinaryService.validatePdf(selectedFile);
    if (!validation.isValid) {
      setError(validation.error || "File PDF tidak valid");
      return;
    }

    setTwibbonFile(selectedFile);
    setError(null);
    setUploadSuccess(false);
  };

  const handleUpload = async () => {
    if (!file) {
      setError("Bukti pembayaran wajib diupload");
      return;
    }
    if (!twibbonFile) {
      setError("Bukti Twibbon (PDF) wajib diupload");
      return;
    }

    // Validate payment data (no need to select payment method anymore)
    if (!paymentData.paymentDate || !paymentData.accountName) {
      setError("Semua field pembayaran harus diisi");
      return;
    }

    setIsUploading(true);
    setError(null);

    try {
      let result: any;

      if (registrationId) {
        // Case 1: Update existing registration with payment proof
        result = await competitionService.submitPaymentProof({
          registration_id: registrationId,
          file: file,
          payment_method: "bank_transfer",
          payment_date: paymentData.paymentDate,
          account_name: paymentData.accountName,
          notes: paymentData.notes,
        });
        if (result.success) {
          // Then upload twibbon proof PDF
          const twRes = await competitionService.submitTwibbonProof({
            registration_id: registrationId,
            file: twibbonFile,
          });
          if (!twRes.success) {
            setError(twRes.error || "Gagal upload bukti twibbon");
            onError?.(twRes.error || "Gagal upload bukti twibbon");
            return;
          }
        }
      } else if (competitionId && teamId) {
        // Case 2: Register team with payment proof
        result = await competitionService.registerTeamWithPayment(
          teamId,
          {
            competition_id: competitionId,
            team_id: teamId,
            notes: paymentData.notes,
          },
          {
            file: file,
            payment_method: "bank_transfer",
            payment_date: paymentData.paymentDate,
            account_name: paymentData.accountName,
            notes: paymentData.notes,
          },
          twibbonFile
        );
      } else {
        setError("Data registrasi tidak lengkap");
        return;
      }

      // Handle different result types
      const isSuccess = result.success || result.registration;
      const errorMessage = result.error;
      const url =
        result.url || result.registration?.payment_proof_url || "success";

      if (isSuccess) {
        setUploadSuccess(true);
        setUploadedUrl(url);
        onSuccess?.(url);
      } else {
        setError(errorMessage || "Gagal upload bukti pembayaran");
        onError?.(errorMessage || "Gagal upload bukti pembayaran");
      }
    } catch (error: any) {
      setError(error.message || "Terjadi kesalahan saat upload");
      onError?.(error.message || "Terjadi kesalahan saat upload");
    } finally {
      setIsUploading(false);
    }
  };

  const handleReset = () => {
    setFile(null);
    setPreview(null);
    setError(null);
    setUploadSuccess(false);
    setUploadedUrl(null);
    setTwibbonFile(null);
    setPaymentData({
      paymentDate: "",
      accountName: "",
      notes: "",
    });
  };

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white/5 backdrop-blur-sm border border-neutral_01/20 rounded-2xl">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-neutral_01 mb-2">
          Upload Bukti Pembayaran & Twibbon
        </h2>
        <p className="text-neutral_01/60">
          Upload gambar bukti pembayaran dan file PDF berisi bukti twibbon
          Instagram tiap anggota tim.
        </p>
      </div>

      {/* Payment Information Form */}
      <div className="space-y-4 mb-6">
        <div className="grid grid-cols-1 gap-4">
          <div>
            <label className="block text-sm font-medium text-neutral_01 mb-2">
              Tanggal Pembayaran
            </label>
            <input
              type="date"
              value={paymentData.paymentDate}
              onChange={(e) =>
                setPaymentData((prev) => ({
                  ...prev,
                  paymentDate: e.target.value,
                }))
              }
              className="w-full px-3 py-2 bg-neutral_01/10 border border-neutral_01/20 rounded-lg text-neutral_01 focus:ring-2 focus:ring-blue-500/50"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-neutral_01 mb-2">
            Nama Rekening / Akun
          </label>
          <input
            type="text"
            value={paymentData.accountName}
            onChange={(e) =>
              setPaymentData((prev) => ({
                ...prev,
                accountName: e.target.value,
              }))
            }
            placeholder="Masukkan nama rekening yang digunakan"
            className="w-full px-3 py-2 bg-neutral_01/10 border border-neutral_01/20 rounded-lg text-neutral_01 focus:ring-2 focus:ring-blue-500/50"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-neutral_01 mb-2">
            Catatan (Opsional)
          </label>
          <textarea
            value={paymentData.notes}
            onChange={(e) =>
              setPaymentData((prev) => ({ ...prev, notes: e.target.value }))
            }
            placeholder="Tambahkan catatan jika diperlukan"
            rows={3}
            className="w-full px-3 py-2 bg-neutral_01/10 border border-neutral_01/20 rounded-lg text-neutral_01 focus:ring-2 focus:ring-blue-500/50 resize-none"
          />
        </div>
      </div>

      {/* File Upload Area */}
      <div className="space-y-6">
        {!file && !uploadSuccess && (
          <div className="border-2 border-dashed border-neutral_01/20 rounded-xl p-8 text-center hover:border-neutral_01/40 transition-colors">
            <input
              type="file"
              accept="image/*"
              onChange={handleFileSelect}
              className="hidden"
              id="file-upload"
            />
            <label
              htmlFor="file-upload"
              className="cursor-pointer flex flex-col items-center space-y-4"
            >
              <div className="w-16 h-16 bg-neutral_01/10 rounded-full flex items-center justify-center">
                <Upload className="w-8 h-8 text-neutral_01/60" />
              </div>
              <div>
                <p className="text-lg font-medium text-neutral_01">
                  Pilih gambar bukti pembayaran
                </p>
                <p className="text-sm text-neutral_01/60 mt-1">
                  JPG, PNG, atau WEBP (maks. 10MB)
                </p>
              </div>
            </label>
          </div>
        )}

        {/* Preview */}
        {preview && !uploadSuccess && (
          <div className="space-y-4">
            <div className="relative">
              <img
                src={preview}
                alt="Preview"
                className="w-full h-64 object-cover rounded-lg"
              />
              <button
                onClick={() => {
                  setFile(null);
                  setPreview(null);
                }}
                className="absolute top-2 right-2 p-2 bg-red-500 hover:bg-red-600 rounded-full text-white transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Image className="w-5 h-5 text-neutral_01/60" />
                <span className="text-sm text-neutral_01/80">{file?.name}</span>
                <span className="text-xs text-neutral_01/60">
                  ({((file?.size || 0) / 1024 / 1024).toFixed(2)} MB)
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Success State */}
        {uploadSuccess && (
          <div className="bg-green-500/10 border border-green-400/20 rounded-xl p-6 text-center">
            <CheckCircle className="w-16 h-16 text-green-400 mx-auto mb-4" />
            <h3 className="text-lg font-bold text-green-400 mb-2">
              Upload Berhasil!
            </h3>
            <p className="text-green-400/80">
              Bukti pembayaran telah berhasil diupload ke Cloudinary dan data
              disimpan di database.
            </p>
            <button
              onClick={handleReset}
              className="mt-4 px-4 py-2 bg-neutral_01/10 border border-neutral_01/20 rounded-lg text-neutral_01 hover:bg-neutral_01/20 transition-colors"
            >
              Upload Lagi
            </button>
          </div>
        )}

        {/* Twibbon PDF */}
        {!uploadSuccess && (
          <div className="space-y-2">
            <label className="block text-sm font-medium text-neutral_01">
              Bukti Twibbon Instagram (PDF)
            </label>
            <div className="border-2 border-dashed border-neutral_01/20 rounded-xl p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <FileText className="w-5 h-5 text-neutral_01/60" />
                  <span className="text-sm text-neutral_01/80">
                    {twibbonFile
                      ? twibbonFile.name
                      : "Pilih file PDF bukti twibbon"}
                  </span>
                  {twibbonFile && (
                    <span className="text-xs text-neutral_01/60">
                      ({(twibbonFile.size / 1024 / 1024).toFixed(2)} MB)
                    </span>
                  )}
                </div>
                <div>
                  <input
                    type="file"
                    accept="application/pdf"
                    onChange={handleTwibbonSelect}
                    className="hidden"
                    id="twibbon-upload"
                  />
                  <label
                    htmlFor="twibbon-upload"
                    className="cursor-pointer px-3 py-1.5 bg-neutral_01/10 border border-neutral_01/20 rounded-lg text-neutral_01 text-sm hover:bg-neutral_01/20"
                  >
                    {twibbonFile ? "Ganti PDF" : "Pilih PDF"}
                  </label>
                </div>
              </div>
              <p className="mt-2 text-xs text-neutral_01/60">
                Catatan: Gabungkan bukti dari setiap anggota tim dalam satu PDF.
                Sertakan screenshot postingan twibbon di Instagram masing-masing
                anggota, tampilkan username, dan tanggal bila ada. Maksimal
                10MB.
              </p>
            </div>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="bg-red-500/10 border border-red-400/20 rounded-xl p-4">
            <div className="flex items-start space-x-3">
              <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-red-400">Error:</p>
                <p className="text-sm text-red-400/80">{error}</p>
              </div>
            </div>
          </div>
        )}

        {/* Upload Button */}
        {file && twibbonFile && !uploadSuccess && (
          <button
            onClick={handleUpload}
            disabled={isUploading || !file || !twibbonFile}
            className={`w-full flex items-center justify-center space-x-2 px-6 py-3 rounded-lg font-medium transition-colors ${
              isUploading
                ? "bg-neutral_01/20 text-neutral_01/60 cursor-not-allowed"
                : "bg-blue-600 hover:bg-blue-700 text-white"
            }`}
          >
            {isUploading ? (
              <>
                <div className="w-5 h-5 border-2 border-neutral_01/60 border-t-transparent rounded-full animate-spin" />
                <span>Mengupload...</span>
              </>
            ) : (
              <>
                <Upload className="w-5 h-5" />
                <span>Upload Bukti & Twibbon</span>
              </>
            )}
          </button>
        )}
      </div>

      {/* Info */}
      {/* <div className="mt-6 p-4 bg-blue-500/10 border border-blue-400/20 rounded-xl">
        <h4 className="font-medium text-blue-400 mb-2">Informasi:</h4>
        <ul className="text-sm text-blue-400/80 space-y-1">
          {registrationId ? (
            <>
              <li>• Registration ID: {registrationId}</li>
              <li>• Mode: Update existing registration</li>
            </>
          ) : (
            <>
              <li>• Competition ID: {competitionId}</li>
              <li>• Team ID: {teamId}</li>
              <li>• Mode: New registration with payment proof</li>
            </>
          )}
          <li>• File akan diupload ke Cloudinary</li>
          <li>• URL akan disimpan di database field: payment_proof_url</li>
        </ul>
      </div> */}
    </div>
  );
};
