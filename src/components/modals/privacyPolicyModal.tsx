export const PrivacyPolicyModal = ({
  title,
  open,
  onClose,
  children,
}: {
  title: string;
  open: boolean;
  onClose: () => void;
  children: React.ReactNode;
}) => {
  if (!open) return null;
  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center"
      role="dialog"
      aria-modal="true"
      aria-label={title}
    >
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="relative backdrop-blur-md bg-white/5 mx-4 max-h-[80vh] w-full max-w-2xl overflow-hidden rounded-2xl border border-white/10 bg-neutral_09 p-0 shadow-xl">
        <div className="flex items-center justify-between border-b border-white/10 px-5 py-3">
          <h3 className="text-base font-semibold text-white">{title}</h3>
        </div>
        <div className="overflow-y-auto px-5 py-4 text-sm leading-relaxed text-white/50">
          {children}
        </div>
        <div className="flex justify-end border-t border-white/10 px-5 py-3">
          <button
            type="button"
            onClick={onClose}
            className="rounded-md bg-white/10 px-4 py-2 text-sm text-white hover:bg-white/20"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
}