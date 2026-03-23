// 'use client';

// import { FC, ReactNode, useMemo } from 'react';
// import { ConnectionProvider, WalletProvider } from '@solana/wallet-adapter-react';
// import { WalletModalProvider } from '@solana/wallet-adapter-react-ui';
// //import { PhantomWalletAdapter } from '@solana/wallet-adapter-wallets';
// import '@solana/wallet-adapter-react-ui/styles.css';
// import { Cluster, clusterApiUrl } from '@solana/web3.js';

// interface Props {
//   children: ReactNode;
// }

// const ClientProviders: FC<Props> = ({ children }) => {
//   const wallets = useMemo(() => [new PhantomWalletAdapter()], []);
//   const endpoint = clusterApiUrl('mainnet-beta');

//   return (
//     <ConnectionProvider endpoint={endpoint}>
//       <WalletProvider wallets={wallets}>
//         <WalletModalProvider>
//           {children}
//         </WalletModalProvider>
//       </WalletProvider>
//     </ConnectionProvider>
//   );
// };

// export default ClientProviders;
