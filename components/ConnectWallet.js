"use client"
import { useState, useEffect } from 'react'
import { getProvider, switchToBaseMainnet } from '../lib/contracts'
import { useWallet } from './WalletContext'
import { sdk } from '@farcaster/miniapp-sdk'
export default function ConnectWallet() {
  const { account, setAccount } = useWallet();
  const [loading, setLoading] = useState(false);
  useEffect(() => {
    const checkConnection = async () => {
      try {
        const provider = await getProvider();
        const accounts = await provider.listAccounts();
        if (accounts.length > 0 && typeof accounts[0] === 'string') {
          setAccount(accounts[0]);
        }
      } catch (error) {
        console.error('Check connection error:', error);
      }
    };
    checkConnection();
    const handleAccountsChanged = (accounts) => {
      if (accounts.length > 0 && typeof accounts[0] === 'string') {
        setAccount(accounts[0]);
      } else {
        setAccount(null);
      }
    };
    if (window.ethereum) {
      window.ethereum.on('accountsChanged', handleAccountsChanged);
    }
    return () => {
      if (window.ethereum) {
        window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
      }
    };
  }, []);
  const connect = async () => {
    setLoading(true);
    try {
      const provider = await getProvider();
      const signer = await provider.getSigner();
      const acc = await signer.getAddress();
      await switchToBaseMainnet();
      setAccount(acc);
    } catch (error) {
      console.error('Connection error:', error);
      alert('Meow! Error connecting: ' + error.message + '. Switch to Base if needed.');
    } finally {
      setLoading(false);
    }
  };
  const disconnect = () => {
    setAccount(null);
  };
  return (
    <div>
      {loading ? (
        <button className="bg-gradient-purple text-white px-4 py-2 rounded hover:opacity-90 transition text-sm md:text-base">
          Connecting...
        </button>
      ) : account && typeof account === 'string' ? (
        <button onClick={disconnect} className="bg-red-500 text-white px-4 py-2 rounded hover:opacity-90 transition text-sm md:text-base max-w-40 truncate">
          Disconnect
        </button>
      ) : (
        <button onClick={connect} className="bg-gradient-purple text-white px-4 py-2 rounded hover:opacity-90 transition text-sm md:text-base">
          Connect Wallet
        </button>
      )}
    </div>
  );
}