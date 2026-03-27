"use client";

import Image from "next/image";

const HOME_ALL_IMG = "/imgs/home/home-test.png";

export default function Home2Page() {
  return (
    <div className="min-h-screen bg-[#050608] pt-14 text-white">
      <main className="w-full">
        <Image
          src={HOME_ALL_IMG}
          alt="首页2"
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
