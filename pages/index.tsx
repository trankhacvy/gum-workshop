import ConnectWalletButton from "@/components/connect-wallet-button"
import { CreateDomainForm } from "@/components/create-domain-form"
import { CreatePostForm } from "@/components/create-post-form"
import { CreateProfileForm } from "@/components/create-profile-form"
import { IconButton } from "@/components/ui/icon-button"
import { useUserData } from "@/hooks/use-user-data"
import { useWallet } from "@solana/wallet-adapter-react"
import { RefreshCwIcon } from "lucide-react"

export default function HomePage() {
  const { connected } = useWallet()
  const { nameServices, profiles, posts, loading, refreshData } = useUserData()

  console.log("userDomainList", nameServices)

  if (!connected)
    return (
      <div className="flex h-full w-full items-center justify-center">
        <ConnectWalletButton />
      </div>
    )

  if (loading) {
    return <div className="mx-auto flex w-full max-w-screen-md">loading...</div>
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="mx-auto flex w-full max-w-screen-md justify-end">
        <IconButton onClick={refreshData}>
          <RefreshCwIcon />
        </IconButton>
      </div>
      <CreateDomainForm nameServices={nameServices} onSuccess={refreshData} />
      <CreateProfileForm profiles={profiles} onSuccess={refreshData} />
      <CreatePostForm posts={posts} profiles={profiles} onSuccess={refreshData} />
    </div>
  )
}
