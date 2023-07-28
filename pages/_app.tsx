import { WalletAdapterNetwork } from "@solana/wallet-adapter-base"
import {
  AnchorWallet,
  ConnectionProvider,
  WalletProvider,
  useAnchorWallet,
  useConnection,
} from "@solana/wallet-adapter-react"
import { WalletModalProvider } from "@solana/wallet-adapter-react-ui"
import { PhantomWalletAdapter, SolflareWalletAdapter } from "@solana/wallet-adapter-wallets"
import { clusterApiUrl } from "@solana/web3.js"
import type { AppProps } from "next/app"
import { DefaultSeo } from "next-seo"
import type { FC, PropsWithChildren } from "react"
import React, { useMemo } from "react"
import RootLayout from "@/components/layout"
import { siteConfig } from "@/config/site"
import { useGumSDK } from "@/hooks/use-gum-sdk"
import { GumProvider, SessionWalletProvider, UploaderProvider, useSessionKeyManager } from "@gumhq/react-sdk"

// Use require instead of import since order matters
require("@solana/wallet-adapter-react-ui/styles.css")
require("../styles/globals.css")

const GumSDKProvider = ({ children }: PropsWithChildren) => {
  const { connection } = useConnection()
  const anchorWallet = useAnchorWallet() as AnchorWallet
  const sdk = useGumSDK()
  const sessionWallet = useSessionKeyManager(anchorWallet, connection, "devnet")

  if (!sdk) return null

  return (
    <GumProvider sdk={sdk}>
      <SessionWalletProvider sessionWallet={sessionWallet}>
        <UploaderProvider uploaderType="arweave" connection={connection} cluster="devnet">
          {children}
        </UploaderProvider>
      </SessionWalletProvider>
    </GumProvider>
  )
}

const App: FC<AppProps> = ({ Component, pageProps }) => {
  // Can be set to 'devnet', 'testnet', or 'mainnet-beta'
  const network = WalletAdapterNetwork.Devnet

  // You can also provide a custom RPC endpoint
  const endpoint = useMemo(() => clusterApiUrl(network), [network])

  const wallets = useMemo(
    () => [new PhantomWalletAdapter(), new SolflareWalletAdapter()],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [network]
  )

  return (
    <>
      <DefaultSeo
        title={siteConfig.name}
        openGraph={{
          type: "website",
          locale: "en_EN",
          description: siteConfig.description,
          site_name: siteConfig.name,
          title: siteConfig.name,
        }}
        description={siteConfig.description}
      />

      <ConnectionProvider endpoint={endpoint}>
        <WalletProvider wallets={wallets} autoConnect>
          <WalletModalProvider>
            <GumSDKProvider>
              <RootLayout>
                <Component {...pageProps} />
              </RootLayout>
            </GumSDKProvider>
          </WalletModalProvider>
        </WalletProvider>
      </ConnectionProvider>
    </>
  )
}

export default App
