import React, { useState } from "react";
import { useTranslations } from "next-intl";
import Image from "next/image";

interface NodeConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  isBigNode: boolean;
  price: string;
}

export const NodeConfirmModal: React.FC<NodeConfirmModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  isBigNode,
  price,
}) => {
  const t = useTranslations("node");
  const [showDisclaimer, setShowDisclaimer] = useState(false);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-80">
      <div
        className="w-11/12 max-w-md bg-black rounded-xl overflow-hidden border-2 border-blue-500"
        style={{ boxShadow: "0 0 30px rgba(59, 130, 246, 0.6)" }}
      >
        {/* Header */}
        <div className="py-2 text-center">
          <p className="text-[#3B82F6] text-lg font-bold">确认购买类型</p>
        </div>

        {/* Node Type Box */}
        <div className="mx-4 mb-1 p-2 bg-[#242424] rounded-lg flex flex-col justify-center items-center">
          <div className="flex items-center ">
            <Image
              src={
                isBigNode
                  ? "/images/v2/node/community.png"
                  : "/images/v2/node/group.png"
              }
              alt={isBigNode ? "恒星节点" : "行星节点"}
              width={35}
              height={28}
              className="mr-1"
            />
            <span className="text-white text-lg font-bold">
              {isBigNode ? "恒星节点" : "行星节点"}
            </span>
            <div></div>
          </div>
          <div className="text-white text-md mt-1">
            价格 : <span className="font-bold">{price} USDT</span>
          </div>
        </div>

        {/* Disclaimer text - optional */}
        <div className="mx-4 mb-2 text-center">
          <a
            href="#"
            className="text-xs text-[#3B82F6]"
            style={{
              textDecoration: "underline",
            }}
            onClick={(e) => {
              e.preventDefault();
              setShowDisclaimer(true);
            }}
          >
            《TwinX节点计划免责声明》
          </a>
        </div>

        {/* Buttons */}
        <div className="grid grid-cols-2 gap-4 mx-4 mb-4">
          <button
            onClick={onClose}
            className="py-3 text-center text-lg font-bold bg-gray-800 text-white rounded-lg hover:bg-gray-700 transition-colors"
          >
            取消
          </button>
          <button
            onClick={onConfirm}
            style={{
              background: "linear-gradient(270deg, #2563EB 0%, #60A5FA 100%)",
            }}
            className="py-3 text-center text-lg font-bold  text-black rounded-lg hover:bg-blue-600 transition-colors"
          >
            确认
          </button>
        </div>
      </div>

      {/* Disclaimer Modal */}
      {showDisclaimer && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black bg-opacity-80">
          <div
            className="w-11/12 max-w-lg max-h-[90vh] bg-black rounded-xl overflow-hidden flex flex-col border-2 border-blue-500"
            style={{ boxShadow: "0 0 30px rgba(59, 130, 246, 0.6)" }}
          >
            <div className="p-4 border-b border-blue-500/30 flex justify-between items-center">
              <h3 className="text-xl font-bold text-white">免责声明</h3>
              <button
                onClick={() => setShowDisclaimer(false)}
                className="text-gray-400 hover:text-blue-400 transition-colors"
              >
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>
            <div className="p-6 overflow-y-auto flex-grow">
              <div className="text-sm text-white/80 whitespace-pre-wrap">
                {t("disclaimer_text")}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
