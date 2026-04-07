"use client";

import Image from "next/image";
import { useTranslations } from "next-intl";
import type { ReactNode } from "react";

export default function AirdropDetailContent() {
  const t = useTranslations("airdrop_page");

  const bold = (chunks: ReactNode) => (
    <strong className="font-bold text-[#1a1a1a]">{chunks}</strong>
  );

  const bodyClass = "text-start [&_strong]:font-bold [&_strong]:text-[#1a1a1a]";

  const heroTitleStyle = {
    fontSize: "18px",
    letterSpacing: "1px",
    lineHeight: "1.4",
    fontWeight: "bold" as const,
    color: "#1a1a1a",
    fontFamily:
      'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, "Noto Sans", sans-serif',
  };

  const titleStyle = {
    fontSize: "16px",
    letterSpacing: "0.5px",
    lineHeight: "1.4",
    color: "#1a1a1a",
    fontWeight: "bold",
    fontFamily:
      'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, "Noto Sans", sans-serif',
  };

  const paragraphStyle = {
    fontSize: "14px",
    letterSpacing: "0.5px",
    lineHeight: "1.6",
    color: "#333333",
    fontWeight: "normal",
    fontFamily:
      'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, "Noto Sans", sans-serif',
  };

  return (
    <div className="min-h-screen bg-white">
      <header
        className="min-h-[60px] w-full shadow-sm"
        style={{
          backgroundImage: "linear-gradient(0deg, #e50e0f 0%, #680a71 100%)",
        }}
        aria-hidden
      />

      <main className="mx-auto max-w-[min(100%,560px)] px-4 pb-28 pt-6 sm:px-6">
        <article className="space-y-6">
          <h1 className="text-center pb-1" style={heroTitleStyle}>
            {t("hero_title")}
          </h1>

          <section>
            <p className={bodyClass} style={paragraphStyle}>
              {t.rich("intro_body", { b: bold })}
            </p>
          </section>

          <section>
            <h2 style={titleStyle}>{t("participation_title")}</h2>
            <p className={`mt-2 ${bodyClass}`} style={paragraphStyle}>
              {t.rich("participation_body", { b: bold })}
            </p>
          </section>

          <figure className="py-2">
            <div className="relative w-full overflow-hidden rounded-xl">
              <Image
                src="/imgs/detail/airdrop-candy.png"
                alt={t("banner_alt")}
                width={1120}
                height={630}
                className="h-auto w-full object-contain object-center"
                sizes="(max-width: 560px) 100vw, 560px"
                priority
              />
            </div>

            <div className="mt-4 flex justify-center">
              <a
                href={t("subscribe_url")}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex min-w-[220px] items-center justify-center rounded-full px-10 py-3 text-[15px] font-semibold text-white shadow-sm"
                style={{
                  backgroundImage:
                    "linear-gradient(180deg, #e50e0f 0%, #a30b4a 55%, #680a71 100%)",
                }}
              >
                {t("cta_subscribe")}
              </a>
            </div>
          </figure>

          <section>
            <h2 style={titleStyle}>{t("prize_title")}</h2>
            <div className={`mt-2 space-y-2 ${bodyClass}`} style={paragraphStyle}>
              <p>{t.rich("prize_intro", { b: bold })}</p>
              <ul className="space-y-1.5">
                <li>{t.rich("prize_1", { b: bold })}</li>
                <li>{t.rich("prize_2", { b: bold })}</li>
                <li>{t.rich("prize_3", { b: bold })}</li>
                <li>{t.rich("prize_4", { b: bold })}</li>
              </ul>
            </div>
          </section>

          <section className="border-t border-[#eee] pt-6">
            <h2 style={titleStyle}>{t("distribution_title")}</h2>
            <div className={`mt-2 space-y-2 ${bodyClass}`} style={paragraphStyle}>
              <p>{t.rich("distribution_p1", { b: bold })}</p>
            </div>
          </section>
        </article>
      </main>
    </div>
  );
}

