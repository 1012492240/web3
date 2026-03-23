"use client";

import React from "react";
import Image from "next/image";

interface BorderCustomProps {
  children: React.ReactNode;
  type?: 1 | 2;
  className?: string;
  style?: React.CSSProperties;
}

export default function BorderCustom({
  children,
  type = 1,
  className = "",
  style = {},
}: BorderCustomProps) {
  // 根据类型确定图片后缀
  const imageSuffix = type === 2 ? "2" : "";

  return (
    <div className={`relative ${className}`} style={style}>
      {/* 四个角的装饰图片 */}
      <Image
        src={`/images/v2/home/left-top${imageSuffix}.png`}
        alt=""
        width={8}
        height={8}
        className="absolute top-0 left-0 w-2 h-2"
      />
      <Image
        src={`/images/v2/home/right-top${imageSuffix}.png`}
        alt=""
        width={8}
        height={8}
        className="absolute right-0 top-0 w-2 h-2"
      />
      <Image
        src={`/images/v2/home/left-bottom${imageSuffix}.png`}
        alt=""
        width={8}
        height={8}
        className="absolute left-0 w-2 h-2"
        style={{
          bottom: "-1px",
        }}
      />
      <Image
        src={`/images/v2/home/right-bottom${imageSuffix}.png`}
        alt=""
        width={8}
        height={8}
        className="absolute right-0 w-2 h-2"
        style={{
          bottom: "-1px",
        }}
      />

      {/* 子内容 */}
      {children}
    </div>
  );
}
