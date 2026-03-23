"use client";

import React from "react";

interface IndexBtnProps {
  children: React.ReactNode;
  onClick?: () => void;
  height?: string;
  fontSize?: string;
  size?: "small" | undefined;
  isConnectWallet?: boolean;
}

const IndexBtn: React.FC<IndexBtnProps> = ({
  children,
  onClick,
  height = "52px",
  fontSize = "20px",
  size,
  isConnectWallet = false,
}) => {
  // Special styling for connect wallet button
  if (isConnectWallet) {
    return (
      <button
        data-wallet-connect
        className="bg-gradient-to-r from-[#0066CC]/40 to-[#50C8FF]/40 hover:bg-gradient-to-r hover:from-[#0066CC] hover:to-[#B3FFE6] transition-all duration-300"
        onClick={onClick}
        style={{
          width: "124px",
          height: "32px",
          borderRadius: "6px",
          color: "#fff",
          border: "none",
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontWeight: 600,
          transition: "all 0.3s ease",
          whiteSpace: "nowrap",
          padding: "10px 20px",
          boxShadow: "0px 4px 4px 0px rgba(80, 200, 255, 0.18)",
          background: "#0066CC",
        }}
      >
        <span
          style={{
            height: "16px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "12px",
            lineHeight: "16px",
            gap: "4px",
          }}
        >
          {children}
        </span>
      </button>
    );
  }

  // Original styling for other buttons
  return (
    <button
      className="bg-gradient-to-r from-[#0066CC] to-[#50C8FF] hover:bg-gradient-to-r hover:from-[#B3FFE6] hover:to-[#50C8FF] transition-all duration-300"
      onClick={onClick}
      style={{
        height,
        padding: "10px 20px",
        borderRadius: "6px",
        color: "#fff",
        border: "none",
        cursor: "pointer",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontWeight: 600,
        transition: "all 0.3s ease",
        whiteSpace: "nowrap",
        minWidth: size === "small" ? "140px" : "160px",
        boxShadow: "0px 4px 4px 0px rgba(80, 200, 255, 0.18)",
      }}
    >
      <span
        style={{
          fontSize: "12px",
          lineHeight: "16px",
        }}
      >
        {children}
      </span>
    </button>
  );
};

export default IndexBtn;
