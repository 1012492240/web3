"use client";

import Image from "next/image";
import type { ReactNode } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";

export default function HarmonyDetailContent() {
  const t = useTranslations("about_page");

  const bold = (chunks: ReactNode) => (
    <strong className="font-bold text-[#1a1a1a]">{chunks}</strong>
  );

  const bodyClass =
    "text-left text-sm leading-[1.75] text-[#333] sm:text-[15px] [&_strong]:font-bold [&_strong]:text-[#1a1a1a]";

  return (
    <div
      className="min-h-screen bg-white text-[#333]"
      style={{
        fontFamily:
          'system-ui, "PingFang SC", "Microsoft YaHei", "Noto Sans SC", sans-serif',
      }}
    >
      <header className="bg-[#D00000] px-4 py-3.5 text-center text-sm font-bold leading-snug text-white shadow-sm sm:text-[15px]">
        {t("hero_title")}
      </header>

      <main className="mx-auto max-w-[min(100%,560px)] px-4 pb-28 pt-6 sm:px-6">
  

        <article className="space-y-10">
          <section>
            <h2 className="text-lg font-bold leading-snug text-[#1a1a1a] sm:text-xl">
              {t("section1_title")}
            </h2>
            <p className={`mt-4 ${bodyClass}`}>{t.rich("section1_body", { b: bold })}</p>
          </section>

          <section>
            <h2 className="text-lg font-bold leading-snug text-[#1a1a1a] sm:text-xl">
              {t("section2_title")}
            </h2>
            <div className={`mt-4 space-y-3 ${bodyClass}`}>
              <p>{t.rich("section2_p1", { b: bold })}</p>
              <p>{t("section2_lead")}</p>
              <p>{t.rich("section2_entry4d", { b: bold })}</p>
              <p>{t.rich("section2_compliance", { b: bold })}</p>
            </div>
          </section>

          {/* <figure className="py-2">
            <div className="relative w-full overflow-hidden rounded-xl bg-[#fafafa]">
              <Image
                src="/images/harmony-detail-hero.png"
                alt=""
                width={1200}
                height={1800}
                className="h-auto w-full object-contain object-center"
                sizes="(max-width: 560px) 100vw, 560px"
                priority
              />
            </div>
          </figure> */}

          <section>
            <h2 className="text-lg font-bold leading-snug text-[#1a1a1a] sm:text-xl">
              {t("architecture_title")}
            </h2>

            <div className="mt-6 space-y-8">
              <div>
                <h3 className="text-base font-bold text-[#1a1a1a]">
                  <span className="mr-1 text-[#D00000]">1.</span>
                  {t("arch1_title")}
                </h3>
                <ul className={`mt-3 space-y-2 ${bodyClass}`}>
                  <li>{t("arch1_bullet1")}</li>
                  <li>{t("arch1_bullet2")}</li>
                  <li className="font-medium text-[#1a1a1a]">{t("arch1_quote")}</li>
                </ul>
              </div>

              <div>
                <h3 className="text-base font-bold text-[#1a1a1a]">
                  <span className="mr-1 text-[#D00000]">2.</span>
                  {t("arch2_title")}
                </h3>
                <ul className={`mt-3 space-y-2 ${bodyClass}`}>
                  <li>{t("arch2_bullet1")}</li>
                  <li>{t("arch2_bullet2")}</li>
                </ul>
              </div>
            </div>
          </section>

          <section className="border-t border-[#eee] pt-10">
            <h2 className="text-lg font-bold leading-snug text-[#1a1a1a] sm:text-xl">
              {t("section4_title")}
            </h2>
            <div className={`mt-4 space-y-3 ${bodyClass}`}>
              <p>{t.rich("section4_p1", { b: bold })}</p>
              <p>{t.rich("section4_p2", { b: bold })}</p>
              <p>{t("section4_p3")}</p>
              <p>{t.rich("section4_p4", { b: bold })}</p>
            </div>
          </section>
        </article>
      </main>
    </div>
  );
}
