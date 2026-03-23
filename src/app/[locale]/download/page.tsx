"use client";

import { useTranslations } from "next-intl";

export default function DownloadPage() {
  const t = useTranslations("download_page");

  return (
    <div className="min-h-screen bg-black px-4 pb-24 pt-28 text-white">
      <h1 className="text-xl font-bold text-white/95">{t("title")}</h1>
      <p className="mt-2 text-sm text-white/55">{t("subtitle")}</p>

      <section id="app" className="scroll-mt-28 mt-10 rounded-xl border border-white/10 bg-white/5 p-5">
        <h2 className="text-base font-semibold">{t("app_title")}</h2>
        <p className="mt-2 text-sm text-white/65">{t("app_hint")}</p>
      </section>

      <section id="business" className="scroll-mt-28 mt-6 rounded-xl border border-white/10 bg-white/5 p-5">
        <h2 className="text-base font-semibold">{t("business_title")}</h2>
        <p className="mt-2 text-sm text-white/65">{t("business_hint")}</p>
      </section>

      <section id="whitepaper" className="scroll-mt-28 mt-6 rounded-xl border border-white/10 bg-white/5 p-5">
        <h2 className="text-base font-semibold">{t("whitepaper_title")}</h2>
        <p className="mt-2 text-sm text-white/65">{t("whitepaper_hint")}</p>
      </section>
    </div>
  );
}
