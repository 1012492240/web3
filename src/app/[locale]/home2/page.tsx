"use client";

import Image from "next/image";
import { useTranslations } from "next-intl";

const HOME_ALL_IMG = "/imgs/home/home-test.png";

export default function Home2Page() {
  const t = useTranslations("home");

  return (
    <div className="min-h-screen bg-[#050608] pt-14 text-white">
      <main className="w-full">
        <Image
          src={HOME_ALL_IMG}
          alt={t("home2_alt")}
          width={1920}
          height={1080}
          className="h-auto w-full object-contain object-top"
          sizes="100vw"
          priority
        />
      </main>
    </div>
  );
}
