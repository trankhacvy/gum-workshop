import { Nameservice, Post, Profile } from "@/types"
import { GumNameService, useGumContext } from "@gumhq/react-sdk"
import { useWallet } from "@solana/wallet-adapter-react"
import { useEffect, useState } from "react"

export const useUserData = () => {
  const { publicKey, connected } = useWallet()
  const { sdk } = useGumContext()
  const nameService = new GumNameService(sdk)

  const [nameServices, setNameServices] = useState<Nameservice[]>([])
  const [profiles, setProfiles] = useState<Profile[]>([])
  const [posts, setPosts] = useState<Post[]>([])

  const [loading, setLoading] = useState(false)
  const [refresh, setRefresh] = useState(false)

  useEffect(() => {
    if (!publicKey || !connected) return
    if (!sdk) return

    const getUserData = async () => {
      setLoading(true)
      const nameServices = await nameService.getNameservicesByAuthority(publicKey.toBase58())
      const profiles = await sdk.profile.getProfilesByAuthority(publicKey)
      const posts = await sdk.post.getPostsByAuthority(publicKey)

      setNameServices(nameServices)
      setProfiles(profiles)
      setPosts(posts)
      setLoading(false)
    }

    getUserData()
  }, [publicKey, connected, refresh])

  const refreshData = () => {
    setRefresh((prev) => !prev)
  }

  return {
    nameServices,
    profiles,
    posts,
    refreshData,
    loading,
  }
}
