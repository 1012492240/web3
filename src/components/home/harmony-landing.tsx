"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { Link, useRouter } from "@/i18n/navigation";

const HOME_LOGO_SRC = "/imgs/home/logo.png";
const HOME_ECOSYSTEM_IMG = "/imgs/home/shengtai.png";

interface Proclamation {
  index: number;
  title: string;
  content: string;
  updated_at: string;
  picture: string;
}

type EngineCard = { title: string; desc: string };

export default function HarmonyLanding() {
  const t = useTranslations("home");
  const router = useRouter();
  const locale = useLocale();
  const [proclaims, setProclaims] = useState<Proclamation[]>([]);

  // Scroll animation observer
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("opacity-100", "translate-y-0");
            entry.target.classList.remove("opacity-0", "translate-y-10");
          }
        });
      },
      { threshold: 0.1 }
    );

    const elements = document.querySelectorAll(".scroll-reveal");
    elements.forEach((el) => observer.observe(el));

    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const fetchProclaim = async () => {
      try {
        const response = await fetch("/api/info/proclaims", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ locale }),
        });
        const data = await response.json();
        if (data.proclamation != null) setProclaims(data.proclamation);
      } catch (e) {
        console.error(e);
      }
    };
    fetchProclaim();
  }, [locale]);

  const engineCards = (t.raw("harmony.engine_cards") as EngineCard[] | undefined) ?? [];

  return (
    <div className="flex flex-col bg-[#050608] text-white">
      {/* Hero Section */}
      <section className="relative min-h-[min(72vh,640px)] sm:min-h-[80vh] flex flex-col items-center justify-center overflow-hidden pb-6 pt-20 sm:pb-8 sm:pt-24">
        {/* Background Effects */}
        <div className="absolute inset-0 bg-[#050608]">
          <div className="absolute top-1/4 left-1/4 w-72 h-72 bg-purple-600/20 rounded-full blur-[100px] animate-pulse" />
          <div className="absolute bottom-1/4 right-1/4 w-72 h-72 bg-blue-600/20 rounded-full blur-[100px] animate-pulse delay-1000" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.03)_0%,transparent_50%)]" />
        </div>

        <div className="relative z-10 mx-auto flex w-full max-w-4xl flex-col items-center px-4 sm:px-6 text-center">
          {/* Animated Logo / Title */}
          <h1 className="flex flex-wrap justify-center gap-x-1 gap-y-0.5 sm:gap-x-2 sm:gap-y-1 text-[1.65rem] min-[380px]:text-3xl sm:text-6xl md:text-7xl lg:text-8xl font-black tracking-tighter leading-none">
            {"HARMONY LINK".split("").map((char, i) => {
              if (char === " ") return <span key={i} className="w-4 sm:w-8" />;
              const colors = [
                "text-rose-500", "text-orange-500", "text-amber-400", "text-lime-400",
                "text-emerald-400", "text-teal-400", "text-cyan-400", "text-blue-500",
                "text-indigo-500", "text-violet-500", "text-fuchsia-500"
              ];
              const colorClass = colors[i > 6 ? i - 1 : i]; // Adjust for space
              return (
                <span 
                  key={i} 
                  className={`${colorClass} hover:scale-110 transition-transform duration-300 cursor-default drop-shadow-[0_0_15px_rgba(255,255,255,0.2)]`}
                >
                  {char}
                </span>
              );
            })}
          </h1>

          {/* Subtitle */}
          <div className="mt-5 sm:mt-8 md:mt-10 flex flex-col items-center gap-2.5 sm:gap-4">
            <p className="text-base sm:text-xl md:text-2xl lg:text-3xl font-medium text-transparent bg-clip-text bg-gradient-to-r from-gray-100 to-gray-400 tracking-wide px-1">
              重构web3注意力经济
            </p>
            <p className="text-sm sm:text-lg md:text-xl lg:text-2xl text-gray-400 font-light tracking-wide sm:tracking-wider">
              让用户行为成为可编程资产
            </p>
          </div>

          <div className="mx-auto mt-7 sm:mt-10 md:mt-12 h-1 w-20 sm:w-24 rounded-full bg-gradient-to-r from-transparent via-white/50 to-transparent" />

          {proclaims.length > 0 && (
            <div className="mt-7 sm:mt-10 md:mt-12 w-full max-w-2xl overflow-hidden rounded-2xl border border-white/10 bg-white/5 backdrop-blur-md shadow-[0_0_30px_rgba(0,0,0,0.5)]">
              <div className="animate-marquee flex whitespace-nowrap py-3">
                {proclaims.map((p, i) => (
                  <button
                    key={i}
                    type="button"
                    className={`inline-flex items-center px-8 text-sm sm:text-base text-white/90 hover:text-white transition-colors ${i > 0 ? "border-l border-white/10" : ""}`}
                    onClick={() => router.push(`/my/proclaim/${p.index}`)}
                  >
                    <span className="mr-2 text-teal-400">✧</span>
                    {p.title}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </section>

      {/* About Harmony */}
      <section className="relative border-y border-white/5 bg-[#050608] py-14 sm:py-20 lg:py-24 overflow-hidden group/section">
        {/* Background Effects */}
        <div className="pointer-events-none absolute left-0 top-0 h-full w-full bg-[radial-gradient(ellipse_at_top_left,rgba(59,130,246,0.1),transparent_50%)] transition-opacity duration-1000" />
        <div className="pointer-events-none absolute right-0 bottom-0 h-full w-full bg-[radial-gradient(ellipse_at_bottom_right,rgba(168,85,247,0.1),transparent_50%)] transition-opacity duration-1000" />

        <div className="relative z-10 mx-auto max-w-6xl px-4 sm:px-6">
          {/* Header */}
          <div className="scroll-reveal opacity-0 translate-y-10 transition-all duration-1000 flex flex-col items-center text-center mb-10 sm:mb-14 hover:-translate-y-2">
            <h2 className="text-2xl sm:text-4xl md:text-5xl font-bold tracking-tight text-white mb-3 sm:mb-4 drop-shadow-lg">
              关于Harmony(ONE)
            </h2>
            <p className="text-base sm:text-lg md:text-xl text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500 font-medium mb-4 sm:mb-6 tracking-wide px-1">
              高吞吐量、低延迟、EVM兼容的分片公链
            </p>
            <div className="inline-flex items-center gap-2 px-4 sm:px-5 py-1.5 sm:py-2 rounded-full bg-white/5 border border-white/10 text-xs sm:text-sm text-white/80 mb-5 sm:mb-8 shadow-lg backdrop-blur-sm">
              <svg className="w-4 h-4 text-rose-500 animate-pulse" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
              </svg>
              美国 加利福尼亚州山景城
            </div>
            <p className="max-w-3xl text-sm sm:text-base md:text-lg leading-relaxed text-white/70 bg-white/5 p-4 sm:p-6 rounded-2xl border border-white/10 shadow-2xl backdrop-blur-sm">
              Harmony(ONE) 2018年成立于美国加里亚福尼亚州山景城；2019年05月在币安Launchpad IEO上线L1公链，5分钟售罄500万美元IEO成为当时区块链的神话。7年探索，我们实现了：
            </p>
          </div>

          {/* 3 Water Containers — 一行三列，手机端紧凑 */}
          <div className="grid grid-cols-3 gap-2 sm:gap-3 md:gap-6 mb-10 sm:mb-14 min-w-0">
            {/* Container 1 */}
            <div className="scroll-reveal opacity-0 translate-y-10 transition-all duration-1000 delay-100 relative group min-h-0 h-[138px] sm:h-[180px] md:h-56 rounded-xl sm:rounded-2xl md:rounded-[2rem] bg-gradient-to-b from-white/5 to-white/5 border border-white/10 overflow-hidden flex flex-col items-center justify-center px-1 py-2 sm:p-3 md:p-5 hover:-translate-y-1 sm:hover:-translate-y-2 hover:shadow-[0_0_24px_rgba(59,130,246,0.25)] hover:border-blue-500/50">
              <div className="absolute bottom-0 left-0 w-full h-[55%] bg-gradient-to-t from-blue-600/40 to-cyan-400/20 group-hover:h-[65%] transition-all duration-700 ease-in-out">
                <div className="absolute -top-2 left-0 w-[200%] h-4 sm:h-5 bg-cyan-400/30 rounded-[100%] animate-[wave_3s_linear_infinite]" />
                <div className="absolute -top-3 left-[-50%] w-[200%] h-4 sm:h-5 bg-blue-500/20 rounded-[100%] animate-[wave_4s_linear_infinite_reverse]" />
              </div>
              <div className="relative z-10 flex min-w-0 w-full flex-col items-center justify-center gap-0.5 sm:gap-1">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-blue-400/50 bg-blue-500/20 backdrop-blur-md sm:h-10 sm:w-10 md:h-14 md:w-14 md:mb-0.5 group-hover:scale-105 transition-transform">
                  <span className="text-base sm:text-lg md:text-2xl">⚡</span>
                </div>
                <h3 className="text-sm sm:text-lg md:text-2xl font-black text-white drop-shadow-md leading-none">4条</h3>
                <p className="text-center text-[9px] leading-[1.25] text-white/85 font-medium sm:text-[11px] sm:leading-snug md:text-xs md:px-0.5">
                  <span className="sm:hidden">
                    高速公路般
                    <br />
                    并行分片链
                  </span>
                  <span className="hidden sm:inline">高速公路般并行的分片链</span>
                </p>
              </div>
            </div>

            {/* Container 2 */}
            <div className="scroll-reveal opacity-0 translate-y-10 transition-all duration-1000 delay-200 relative group min-h-0 h-[138px] sm:h-[180px] md:h-56 rounded-xl sm:rounded-2xl md:rounded-[2rem] bg-gradient-to-b from-white/5 to-white/5 border border-white/10 overflow-hidden flex flex-col items-center justify-center px-1 py-2 sm:p-3 md:p-5 hover:-translate-y-1 sm:hover:-translate-y-2 hover:shadow-[0_0_24px_rgba(168,85,247,0.25)] hover:border-purple-500/50">
              <div className="absolute bottom-0 left-0 w-full h-[45%] bg-gradient-to-t from-purple-600/40 to-fuchsia-400/20 group-hover:h-[55%] transition-all duration-700 ease-in-out">
                <div className="absolute -top-2 left-0 w-[200%] h-4 sm:h-5 bg-fuchsia-400/30 rounded-[100%] animate-[wave_3.5s_linear_infinite]" />
                <div className="absolute -top-3 left-[-50%] w-[200%] h-4 sm:h-5 bg-purple-500/20 rounded-[100%] animate-[wave_4.5s_linear_infinite_reverse]" />
              </div>
              <div className="relative z-10 flex min-w-0 w-full flex-col items-center justify-center gap-0.5 sm:gap-1">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-purple-400/50 bg-purple-500/20 backdrop-blur-md sm:h-10 sm:w-10 md:h-14 md:w-14 md:mb-0.5 group-hover:scale-105 transition-transform">
                  <span className="text-base sm:text-lg md:text-2xl">💎</span>
                </div>
                <h3 className="text-[11px] sm:text-base md:text-xl font-black text-white drop-shadow-md leading-tight text-center px-0.5">
                  万分之一
                </h3>
                <p className="text-center text-[8px] leading-[1.2] text-white/85 font-medium sm:text-[10px] md:text-xs md:leading-snug">
                  <span className="sm:hidden">
                    跨链手续费
                    <br />
                    低至万分之$
                  </span>
                  <span className="hidden sm:inline">跨链交易手续费降低至万分之美元</span>
                </p>
              </div>
            </div>

            {/* Container 3 */}
            <div className="scroll-reveal opacity-0 translate-y-10 transition-all duration-1000 delay-300 relative group min-h-0 h-[138px] sm:h-[180px] md:h-56 rounded-xl sm:rounded-2xl md:rounded-[2rem] bg-gradient-to-b from-white/5 to-white/5 border border-white/10 overflow-hidden flex flex-col items-center justify-center px-1 py-2 sm:p-3 md:p-5 hover:-translate-y-1 sm:hover:-translate-y-2 hover:shadow-[0_0_24px_rgba(16,185,129,0.25)] hover:border-emerald-500/50">
              <div className="absolute bottom-0 left-0 w-full h-[75%] bg-gradient-to-t from-emerald-600/40 to-teal-400/20 group-hover:h-[85%] transition-all duration-700 ease-in-out">
                <div className="absolute -top-2 left-0 w-[200%] h-4 sm:h-5 bg-teal-400/30 rounded-[100%] animate-[wave_4s_linear_infinite]" />
                <div className="absolute -top-3 left-[-50%] w-[200%] h-4 sm:h-5 bg-emerald-500/20 rounded-[100%] animate-[wave_5s_linear_infinite_reverse]" />
              </div>
              <div className="relative z-10 flex min-w-0 w-full flex-col items-center justify-center gap-0.5 sm:gap-1">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-emerald-400/50 bg-emerald-500/20 backdrop-blur-md sm:h-10 sm:w-10 md:h-14 md:w-14 md:mb-0.5 group-hover:scale-105 transition-transform">
                  <span className="text-base sm:text-lg md:text-2xl">🌱</span>
                </div>
                <h3 className="text-sm sm:text-lg md:text-2xl font-black text-white drop-shadow-md leading-none">412个</h3>
                <p className="text-center text-[9px] leading-[1.25] text-white/85 font-medium sm:text-[11px] sm:leading-snug md:text-xs md:px-0.5">
                  <span className="sm:hidden">
                    扶持生态
                    <br />
                    项目生根发芽
                  </span>
                  <span className="hidden sm:inline">扶持生态项目生根发芽</span>
                </p>
              </div>
            </div>
          </div>

      
        </div>
        
        <style dangerouslySetInnerHTML={{__html: `
          @keyframes wave {
            0% { transform: translateX(0); }
            100% { transform: translateX(-50%); }
          }
          @keyframes highway {
            0% { transform: translateX(-100%); }
            100% { transform: translateX(400%); }
          }
        `}} />
      </section>

      {/* 重构 WEB3 流量货币化 — 位于生态操作系统模块之上 */}
      <section className="relative py-16 sm:py-24 lg:py-32 overflow-hidden bg-[#050608]">
        <div className="absolute inset-0">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-amber-600/10 rounded-full blur-[120px] opacity-60 animate-pulse" />
          <div className="absolute inset-0 bg-[url('/imgs/grid.svg')] bg-center opacity-20 [mask-image:radial-gradient(ellipse_at_center,white,transparent_70%)]" />
        </div>

        <div className="relative z-10 mx-auto max-w-5xl px-4 sm:px-6">
          <div className="scroll-reveal opacity-0 translate-y-10 transition-all duration-1000 relative rounded-2xl sm:rounded-[2.5rem] bg-gradient-to-b from-white/[0.05] to-transparent border border-white/10 p-5 sm:p-10 md:p-14 lg:p-16 backdrop-blur-xl overflow-hidden group hover:border-amber-500/30 hover:shadow-[0_0_50px_rgba(245,158,11,0.1)]">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-amber-500 to-transparent opacity-50" />
            <div className="absolute -top-24 -left-24 w-48 h-48 bg-amber-500/20 rounded-full blur-[50px] group-hover:bg-amber-500/30 transition-colors" />
            <div className="absolute -bottom-24 -right-24 w-48 h-48 bg-orange-500/20 rounded-full blur-[50px] group-hover:bg-orange-500/30 transition-colors" />

            <div className="relative flex flex-col items-center">
              <div className="inline-flex items-center justify-center rounded-full bg-amber-500/10 px-3.5 py-1.5 sm:px-5 sm:py-2 mb-5 sm:mb-8 ring-1 ring-amber-500/30 shadow-[0_0_20px_rgba(245,158,11,0.2)]">
                <span className="text-[11px] sm:text-sm font-bold tracking-wider sm:tracking-widest text-amber-400 uppercase flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
                  Value Operating System
                </span>
              </div>

              <h2 className="text-xl sm:text-3xl md:text-4xl lg:text-5xl font-black tracking-tight text-white mb-6 sm:mb-10 drop-shadow-lg text-center px-1">
                重构WEB3流量货币化
              </h2>

              <div className="relative text-base sm:text-lg md:text-xl leading-relaxed sm:leading-loose text-white/80 max-w-4xl font-light">
                <span className="absolute -top-6 sm:-top-10 -left-2 sm:-left-10 text-5xl sm:text-7xl text-amber-500/20 font-serif select-none">&ldquo;</span>
                <p className="mb-5 sm:mb-8 relative z-10 text-left sm:text-justify indent-0 sm:indent-8 md:indent-10">
                  历经多年探索，WEB3核心支柱——
                  <span className="text-amber-300 font-medium">去中心化治理</span>、
                  <span className="text-amber-300 font-medium">用户主权回归</span>及
                  <span className="text-amber-300 font-medium">数字资产确权机制</span>
                  仍处于范式构建期。Harmony(ONE)以开创性实践破局；通过链上行为资产化引擎，将用户社交、创作、交互数据转化为可验证数字资产，实现
                  <span className="text-white font-medium drop-shadow-[0_0_8px_rgba(255,255,255,0.3)] border-b border-amber-500/50 pb-1">
                    数据主权的不可篡改赋权
                  </span>
                  。
                </p>
                <p className="relative z-10 text-left sm:text-justify indent-0 sm:indent-8 md:indent-10">
                  HarmonyLink非技术迭代产物，而是资产确权范式的进化跃迁，其本质是重塑
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-orange-500 font-bold text-lg sm:text-2xl px-0.5 sm:px-1">
                    「行为及产权」
                  </span>
                  的价值操作系统，标志着 WEB3从概念层到价值层的
                  <span className="text-orange-400 font-bold">工业革命</span>
                  已然启幕。
                </p>
                <span className="absolute -bottom-10 sm:-bottom-16 -right-2 sm:-right-10 text-5xl sm:text-7xl text-amber-500/20 font-serif rotate-180 select-none">&rdquo;</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* OS + phone */}
      <section className="relative overflow-hidden bg-[#050608] py-16 sm:py-24 lg:py-32">
        {/* Abstract Background Elements */}
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-[radial-gradient(circle_at_center,rgba(220,38,38,0.15),transparent_60%)]" />
          <div className="absolute bottom-0 left-0 w-[800px] h-[800px] bg-[radial-gradient(circle_at_center,rgba(234,88,12,0.1),transparent_60%)]" />
          <div className="absolute inset-0 bg-[url('/imgs/noise.png')] opacity-30 mix-blend-overlay" />
          {/* Animated lines */}
          <div className="absolute top-1/4 left-0 w-full h-px bg-gradient-to-r from-transparent via-red-500/20 to-transparent transform -rotate-12" />
          <div className="absolute bottom-1/4 left-0 w-full h-px bg-gradient-to-r from-transparent via-orange-500/20 to-transparent transform rotate-12" />
        </div>
        
        <style dangerouslySetInnerHTML={{__html: `
          @keyframes shimmer {
            100% { transform: translateX(100%); }
          }
        `}} />
      </section>

      {/* Engine cards */}
      <section className="relative bg-[#030406] py-16 sm:py-24 lg:py-32 overflow-hidden">
        {/* Abstract Background Elements */}
        <div className="absolute inset-0">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[500px] bg-[radial-gradient(ellipse_at_top,rgba(236,72,153,0.15),transparent_70%)]" />
          <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-[radial-gradient(circle_at_bottom_left,rgba(59,130,246,0.1),transparent_60%)]" />
          <div className="absolute bottom-0 right-0 w-[600px] h-[600px] bg-[radial-gradient(circle_at_bottom_right,rgba(139,92,246,0.1),transparent_60%)]" />
          <div className="absolute inset-0 bg-[url('/imgs/grid.svg')] bg-center opacity-10" />
        </div>

        <div className="relative z-10 mx-auto max-w-7xl px-6">
          {/* Header Section */}
          <div className="scroll-reveal opacity-0 translate-y-10 transition-all duration-1000 mb-20 text-center max-w-4xl mx-auto">
            <div className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-pink-500/10 border border-pink-500/20 text-pink-400 text-sm font-bold tracking-widest mb-8 shadow-[0_0_20px_rgba(236,72,153,0.15)]">
              <span className="w-2 h-2 rounded-full bg-pink-500 animate-pulse" />
              5 ECOSYSTEM ENGINES
            </div>
            
            <h2 className="flex flex-col items-center gap-1.5 sm:gap-2 text-2xl sm:text-4xl lg:text-5xl xl:text-6xl font-black tracking-tight text-white mb-5 sm:mb-8 px-1 leading-tight">
              <span className="block">五大生态引擎构建</span>
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-pink-500 via-purple-500 to-blue-500">
                价值性后验机制
              </span>
            </h2>
            
            <div className="relative">
              <div className="absolute -left-4 top-0 w-1 h-full bg-gradient-to-b from-pink-500 via-purple-500 to-transparent rounded-full hidden md:block" />
              <p className="text-sm sm:text-base md:text-lg leading-relaxed text-white/70 text-left sm:text-justify md:pl-6">
                区块链行业不缺乏创新模式，然多数项目因<span className="text-pink-400 font-medium">持续性造血机制缺失</span>终陷困局：所谓盈利模型或脱离用户参与实质，或沦为资本叙事工具，一旦增长遇阻即演变为系统性风险；HarmonyLink以<span className="text-white font-bold border-b border-purple-500/50 pb-1">五大生态引擎</span>支撑用户价值捕获。
              </p>
            </div>
          </div>

        </div>
      </section>

      {/* 生态体系 — 静态图 */}
      <section className="border-t border-white/5 bg-[#030508] py-14 sm:py-20">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="scroll-reveal opacity-0 translate-y-10 transition-all duration-1000 mb-8 text-center sm:mb-10">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-cyan-500/25 bg-cyan-500/10 px-4 py-1.5 text-[11px] font-semibold uppercase tracking-widest text-cyan-400/95 sm:text-xs">
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-cyan-400" />
              Ecosystem Map
            </div>
            <h2 className="text-xl font-bold tracking-tight text-white sm:text-2xl md:text-3xl">{t("harmony.orbit_title")}</h2>
            <p className="mx-auto mt-3 max-w-2xl text-xs leading-relaxed text-white/55 sm:text-sm">{t("harmony.orbit_subtitle")}</p>
          </div>
          <div className="scroll-reveal opacity-0 translate-y-10 transition-all duration-1000 delay-100">
            <div className="relative mx-auto overflow-hidden rounded-2xl border border-white/10 bg-black/20">
              <Image
                src={HOME_ECOSYSTEM_IMG}
                alt={t("harmony.orbit_title")}
                width={1600}
                height={900}
                className="h-auto w-full object-contain"
                sizes="(max-width: 768px) 100vw, 1152px"
                priority={false}
              />
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-teal-900/50 bg-[#0a1214] py-8 pb-[max(2rem,env(safe-area-inset-bottom))] sm:py-12">
        <div className="mx-auto grid max-w-5xl grid-cols-2 gap-x-4 gap-y-8 sm:gap-x-6 sm:gap-y-10 lg:grid-cols-4 px-4 sm:px-6">
          <div className="min-w-0">
            <h3 className="text-[11px] font-semibold uppercase tracking-wider text-teal-400/90 sm:text-xs">{t("harmony.footer_tools")}</h3>
            <ul className="mt-3 space-y-2.5 text-[13px] leading-snug text-white/65 sm:mt-4 sm:text-sm">
              <li>
                <span className="cursor-default hover:text-white">{t("harmony.footer_sdk")}</span>
              </li>
              <li>
                <span className="cursor-default hover:text-white">{t("harmony.footer_wallet")}</span>
              </li>
              <li>
                <span className="cursor-default hover:text-white">{t("harmony.footer_devbox")}</span>
              </li>
            </ul>
          </div>
          <div className="min-w-0">
            <h3 className="text-[11px] font-semibold uppercase tracking-wider text-teal-400/90 sm:text-xs">{t("harmony.footer_dev")}</h3>
            <ul className="mt-3 space-y-2.5 text-[13px] leading-snug text-white/65 sm:mt-4 sm:text-sm">
              <li>
                <span className="cursor-default hover:text-white">{t("harmony.footer_account_kit")}</span>
              </li>
              <li>
                <span className="cursor-default hover:text-white">{t("harmony.footer_ads_kit")}</span>
              </li>
              <li>
                <span className="cursor-default hover:text-white">{t("harmony.footer_game_kit")}</span>
              </li>
            </ul>
          </div>
          <div className="min-w-0">
            <h3 className="text-[11px] font-semibold uppercase tracking-wider text-teal-400/90 sm:text-xs">{t("harmony.footer_resources")}</h3>
            <ul className="mt-3 space-y-2.5 text-[13px] leading-snug text-white/65 sm:mt-4 sm:text-sm">
              <li>
                <Link href="/download#whitepaper" className="inline-block py-0.5 hover:text-white">
                  {t("harmony.footer_whitepaper")}
                </Link>
              </li>
              <li>
                <Link href="/about" className="inline-block py-0.5 hover:text-white">
                  {t("harmony.footer_community")}
                </Link>
              </li>
              <li>
                <Link href="/download" className="inline-block py-0.5 hover:text-white">
                  {t("harmony.footer_docs")}
                </Link>
              </li>
            </ul>
          </div>
          <div className="min-w-0">
            <h3 className="text-[11px] font-semibold uppercase tracking-wider text-teal-400/90 sm:text-xs">{t("harmony.footer_programs")}</h3>
            <ul className="mt-3 space-y-2.5 text-[13px] leading-snug text-white/65 sm:mt-4 sm:text-sm">
              <li>
                <span className="cursor-default hover:text-white">{t("harmony.footer_dev_groups")}</span>
              </li>
              <li>
                <span className="cursor-default hover:text-white">{t("harmony.footer_grants")}</span>
              </li>
            </ul>
          </div>
        </div>

      </footer>

      <div className="h-16 shrink-0 md:h-0" aria-hidden />
    </div>
  );
}
