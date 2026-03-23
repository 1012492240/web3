import Logo from "./logo";
import SideNavDrawer from "./side-nav-drawer";
import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { QRCodeModal } from "./qr-code-modal";
import { RecommenderModal } from "./recommender-modal";
import { useAppKit, useAppKitAccount } from "@reown/appkit/react";
import { useSearchParams } from "next/navigation";

function formatHeaderId(address: string | undefined) {
  if (!address) return "0X0888......888888";
  const raw = address.startsWith("0x") ? address : `0x${address}`;
  const up = raw.toUpperCase();
  if (up.length <= 16) return up;
  return `${up.slice(0, 8)}......${up.slice(-6)}`;
}

/**
 * Header component for the application.
 *
 * This component renders the header at the top of every page. It includes:
 * - Site branding (logo)
 * - Desktop navigation menu
 * - Desktop theme toggle
 * - Desktop call-to-action (CTA)
 * - Mobile menu toggle
 *
 * @returns {JSX.Element} The header component.
 */
export default function Header() {
  const [sideMenuOpen, setSideMenuOpen] = useState(false);
  const [showQRModal, setShowQRModal] = useState(false);
  const { address } = useAppKitAccount();
  const { open: openWallet } = useAppKit();
  const t = useTranslations();
  const tNav = useTranslations("nav_drawer");
  const [userType, setUserType] = useState<string | null>(null);

  const searchParams = useSearchParams();
  const refFromUrl = searchParams.get("ref");
  const [showRecommenderModal, setShowRecommenderModal] = useState(false);
  const [referralCodeFromUrl, setReferralCodeFromUrl] = useState("");

  useEffect(() => {
    const fetchUserInfo = async () => {
      if (!address) {
        setUserType(null);
        return;
      }
      try {
        const response = await fetch(`/api/user/info?address=${address}`);
        if (!response.ok) {
          setUserType(null);
          return;
        }
        const data = await response.json();
        setUserType(data?.type || null);
        if (refFromUrl && !data.superior) {
          setReferralCodeFromUrl(refFromUrl);

          // Add 500ms delay before showing the modal
          setTimeout(() => {
            setShowRecommenderModal(true);
          }, 1000);
        }
      } catch {
        setUserType(null);
      }
    };
    fetchUserInfo();
  }, [address, refFromUrl]);

  return (
    <header className="absolute top-0 left-0 right-0 z-30 bg-[#005d54] shadow-sm">
      <div className="mx-auto max-w-[1900px] px-4 sm:px-6 lg:px-8 2xl:px-16">
        <div className="grid h-14 grid-cols-[1fr_auto_1fr] items-center gap-2">
          <div className="flex min-w-0 justify-start">
            <button
              type="button"
              onClick={() => setSideMenuOpen(true)}
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white text-[#005d54] shadow-sm transition hover:bg-white/95"
              aria-label={tNav("open_menu")}
            >
              <svg
                className="h-4 w-4"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                aria-hidden
              >
                <line x1="4" y1="6" x2="20" y2="6" />
                <line x1="4" y1="12" x2="20" y2="12" />
                <line x1="4" y1="18" x2="20" y2="18" />
              </svg>
            </button>
          </div>

          <div className="flex min-w-0 justify-center [&_img]:h-7 [&_img]:w-auto">
            <Logo />
          </div>

          <div className="flex min-w-0 justify-end">
            <button
              type="button"
              onClick={() => openWallet()}
              className="max-w-[min(100%,11rem)] truncate font-mono text-[11px] font-medium tracking-tight text-white sm:max-w-[14rem] sm:text-xs"
            >
              {formatHeaderId(address)}
            </button>
          </div>
        </div>
      </div>

      {/* Recommender Modal */}
      <RecommenderModal
        isOpen={showRecommenderModal}
        onClose={() => setShowRecommenderModal(false)}
        initialReferralCode={referralCodeFromUrl}
      />

      {/* QR Code Modal */}
      <QRCodeModal
        isOpen={showQRModal}
        onClose={() => setShowQRModal(false)}
        publicKey={address}
        userType={userType}
      />

      <SideNavDrawer
        open={sideMenuOpen}
        onClose={() => setSideMenuOpen(false)}
        onOpenQR={
          address
            ? () => {
                setShowQRModal(true);
              }
            : undefined
        }
      />
    </header>
  );
}
