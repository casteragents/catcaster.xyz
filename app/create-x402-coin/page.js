"use client"
import { useState } from 'react'
import { ethers } from 'ethers'
import { getProvider, switchToBaseMainnet } from '../../lib/contracts'
import { useWallet } from '../../components/WalletContext'
import ConnectWallet from '../../components/ConnectWallet'
import { createPublicClient, http, decodeEventLog } from 'viem'
import { base } from 'viem/chains'
import Head from 'next/head'
export default function CreateX402Coin() {
  const { account } = useWallet()
  const [name, setName] = useState('')
  const [ticker, setTicker] = useState('')
  const [file, setFile] = useState(null)
  const [loading, setLoading] = useState(false)
  const [loadingMessage, setLoadingMessage] = useState('')
  const [txHash, setTxHash] = useState(null)
  const [deployed, setDeployed] = useState(false)
  const treasury = '0x170BEC3961C5897B03F44dEa0341Ed7A118b5D53'
  const uploadImageToIpfs = async (imageFile) => {
    try {
      const formData = new FormData()
      formData.append('file', imageFile)
      const response = await fetch('https://api.pinata.cloud/pinning/pinFileToIPFS', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${process.env.NEXT_PUBLIC_PINATA_JWT}`
        },
        body: formData
      })
      if (!response.ok) throw new Error('IPFS upload failed')
      const data = await response.json()
      return `ipfs://${data.IpfsHash}`
    } catch (error) {
      console.error('IPFS upload error:', error)
      return 'ipfs://default_image'
    }
  }
  const uploadMetadataToIpfs = async (metadata) => {
    try {
      const response = await fetch('https://api.pinata.cloud/pinning/pinJSONToIPFS', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${process.env.NEXT_PUBLIC_PINATA_JWT}`
        },
        body: JSON.stringify(metadata)
      })
      if (!response.ok) throw new Error('Metadata upload failed')
      const result = await response.json()
      return `ipfs://${result.IpfsHash}`
    } catch (error) {
      console.error('Metadata upload error:', error)
      return 'ipfs://default_metadata'
    }
  }
  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!account) return alert('Meow! Connect wallet first')
    if (!name || !ticker) return alert('Enter name and ticker')
    setLoading(true)
    setLoadingMessage('x402 coin deploying, please wait...')
    setTxHash(null)
    setDeployed(false)
    try {
      const walletProvider = await getProvider()
      await switchToBaseMainnet()
      let uri = 'ipfs://default_metadata'
      if (file) {
        setLoadingMessage('Uploading image to IPFS...')
        const imageUri = await uploadImageToIpfs(file)
        const metadata = {
          name,
          description: 'A purrfect x402 coin created via catcaster.com',
          image: imageUri,
        }
        setLoadingMessage('Uploading metadata to IPFS...')
        uri = await uploadMetadataToIpfs(metadata)
      }
      const signer = await walletProvider.getSigner()
      setLoadingMessage('Initializing x402 payment settlement...')
      const treasuryTx = await signer.sendTransaction({
        to: treasury,
        value: ethers.parseEther('0.0001')
      })
      await treasuryTx.wait()
      const contract = new ethers.Contract('0x777777751622c0d3258f214F9DF38E35BF45baF3', [
        {
          "inputs": [
            {"internalType": "address", "name": "payoutRecipient", "type": "address"},
            {"internalType": "address[]", "name": "owners", "type": "address[]"},
            {"internalType": "string", "name": "uri", "type": "string"},
            {"internalType": "string", "name": "name", "type": "string"},
            {"internalType": "string", "name": "symbol", "type": "string"},
            {"internalType": "address", "name": "platformReferrer", "type": "address"},
            {"internalType": "address", "name": "currency", "type": "address"},
            {"internalType": "int24", "name": "tickLower", "type": "int24"},
            {"internalType": "uint256", "name": "orderSize", "type": "uint256"}
          ],
          "name": "deploy",
          "outputs": [
            {"internalType": "address", "name": "", "type": "address"},
            {"internalType": "uint256", "name": "", "type": "uint256"}
          ],
          "stateMutability": "payable",
          "type": "function"
        },
        {
          "anonymous": false,
          "inputs": [
            {"indexed": true, "internalType": "address", "name": "caller", "type": "address"},
            {"indexed": true, "internalType": "address", "name": "payoutRecipient", "type": "address"},
            {"indexed": true, "internalType": "address", "name": "platformReferrer", "type": "address"},
            {"indexed": false, "internalType": "address", "name": "currency", "type": "address"},
            {"indexed": false, "internalType": "string", "name": "uri", "type": "string"},
            {"indexed": false, "internalType": "string", "name": "name", "type": "string"},
            {"indexed": false, "internalType": "string", "name": "symbol", "type": "string"},
            {"indexed": false, "internalType": "address", "name": "coin", "type": "address"},
            {"indexed": false, "internalType": "address", "name": "pool", "type": "address"},
            {"indexed": false, "internalType": "string", "name": "version", "type": "string"}
          ],
          "name": "CoinCreated",
          "type": "event"
        }
      ], signer)
      setLoadingMessage('Deploying x402 coin...')
      const tx = await contract.deploy(
        ethers.getAddress(account),
        [ethers.getAddress(account)],
        uri,
        name,
        ticker.toUpperCase(),
        '0xD9f6D8Bfc6ee61954E60AA29896C871DFcC4B204',
        '0x4200000000000000000000000000000000000006',
        -199200,
        0n,
        { value: 0n }
      )
      setTxHash(tx.hash)
      setLoadingMessage('Waiting for deployment confirmation...')
      await tx.wait()
      setDeployed(true)
    } catch (error) {
      console.error('Deployment error:', error)
      let alertMessage = 'Meow! Error deploying x402 coin: ' + (error.message || 'Unknown error');
      if (error.message && error.message.toLowerCase().includes('insufficient')) {
        alertMessage = 'Meow! Insufficient balance for x402 coin deployment. Please ensure you have at least 0.0001 ETH (plus gas fees) in your wallet and try again.';
      }
      alert(alertMessage)
    } finally {
      setLoading(false)
      setLoadingMessage('')
    }
  }
  return (
    <>
      <Head>
        <meta name="fc:miniapp" content={JSON.stringify({
          version: "1",
          imageUrl: "https://castercat.com/og.png",
          button: {
            title: "Create X402 Coin",
            action: {
              type: "launch_miniapp",
              url: "https://castercat.com/create-x402-coin"
            }
          }
        })} />
        <meta name="fc:frame" content={JSON.stringify({
          version: "1",
          imageUrl: "https://castercat.com/og.png",
          button: {
            title: "Create X402 Coin",
            action: {
              type: "launch_frame",
              url: "https://castercat.com/create-x402-coin"
            }
          }
        })} />
      </Head>
      <div className="container mx-auto p-4">
        <div className="max-w-4xl mx-auto bg-card p-6 rounded-md shadow">
          <h1 className="text-3xl md:text-4xl font-bold text-primary mb-6 text-center">Create X402 Coin</h1>
          <p className="mb-6 text-text text-center">All coins are automatically listed in Coinbase Dex and get free 1,000,000 of the supply as the creator plus 9,999 $base score per deployment.</p>
          <div className="flex justify-center mb-6">
            <ConnectWallet />
          </div>
          <form onSubmit={handleSubmit} className="space-y-4">
            <input type="text" placeholder="Name*" value={name} onChange={e => setName(e.target.value)} className="block w-full p-3 bg-gray-800 text-text border border-border rounded" required />
            <input type="text" placeholder="Ticker*" value={ticker} onChange={e => setTicker(e.target.value)} className="block w-full p-3 bg-gray-800 text-text border border-border rounded" required />
            <input type="file" onChange={e => setFile(e.target.files[0])} className="block w-full p-3 bg-gray-800 text-text border border-border rounded" accept="image/*" />
            <button type="submit" disabled={loading || !account} className="bg-gradient-purple text-white px-6 py-3 rounded hover:opacity-90 transition w-full">
              {loading ? 'Deploying...' : 'Deploy X402 Coin (0.0001 ΞTH)'}
            </button>
          </form>
          {loading && <p className="text-center mt-4 text-primary">{loadingMessage}</p>}
          {deployed && txHash && (
            <div className="mt-4 flex justify-center">
              <div className="bg-gradient-purple text-white px-6 py-3 rounded-full">
                <p className="text-center">
                  Meow! X402 coin deployed successfully so we gave you 9,999 $base score and 1,000,000 of {name}. View transaction on <a href={`https://basescan.org/tx/${txHash}`} target="_blank" rel="noopener noreferrer" className="text-blue-400 underline decoration-black">Basescan</a> to see your coin details, buying it will make the chart visible in open markets.
                </p>
              </div>
            </div>
          )}
        </div>
        {/* Token Contract Address Section */}
        <div className="mt-8 mb-6">
          <h2 className="text-xl font-bold text-white mb-4 text-center">$CAT (Caster Agents Token) Contract Address</h2>
          <div className="flex items-center justify-center bg-background p-3 rounded border border-border">
            <img src="/logo.jpg" alt="$CAT Logo" className="w-8 h-8 mr-2" />
            <input
              type="text"
              value="0x7a4aAF79C1D686BdCCDdfCb5313f7ED1e37b97e2"
              readOnly
              className="flex-1 bg-transparent text-text"
            />
            <button
              onClick={() => navigator.clipboard.writeText('0x7a4aAF79C1D686BdCCDdfCb5313f7ED1e37b97e2')}
              className="ml-2 px-3 py-1 bg-accent text-background rounded hover:opacity-90 transition"
            >
              Copy
            </button>
          </div>
        </div>
        {/* Claim Airdrops Section */}
        <div className="mt-8 mb-6">
          <h2 className="text-xl font-bold text-white mb-4 text-center">AI Agents $CAT Airdrop and $BASE Score (Ask AI How)</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <a href="https://farcaster.xyz/~/compose?text=Meooooow!%20Claim%2099%20$cat%20and%20999%20$base%20score%20daily%20airdrop,%20follow%20@casteragents%20and%20join%20/caster%20to%20be%20eligible.%F0%9F%90%BE%F0%9F%90%88&embeds[]=https://catcaster.com" target="_blank" rel="noopener noreferrer" className="flex items-center bg-background p-3 rounded border border-border text-accent hover:bg-accent hover:text-background transition">
              @casteragents
              <span className="ml-auto">→</span>
            </a>
            <a href="https://farcaster.xyz/~/compose?text=Meooooow!%20Claim%20150%20$cat%20and%201,500%20$base%20score%20daily%20airdrop,%20follow%20@tapcaster%20and%20join%20/caster%20to%20be%20eligible.%20(read%20bio%20for%20more%20instructions)%F0%9F%90%BE%F0%9F%90%88&embeds[]=https://catcaster.com" target="_blank" rel="noopener noreferrer" className="flex items-center bg-background p-3 rounded border border-border text-accent hover:bg-accent hover:text-background transition">
              @tapcaster
              <span className="ml-auto">→</span>
            </a>
            <a href="https://farcaster.xyz/~/compose?text=Meooooow!%20Claim%20300%20$cat%20and%203,000%20$base%20score%20daily%20airdrop,%20follow%20@casterapp%20and%20join%20/caster%20to%20be%20eligible.%20(read%20bio%20for%20more%20instructions)%F0%9F%90%BE%F0%9F%90%88&embeds[]=https://catcaster.com" target="_blank" rel="noopener noreferrer" className="flex items-center bg-background p-3 rounded border border-border text-accent hover:bg-accent hover:text-background transition">
              @casterapp
              <span className="ml-auto">→</span>
            </a>
            <a href="https://farcaster.xyz/~/compose?text=Meooooow!%20Claim%20600%20$cat%20and%206,000%20$base%20score%20daily%20airdrop,%20follow%20@casterai%20and%20join%20/caster%20to%20be%20eligible.%20(read%20bio%20for%20more%20instructions)%F0%9F%90%BE%F0%9F%90%88&embeds[]=https://catcaster.com" target="_blank" rel="noopener noreferrer" className="flex items-center bg-background p-3 rounded border border-border text-accent hover:bg-accent hover:text-background transition">
              @casterai
              <span className="ml-auto">→</span>
            </a>
          </div>
        </div>
        {/* Social Links Section with Header */}
        <div className="mt-8 mb-6">
          <h2 className="text-xl font-bold text-white mb-4 text-center">Socials and Documentations</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            <a href="https://catcaster.com" target="_blank" rel="noopener noreferrer" className="flex items-center bg-background p-3 rounded border border-border text-accent hover:bg-accent hover:text-background transition">
              <img src="/website-icon.png" alt="Website" className="w-6 h-6 mr-2" /> {/* Add icons in public/ */}
              Website
              <span className="ml-auto">→</span>
            </a>
            <a href="https://x.com/casteragentsx" target="_blank" rel="noopener noreferrer" className="flex items-center bg-background p-3 rounded border border-border text-accent hover:bg-accent hover:text-background transition">
              <img src="/twitter-icon.png" alt="X" className="w-6 h-6 mr-2" />
              X (Twitter)
              <span className="ml-auto">→</span>
            </a>
            <a href="https://farcaster.xyz/casteragents" target="_blank" rel="noopener noreferrer" className="flex items-center bg-background p-3 rounded border border-border text-accent hover:bg-accent hover:text-background transition">
              <img src="/farcaster-icon.png" alt="Farcaster" className="w-6 h-6 mr-2" />
              Caster
              <span className="ml-auto">→</span>
            </a>
            <a href="https://tiktok.com/@casteragent" target="_blank" rel="noopener noreferrer" className="flex items-center bg-background p-3 rounded border border-border text-accent hover:bg-accent hover:text-background transition">
              <img src="/tiktok-icon.png" alt="TikTok" className="w-6 h-6 mr-2" />
              TikTok
              <span className="ml-auto">→</span>
            </a>
            <a href="https://github.com/casteragents" target="_blank" rel="noopener noreferrer" className="flex items-center bg-background p-3 rounded border border-border text-accent hover:bg-accent hover:text-background transition">
              <img src="/github-icon.png" alt="Github" className="w-6 h-6 mr-2" />
              Github
              <span className="ml-auto">→</span>
            </a>
            <a href="https://t.me/casteragentsdiscussion" target="_blank" rel="noopener noreferrer" className="flex items-center bg-background p-3 rounded border border-border text-accent hover:bg-accent hover:text-background transition">
              <img src="/telegram-icon.png" alt="Telegram" className="w-6 h-6 mr-2" />
              Telegram
              <span className="ml-auto">→</span>
            </a>
          </div>
        </div>
        {/* Email Button */}
        <div className="flex justify-center mt-4">
          <a href="mailto:casteragents@gmail.com?subject=Meow! Inquiry&body=Your message here" className="flex items-center bg-accent text-background px-6 py-3 rounded hover:opacity-90 transition">
            <img src="/email-icon.png" alt="Email" className="w-5 h-5 mr-2" /> {/* Add mini email icon in public/ */}
            Meow! send us email!
          </a>
        </div>
      </div>
      {/* Footer - Added at bottom */}
      <footer className="bg-background text-text text-center py-4 mt-8">
        © 2025 Caster Intelligence. All rights reserved.
      </footer>
    </>
  )
}