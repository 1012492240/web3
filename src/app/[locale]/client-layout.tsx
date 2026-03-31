'use client'

import { useEffect, useState } from 'react'
import Theme from '../theme-provider'
import AOS from 'aos'
import 'aos/dist/aos.css'
import Header from '@/components/ui/header'
import ConnectWallet from '@/components/connect-wallet'
import { WalletRefProvider } from '@/components/ui/wallet-ref'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { WagmiProvider } from 'wagmi'
import { config } from '@/config/wagmi' // Initialize Reown AppKit configuration

const RTL_LOCALES = new Set(['ar'])

export default function ClientLayout({
  children,
  locale,
}: {
  children: React.ReactNode
  locale: string
}) {
  const dir = RTL_LOCALES.has(locale) ? 'rtl' : 'ltr'
  useEffect(() => {
    AOS.init({
      once: true,
      disable: 'phone',
      duration: 600,
      easing: 'ease-out-sine',
    })
  }, [])

  // 单例：避免每次 layout 重渲染时 new QueryClient，导致缓存丢失与额外开销
  const [queryClient] = useState(() => new QueryClient())

  return (
    <Theme>
      <WagmiProvider config={config}>
        <QueryClientProvider client={queryClient}>
          <WalletRefProvider>
            <div
              className="flex min-h-screen flex-col overflow-hidden bg-black"
              dir={dir}
              lang={locale}
            >
              <div className="sr-only" aria-hidden>
                <ConnectWallet size="small" />
              </div>
              <Header />
              <main className="grow">
                {children}
              </main>
            </div>
          </WalletRefProvider>
        </QueryClientProvider>
      </WagmiProvider>
    </Theme>
  )
}
