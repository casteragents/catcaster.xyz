"use client"
import { useState, useEffect } from 'react'
import { usePathname } from 'next/navigation'
import './globals.css'
import ConnectWallet from '../components/ConnectWallet'
import { sdk } from '@farcaster/miniapp-sdk'
import { WalletProvider } from '../components/WalletContext'
export default function ClientLayout({ children }) {
  const pathname = usePathname();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };
  useEffect(() => {
    sdk.actions.ready().catch(console.error);
  }, []);
  return (
    <WalletProvider>
      <div className="flex min-h-screen bg-background text-text">
        <aside className="w-64 bg-card border-r border-border p-4 hidden md:block">
          <nav className="space-y-2">
            <a href="/" className="block p-2 rounded hover:opacity-90 transition bg-gradient-purple text-white font-bold">CatGPT</a>
            <a href="/create-x402-coin" className="block p-2 rounded hover:opacity-90 transition bg-gradient-purple text-white font-bold">Create X402 Coin</a>
          </nav>
        </aside>
        <main className="flex-1">
          <header className="flex justify-center items-center p-4 border-b border-border relative">
            <button onClick={toggleMenu} className="absolute left-4 top-1/2 transform -translate-y-1/2 md:hidden flex flex-col justify-center items-center gap-1">
              <div className="w-6 h-0.5 bg-primary"></div>
              <div className="w-6 h-0.5 bg-primary"></div>
              <div className="w-6 h-0.5 bg-primary"></div>
            </button>
            <div className="flex items-center gap-2 flex-1 justify-center md:justify-between max-w-7xl mx-auto">
              <div className="flex items-center gap-2">
                <img src="/logo.jpg" alt="Logo" className="logo w-10 h-10" />
                <h1 className="text-2xl font-bold text-primary">Catcaster</h1>
              </div>
              {pathname === '/create-x402-coin' && <ConnectWallet />}
            </div>
          </header>
          {children}
        </main>
        <div className={`fixed inset-0 bg-card z-50 transform ${isMenuOpen ? 'translate-x-0' : '-translate-x-full'} transition-transform duration-300 ease-in-out md:hidden overflow-y-auto`}>
          <button onClick={toggleMenu} className="absolute top-4 right-4 text-3xl text-text">&times;</button>
          <nav className="space-y-2 p-4 mt-12">
            <a href="/" className="block p-2 rounded hover:opacity-90 transition bg-gradient-purple text-white font-bold" onClick={toggleMenu}>CatGPT</a>
            <a href="/create-x402-coin" className="block p-2 rounded hover:opacity-90 transition bg-gradient-purple text-white font-bold" onClick={toggleMenu}>Create X402 Coin</a>
          </nav>
        </div>
      </div>
    </WalletProvider>
  );
