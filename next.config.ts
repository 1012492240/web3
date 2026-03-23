import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const nextConfig: NextConfig = {
  /* config options here */
  transpilePackages: ["@reown/appkit", "@reown/appkit-adapter-wagmi"],
  // Reown / WalletConnect：避免服务端打包 pino 等导致 vendor-chunks 引用异常
  serverExternalPackages: ["pino-pretty", "lokijs", "encoding"],
  images: {
    domains: ["localhost"],
    dangerouslyAllowSVG: true,
  },
  security: {
    dangerouslyAllowHTML: true,
  },
  webpack: (config, { isServer }) => {
    config.resolve.fallback = {
      ...config.resolve.fallback,
      porto: false,
      "@base-org/account": false,
      "@metamask/sdk": false,
    };
    // https://docs.reown.com/appkit/next/core/installation#extra-configuration
    if (isServer) {
      const ext = config.externals;
      if (Array.isArray(ext)) {
        ext.push("pino-pretty", "lokijs", "encoding");
      }
    }
    return config;
  },
};

const withNextIntl = createNextIntlPlugin();

export default withNextIntl(nextConfig);
