import React, { useState } from 'react';
import { AlertTriangle, Trash2, X } from 'lucide-react';

interface DeleteConfirmModalProps {
  isOpen: boolean;
  title: string;
  description: string;
  confirmButtonText?: string;
  onClose: () => void;
  onConfirm: () => Promise<void> | void;
  isOledDark: boolean;
}

export const DeleteConfirmModal: React.FC<DeleteConfirmModalProps> = ({
  isOpen,
  title,
  description,
  confirmButtonText = 'Evet, Sil',
  onClose,
  onConfirm,
  isOledDark
}) => {
  const [isDeleting, setIsDeleting] = useState(false);

  if (!isOpen) return null;

  const handleConfirm = async () => {
    try {
      setIsDeleting(true);
      await onConfirm();
    } catch (err) {
      console.error('Delete error:', err);
    } finally {
      setIsDeleting(false);
      onClose();
    }
  };

  const modalBg = isOledDark
    ? 'bg-zinc-950 text-white border-zinc-800'
    : 'bg-white text-gray-900 border-gray-200';

  const subText = isOledDark ? 'text-zinc-400' : 'text-gray-600';
  const headerBorder = isOledDark ? 'border-zinc-800' : 'border-gray-100';

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-center justify-center p-4">
      <div className={`w-full max-w-sm rounded-2xl border shadow-2xl overflow-hidden transition-all ${modalBg}`}>
        {/* Header */}
        <div className={`p-4 border-b flex items-center justify-between ${headerBorder}`}>
          <div className="flex items-center gap-2">
            <div className={`p-2 rounded-xl ${isOledDark ? 'bg-rose-950/60 text-rose-400' : 'bg-rose-50 text-rose-600'}`}>
              <AlertTriangle className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-bold">{title}</h3>
          </div>
          <button
            onClick={onClose}
            className={`p-1.5 rounded-lg transition-colors ${
              isOledDark ? 'text-zinc-400 hover:text-white hover:bg-zinc-900' : 'text-gray-400 hover:text-gray-700 hover:bg-gray-100'
            }`}
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5">
          <p className={`text-xs leading-relaxed ${subText}`}>
            {description}
          </p>
        </div>

        {/* Footer */}
        <div className={`p-4 border-t flex items-center justify-end gap-2.5 ${headerBorder}`}>
          <button
            type="button"
            disabled={isDeleting}
            onClick={onClose}
            className={`min-h-[44px] px-4 py-2 text-xs font-semibold rounded-xl transition-colors ${
              isOledDark ? 'text-zinc-400 hover:text-white hover:bg-zinc-900' : 'text-gray-700 hover:bg-gray-100'
            }`}
          >
            İptal
          </button>
          <button
            type="button"
            disabled={isDeleting}
            onClick={handleConfirm}
            className="min-h-[44px] inline-flex items-center gap-2 text-xs font-semibold px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white shadow-xs transition-colors disabled:opacity-50"
          >
            <Trash2 className="w-4 h-4" />
            <span>{isDeleting ? 'Siliniyor...' : confirmButtonText}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
