import { useState } from "react";
import { useTranslations } from "next-intl";
import { useAppKitAccount } from "@reown/appkit/react";
import { useSignMessage } from "wagmi";
import { generateOperationHash } from "@/utils/auth";
import { UPDATE_REFERRAL } from "@/constants";
import bs58 from "bs58";
import { ErrorCode } from "@/lib/errors";

interface RecommenderModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialReferralCode?: string;
}

/**
 * RecommenderModal component for updating a user's recommender.
 *
 * This component displays a modal that allows users to set or update their recommender
 * by entering a referral code.
 *
 * @param {Object} props - Component props
 * @param {boolean} props.isOpen - Whether the modal is open
 * @param {Function} props.onClose - Function to close the modal
 * @param {string} [props.initialReferralCode] - Initial referral code to display
 * @returns {JSX.Element|null} The recommender modal component
 */
export function RecommenderModal({
  isOpen,
  onClose,
  initialReferralCode,
}: RecommenderModalProps) {
  const { address } = useAppKitAccount();
  const { signMessageAsync } = useSignMessage();
  const t = useTranslations("recommender_confirm");
  const tErrors = useTranslations("errors");

  const encoder = new TextEncoder();

  const [recommenderError, setRecommenderError] = useState<string | null>(
    t("tip")
  );
  const [isUpdating, setIsUpdating] = useState(false);

  // Function to update the superior referral code
  const updateSuperiorReferralCode = async (): Promise<void> => {
    if (!address || !initialReferralCode || initialReferralCode === "") {
      return;
    }
    setIsUpdating(true);

    const timestamp = Date.now();

    const info = {
      operationType: UPDATE_REFERRAL,
      amount: 0,
      walletAddress: address,
      description: initialReferralCode,
      timestamp: timestamp,
    };
    const hash = await generateOperationHash(info);

    try {
      // For Ethereum, we sign the message directly as a string
      const signature = await signMessageAsync({ message: hash });

      const response = await fetch("/api/user/update-referrer", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          walletAddress: address,
          referralCode: initialReferralCode,
          signature: signature, // Ethereum signatures are already hex strings
          timestamp: timestamp,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        // Update the user info in state
        onClose();
        window.location.reload();
      } else {
        const data = await response.json();
        setRecommenderError(tErrors(data.error));
      }
    } catch (error) {
      console.error("Error updating referral code:", error);
      setRecommenderError(tErrors(ErrorCode.OPERATION_FAILED));
    } finally {
      setIsUpdating(false);
    }
  };

  const handleClose = () => {
    // Clean up state
    setRecommenderError(null);

    // Remove referral code from URL
    const url = new URL(window.location.href);
    url.searchParams.delete("ref");
    window.history.replaceState({}, "", url.toString());

    // Call the provided onClose function
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-80 p-4">
      <div
        className="bg-black rounded-xl p-6 w-[90%] max-w-md border-2 border-blue-500"
        style={{ boxShadow: "0 0 30px rgba(59, 130, 246, 0.6)" }}
      >
        <h3 className="text-sm font-bold mb-4 text-white text-center">
          {t("title")}
        </h3>

        <div className="flex flex-col gap-4">
          <div className="w-full bg-gray-800 text-white border border-gray-700 rounded-lg p-3 text-center text-lg">
            {initialReferralCode}
          </div>
          {recommenderError && (
            <p className="text-red-500 text-sm mt-1">{recommenderError}</p>
          )}
          <div className="flex w-full gap-4">
            <button
              onClick={handleClose}
              className="flex-1 bg-gray-800 text-white py-2 px-4 rounded-lg font-medium hover:bg-gray-700 transition-colors"
            >
              {t("cancel")}
            </button>
            <button
              onClick={updateSuperiorReferralCode}
              disabled={isUpdating}
              className={`flex-1 py-3 px-4 rounded-lg font-medium hover:opacity-90 ${
                isUpdating ? "opacity-50 cursor-not-allowed" : ""
              }`}
              style={{
                background: "linear-gradient(270deg, #2563EB 0%, #60A5FA 100%)",
              }}
            >
              {isUpdating ? t("updating") : t("ok")}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
