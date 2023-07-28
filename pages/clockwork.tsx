import ConnectWalletButton from "@/components/connect-wallet-button"
import { Button } from "@/components/ui/button"
import { ClockworkProvider, PAYER_PUBKEY } from "@clockwork-xyz/sdk"
import { useAnchorWallet, useConnection, useWallet } from "@solana/wallet-adapter-react"
import { Keypair, LAMPORTS_PER_SOL, SystemProgram, Transaction } from "@solana/web3.js"

export default function HomePage() {
  const { connected, publicKey } = useWallet()
  const wallet = useAnchorWallet()
  const { connection } = useConnection()

  const createThread = async () => {
    console.log(wallet)
    // @ts-ignore
    const clockworkProvider = new ClockworkProvider(wallet, connection)

    const threadId = "sol_transferjs" + new Date().getTime()
    const [threadAddress] = clockworkProvider.getThreadPDA(
      publicKey!, // authority
      threadId
    )

    const recipient = Keypair.generate()
    console.log("recipient: ", recipient.publicKey.toBase58())

    let balance = (await connection.getBalance(recipient.publicKey)) / LAMPORTS_PER_SOL
    console.log(`✅ recipient balance: ${balance} SOL\n`)

    const transferIx = SystemProgram.transfer({
      fromPubkey: PAYER_PUBKEY,
      toPubkey: recipient.publicKey,
      lamports: LAMPORTS_PER_SOL / 100,
    })

    const trigger = {
      cron: {
        schedule: "*/5 * * * * * *",
        skippable: true,
      },
    }

    const ix = await clockworkProvider.threadCreate(
      publicKey!, // authority
      threadId, // id
      [transferIx], // instructions
      trigger, // trigger
      LAMPORTS_PER_SOL / 10
    )

    const tx = new Transaction().add(ix)
    tx.feePayer = publicKey!

    const signature = await clockworkProvider.anchorProvider.sendAndConfirm(tx)
    console.log(`🗺️  explorer: https://app.clockwork.xyz/threads/${threadAddress}?cluster=devnet`)
    await new Promise((resolve) => setTimeout(resolve, 5 * 1000))

    balance = (await connection.getBalance(recipient.publicKey)) / LAMPORTS_PER_SOL
    console.log(`✅ recipient balance: ${balance} SOL\n`)

    await new Promise((resolve) => setTimeout(resolve, 5 * 1000))
    balance = (await connection.getBalance(recipient.publicKey)) / LAMPORTS_PER_SOL
    console.log(`✅ recipient balance: ${balance} SOL\n`)

    await new Promise((resolve) => setTimeout(resolve, 5 * 1000))
    balance = (await connection.getBalance(recipient.publicKey)) / LAMPORTS_PER_SOL
    console.log(`✅ recipient balance: ${balance} SOL\n`)

    await new Promise((resolve) => setTimeout(resolve, 5 * 1000))
    balance = (await connection.getBalance(recipient.publicKey)) / LAMPORTS_PER_SOL
    console.log(`✅ recipient balance: ${balance} SOL\n`)
  }

  if (!connected)
    return (
      <div className="flex h-full w-full items-center justify-center">
        <ConnectWalletButton />
      </div>
    )

  return (
    <div className="flex flex-col gap-6">
      <Button onClick={createThread}>Create</Button>
    </div>
  )
}
