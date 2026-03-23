import { createAppKit } from '@reown/appkit/react'
import { WagmiAdapter } from '@reown/appkit-adapter-wagmi'
import { bsc } from 'wagmi/chains'

// 1. Get projectId from https://cloud.reown.com
const projectId = '46503a41ae74872361114a0403da7f10'

// 2. Create a metadata object - optional
const metadata = {
  name: 'Ava Points',
  description: 'Ava Points - Decentralized Points System',
  url: 'https://ava-points.com', // origin must match your domain & subdomain
  icons: ['https://ava-points.com/favicon.ico']
}

// 3. Set the networks
const networks = [bsc]

// 4. Create Wagmi Adapter
const wagmiAdapter = new WagmiAdapter({
  networks,
  projectId
})

// 5. Create modal
createAppKit({
  adapters: [wagmiAdapter],
  networks: [bsc],
  projectId,
  metadata,
  features: {
    analytics: true // Optional - defaults to your Cloud configuration
  }
})

export const config = wagmiAdapter.wagmiConfig
