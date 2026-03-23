'use client'
import { useRef, createContext, useContext, ReactNode } from 'react';
import { useAppKit } from '@reown/appkit/react';

// Create a context to hold the ref
const WalletRefContext = createContext<React.RefObject<HTMLDivElement> | null>(null);

// Provider component
export const WalletRefProvider = ({ children }: { children: ReactNode }) => {
  const ref = useRef<HTMLDivElement>(null);
  
  return (
    <WalletRefContext.Provider value={ref}>
      {children}
    </WalletRefContext.Provider>
  );
};

// Hook to use the ref
export const useWalletRef = () => {
  const context = useContext(WalletRefContext);
  if (!context) {
    throw new Error('useWalletRef must be used within a WalletRefProvider');
  }
  return context;
};

// Helper function to trigger wallet connect
export const triggerWalletConnect = () => {
  // Find a wallet connect button by common class names or data attributes
  const walletButton = document.querySelector('button[data-wallet-connect], button.wallet-connect-btn, button.connect-wallet');
  if (walletButton instanceof HTMLElement) {
    walletButton.click();
    return true;
  }
  return false;
};

// Hook to programmatically connect wallet
export const useWalletConnector = () => {
  const { open } = useAppKit();
  
  const connectWallet = () => {
    open();
    return true;
  };
  
  return { connectWallet };
};