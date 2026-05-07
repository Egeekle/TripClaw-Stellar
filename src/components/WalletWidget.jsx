import { useStellarWallet } from '../hooks/useStellarWallet';

export default function WalletWidget() {
  const { publicKey, connecting, connect, disconnect } = useStellarWallet();

  const short = (addr) => `${addr.slice(0, 4)}...${addr.slice(-4)}`;

  if (publicKey) {
    return (
      <div 
        onClick={disconnect}
        className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-500/10 hover:bg-red-500/10 border border-emerald-500/30 hover:border-red-500/30 rounded-full cursor-pointer transition-colors group shadow-sm"
        title="Click to disconnect"
      >
        <span className="size-1.5 rounded-full bg-emerald-500 animate-pulse group-hover:bg-red-500 group-hover:animate-none"></span>
        <span className="font-mono text-xs font-bold text-emerald-600 dark:text-emerald-400 group-hover:text-red-500 transition-colors">
          {short(publicKey)}
        </span>
      </div>
    );
  }

  return (
    <button
      onClick={connect}
      disabled={connecting}
      className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-500 hover:bg-indigo-600 disabled:bg-slate-500 text-white rounded-full cursor-pointer transition-all shadow-md active:scale-95"
    >
      <span className="material-symbols-outlined text-[14px]">account_balance_wallet</span>
      <span className="text-xs font-bold">
        {connecting ? '...' : 'Connect'}
      </span>
    </button>
  );
}
