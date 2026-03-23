"use client";

import React, { useEffect } from "react";
import Image from "next/image";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import LanguageSelector from "@/components/ui/language-selector";
import logo from "@/public/images/v2/logo.png";
import gridIcon from "@/public/images/grid-icon.svg";

type NavItem = {
  key: string;
  href: string;
};

const menuItems: NavItem[] = [
  { key: "home", href: "/" },
  { key: "about", href: "/about" },
  { key: "early_consensus", href: "/subscribe" },
  { key: "personal_center", href: "/my" },
  { key: "download_app", href: "/download#app" },
  { key: "download_business_plan", href: "/download#business" },
  { key: "download_whitepaper", href: "/download#whitepaper" },
  { key: "account_activation", href: "/node" },
];

function MenuIcon({ name }: { name: string }) {
  const cls = "h-5 w-5 shrink-0 text-white/90";
  switch (name) {
    case "home":
      return (
        <svg className={cls} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <path d="M3 10.5L12 3l9 7.5V20a1 1 0 01-1 1h-5v-6H9v6H4a1 1 0 01-1-1v-9.5z" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      );
    case "about":
      return (
        <svg className={cls} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <circle cx="12" cy="12" r="9" />
          <path d="M12 16v-4M12 8h.01" strokeLinecap="round" />
        </svg>
      );
    case "early":
      return (
        <svg className={cls} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <circle cx="12" cy="12" r="9" />
          <path d="M8 14s1.5 2 4 2 4-2 4-2M9 9h.01M15 9h.01" strokeLinecap="round" />
        </svg>
      );
    case "user":
      return (
        <svg className={cls} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <circle cx="12" cy="8" r="3.5" />
          <path d="M6 19.5c0-3 2.5-5 6-5s6 2 6 5" strokeLinecap="round" />
        </svg>
      );
    case "download":
      return (
        <svg className={cls} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <path d="M12 4v11M8 11l4 4 4-4" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M5 20h14" strokeLinecap="round" />
        </svg>
      );
    case "stack":
      return (
        <svg className={cls} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <path d="M6 10l6-3 6 3-6 3-6-3z" />
          <path d="M6 14l6 3 6-3M6 18l6 3 6-3" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      );
    case "book":
      return (
        <svg className={cls} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <path d="M4 6a2 2 0 012-2h5v16H6a2 2 0 01-2-2V6zM13 4h5a2 2 0 012 2v12a2 2 0 01-2 2h-5V4z" />
        </svg>
      );
    case "check":
      return (
        <svg className={cls} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <circle cx="12" cy="12" r="9" />
          <path d="M8 12l2.5 2.5L16 9" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      );
    default:
      return null;
  }
}

const iconByKey: Record<string, string> = {
  home: "home",
  about: "about",
  early_consensus: "early",
  personal_center: "user",
  download_app: "download",
  download_business_plan: "stack",
  download_whitepaper: "book",
  account_activation: "check",
};

function ChevronRight() {
  return (
    <svg className="h-4 w-4 shrink-0 text-white/35" viewBox="0 0 20 20" fill="currentColor" aria-hidden>
      <path
        fillRule="evenodd"
        d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
        clipRule="evenodd"
      />
    </svg>
  );
}

export default function SideNavDrawer({
  open,
  onClose,
  onOpenQR,
}: {
  open: boolean;
  onClose: () => void;
  onOpenQR?: () => void;
}) {
  const t = useTranslations("nav_drawer");
  const tQr = useTranslations("qr_code");

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[100] flex" role="dialog" aria-modal="true" aria-label={t("open_menu")}>
      <button
        type="button"
        className="absolute inset-0 bg-black/65 backdrop-blur-[2px]"
        onClick={onClose}
        aria-label={t("close_menu")}
      />

      <aside
        className="relative flex h-full w-[min(100%,360px)] max-w-[85vw] flex-col bg-[#0b0c10] shadow-2xl"
        style={{ boxShadow: "8px 0 32px rgba(0,0,0,0.5)" }}
      >
        <div
          className="relative shrink-0 overflow-hidden px-6 pb-8 pt-10"
          style={{
            background:
              "linear-gradient(180deg, rgba(120,30,50,0.55) 0%, rgba(40,20,60,0.35) 45%, transparent 100%), #0b0c10",
          }}
        >
          <div className="mx-auto flex h-28 w-28 items-center justify-center rounded-full bg-black/30 ring-2 ring-white/10">
            <Image src={logo} alt="HarmonyLink" width={72} height={72} className="h-16 w-16 object-contain" priority />
          </div>
          <p className="mt-3 text-center text-[10px] font-medium tracking-[0.2em] text-white/50">WEB3.0</p>
        </div>

        <nav className="min-h-0 flex-1 overflow-y-auto px-2 py-2">
          <ul className="space-y-0.5">
            {menuItems.map((item) => (
              <li key={item.key}>
                <Link
                  href={item.href}
                  onClick={onClose}
                  className="flex items-center gap-3 rounded-lg px-3 py-3.5 text-sm text-white transition hover:bg-white/5"
                >
                  <MenuIcon name={iconByKey[item.key] ?? "home"} />
                  <span className="min-w-0 flex-1 leading-snug">{t(item.key)}</span>
                  <ChevronRight />
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div className="flex shrink-0 items-center justify-between border-t border-white/10 px-4 py-4">
          <Image src={logo} alt="" width={36} height={36} className="h-8 w-auto object-contain opacity-90" />
          <div className="flex items-center gap-3 text-white/80">
            {onOpenQR && (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onOpenQR();
                }}
                className="flex h-9 w-9 items-center justify-center rounded-lg transition hover:bg-white/10"
                aria-label={tQr("grid_icon_alt")}
              >
                <Image src={gridIcon} alt="" width={20} height={20} className="opacity-90" />
              </button>
            )}
            <LanguageSelector />
          </div>
        </div>
      </aside>
    </div>
  );
}
