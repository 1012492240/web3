import React from 'react';
import { useTranslations } from 'next-intl';

interface RecommenderAlertModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const RecommenderAlertModal: React.FC<RecommenderAlertModalProps> = ({
  isOpen,
  onClose
}) => {
  const t = useTranslations('node');

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-80">
      <div className="w-11/12 max-w-md rounded-xl overflow-hidden border border-[#00FFFF]/30 bg-transparent">
        {/* Header with cyan text */}
        <div className="py-8 text-center">
          <p className="text-[#00FFFF] text-lg font-medium">{t('no_superior_found')}</p>
        </div>
        
        {/* Button - cyan gradient */}
        <div className="mx-6 mb-6">
          <button
            onClick={onClose}
            className="w-full py-4 text-center text-base font-medium bg-gradient-to-r from-[#00FFFF] to-[#00FFFF]/70 text-black rounded-full hover:opacity-90 transition-opacity"
          >
            {t('confirm')}
          </button>
        </div>
      </div>
    </div>
  );
};
