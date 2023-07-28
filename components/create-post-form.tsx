import { Typography } from "./ui/typography"
import { Input } from "./ui/input"
import { Button } from "./ui/button"
import { useState } from "react"
import { useGumContext, useSessionWallet, useCreatePost, useUploaderContext, GPLCORE_PROGRAMS } from "@gumhq/react-sdk"
import { Post, Profile } from "@/types"
import { Post as GumPost } from "@gumhq/ui-components"
import { PublicKey } from "@solana/web3.js"

type CreatePostFormProps = {
  posts?: Post[]
  profiles?: Profile[]
  onSuccess?: VoidFunction
}

export function CreatePostForm({ posts = [], profiles = [], onSuccess }: CreatePostFormProps) {
  console.log({ posts })
  const { sdk } = useGumContext()
  const session = useSessionWallet()
  const { sessionToken, createSession } = session

  const { createWithSession } = useCreatePost(sdk)
  const { handleUpload } = useUploaderContext()

  const [selectedProfileAddress, setSelectedProfileAddress] = useState("")
  const [content, setContent] = useState("")
  const [loading, setLoading] = useState(false)

  const refreshSession = async () => {
    if (!sessionToken) {
      const targetProgramId = GPLCORE_PROGRAMS["devnet"]
      const topUp = true
      const sessionDuration = 60
      return await createSession(targetProgramId, topUp, sessionDuration)
    }
    return session
  }

  const handleCreateDomainName = async () => {
    try {
      setLoading(true)
      const updatedSession = await refreshSession()
      console.log("session", updatedSession)
      if (
        !updatedSession ||
        !updatedSession.sessionToken ||
        !updatedSession.publicKey ||
        !updatedSession.signMessage ||
        !updatedSession.sendTransaction ||
        !selectedProfileAddress
      ) {
        console.log("Session or profile details missing")
        return
      }

      const postArray = new TextEncoder().encode(content)
      const signature = await updatedSession.signMessage(postArray)
      const signatureString = JSON.stringify(signature.toString())

      const metadata = {
        content: {
          content: content,
          format: "markdown",
        },
        type: "text",
        authorship: {
          publicKey: updatedSession.publicKey.toBase58(),
          signature: signatureString,
        },
        app_id: "gum-of-vy",
        metadataUri: "",
        transactionUrl: "",
      }

      const uploader = await handleUpload(metadata, updatedSession)
      if (!uploader) {
        console.log("Error uploading post")
        return
      }

      const txId = await createWithSession(
        uploader.url,
        new PublicKey(selectedProfileAddress),
        updatedSession.publicKey,
        new PublicKey(updatedSession.sessionToken),
        updatedSession.sendTransaction
      )
      console.log("txId", txId)
      onSuccess?.()
    } catch (error: any) {
      console.error(error)
      alert(error?.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="mx-auto flex w-full max-w-screen-md flex-col gap-5 rounded-2xl p-6 shadow-card">
      <Typography as="h6" level="h6" className="font-bold">
        Posts
      </Typography>
      <select value={selectedProfileAddress} onChange={(event) => setSelectedProfileAddress(event.target.value)}>
        <option value="">Select Profile</option>
        {profiles.map((profile: Profile) => (
          <option key={profile.address} value={profile.address}>
            {profile.metadata.name}
          </option>
        ))}
      </select>

      <Input
        value={content}
        onChange={(event) => setContent(event.target.value)}
        fullWidth
        placeholder="Content"
        className=""
      />
      <Button loading={loading} onClick={handleCreateDomainName}>
        Create
      </Button>
      <hr className="w-full border-t border-dashed border-gray-500" />
      {posts.map((post) => {
        const profileData = profiles.find((profile) => profile.address === post.profile)
        if (!profileData) return null

        return <GumPost data={post.metadata} profileData={profileData.metadata} key={post.address} />
      })}
    </div>
  )
}
