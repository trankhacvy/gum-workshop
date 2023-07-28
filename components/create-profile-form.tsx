import { Profile as GumProfileCard } from "@gumhq/ui-components"
import { useWallet } from "@solana/wallet-adapter-react"
import { Typography } from "./ui/typography"
import { Input } from "./ui/input"
import { Button } from "./ui/button"
import { useState } from "react"
import { useCreateProfile, useDomains, useGumContext, useUploaderContext } from "@gumhq/react-sdk"
import { Profile } from "@/types"
import { PublicKey } from "@solana/web3.js"

type CreateProfileFormProps = {
  profiles?: Profile[]
  onSuccess?: VoidFunction
}

export function CreateProfileForm({ profiles = [], onSuccess }: CreateProfileFormProps) {
  const wallet = useWallet()
  const { sdk } = useGumContext()
  const { userDomainAccounts } = useDomains(sdk, wallet.publicKey!)
  const { create } = useCreateProfile(sdk)
  const { handleUpload } = useUploaderContext()

  const [name, setName] = useState("")
  const [bio, setBio] = useState("")
  const [avatarUri, setAvatarUri] = useState("")
  const [selectedUserDomainOption, setSelectedUserDomainOption] = useState("")
  const [loading, setLoading] = useState(false)

  const handleCreateProfile = async () => {
    try {
      setLoading(true)
      const profileMetadata = {
        name,
        username: name,
        bio,
        avatar: avatarUri,
      }

      const uploadResponse = await handleUpload(profileMetadata, wallet)
      if (!uploadResponse) {
        console.error("Error uploading profile metadata")
        return false
      }
      const profilePDA = await create(
        uploadResponse.url,
        new PublicKey(selectedUserDomainOption),
        wallet.publicKey!,
        wallet.publicKey!
      )
      console.log("profilePDA", profilePDA)
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
        Profiles
      </Typography>
      <select value={selectedUserDomainOption} onChange={(event) => setSelectedUserDomainOption(event.target.value)}>
        <option value="">Select Domain</option>
        {userDomainAccounts.map((option: any, index: any) => (
          <option key={index} value={option.domainPDA}>
            {option.domainName}
          </option>
        ))}
      </select>
      <Input value={name} onChange={(event) => setName(event.target.value)} fullWidth placeholder="Name" />
      <Input value={bio} onChange={(event) => setBio(event.target.value)} fullWidth placeholder="Bio" />
      <Input
        value={avatarUri}
        onChange={(event) => setAvatarUri(event.target.value)}
        fullWidth
        placeholder="Avatar URI"
      />
      <Button loading={loading} onClick={handleCreateProfile}>
        Create
      </Button>
      <hr className="w-full border-t border-dashed border-gray-500" />
      {profiles.map((profile) => (
        <ProfileCard profile={profile} key={profile.address} />
      ))}
    </div>
  )
}

type ProfileCardProps = {
  profile: Profile
}

export const ProfileCard = ({ profile }: ProfileCardProps) => {
  return (
    <div className="flex flex-col gap-4 rounded-xl border border-gray-500 p-4">
      <div className="flex justify-between gap-4">
        <Typography level="body4" color="secondary">
          Address
        </Typography>
        <Typography className="font-semibold">{profile.address}</Typography>
      </div>
      <div className="flex justify-between gap-4">
        <Typography level="body4" color="secondary">
          Name
        </Typography>
        <Typography className="font-semibold">{profile.screen_name}</Typography>
      </div>
      <div className="flex justify-between gap-4">
        <Typography level="body4" color="secondary">
          Authority
        </Typography>
        <Typography className="font-semibold">{profile.authority}</Typography>
      </div>
      <div className="flex justify-between gap-4">
        <Typography level="body4" color="secondary">
          Metadata URI
        </Typography>
        <Typography className="font-semibold">{profile.metadata_uri}</Typography>
      </div>
      <GumProfileCard data={profile.metadata} />
    </div>
  )
}
