import { useWallet } from "@solana/wallet-adapter-react"
import { Typography } from "./ui/typography"
import { Input } from "./ui/input"
import { Button } from "./ui/button"
import { useState } from "react"
import { GUM_TLD_ACCOUNT, GumNameService, useGumContext } from "@gumhq/react-sdk"
import { Nameservice } from "@/types"

type CreateDomainFormProps = {
  nameServices?: Nameservice[]
  onSuccess?: VoidFunction
}

export function CreateDomainForm({ nameServices = [], onSuccess }: CreateDomainFormProps) {
  const { publicKey } = useWallet()
  const { sdk } = useGumContext()

  const [name, setName] = useState("")
  const [loading, setLoading] = useState(false)

  const handleCreateDomainName = async () => {
    try {
      setLoading(true)
      const nameservice = new GumNameService(sdk)

      const gumTld = GUM_TLD_ACCOUNT

      const screenName = await nameservice.getOrCreateDomain(gumTld, name, publicKey!)
      console.log(`screenName: ${screenName}`)
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
        Domains
      </Typography>
      <Input
        value={name}
        onChange={(event) => setName(event.target.value)}
        fullWidth
        placeholder="Domain name"
        className=""
      />
      <Button loading={loading} onClick={handleCreateDomainName}>
        Create
      </Button>
      <hr className="w-full border-t border-dashed border-gray-500" />
      {nameServices.map((item) => (
        <DomainCard domain={item} key={item.address} />
      ))}
    </div>
  )
}

type DomainCardProps = {
  domain: Nameservice
}

export const DomainCard = ({ domain }: DomainCardProps) => {
  return (
    <div className="flex flex-col gap-4 rounded-xl border border-gray-500 p-4">
      <div className="flex justify-between gap-4">
        <Typography level="body4" color="secondary">
          Address
        </Typography>
        <Typography className="font-semibold">{domain.address}</Typography>
      </div>
      <div className="flex justify-between gap-4">
        <Typography level="body4" color="secondary">
          Name
        </Typography>
        <Typography className="font-semibold">{domain.name}</Typography>
      </div>
      <div className="flex justify-between gap-4">
        <Typography level="body4" color="secondary">
          Authority
        </Typography>
        <Typography className="font-semibold">{domain.authority}</Typography>
      </div>
      <div className="flex justify-between gap-4">
        <Typography level="body4" color="secondary">
          Domain
        </Typography>
        <Typography className="font-semibold">{domain.domain}</Typography>
      </div>
    </div>
  )
}
