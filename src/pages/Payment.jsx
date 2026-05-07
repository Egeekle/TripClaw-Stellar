import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useStellarWallet } from '../hooks/useStellarWallet';
import * as StellarSdk from '@stellar/stellar-sdk';

export default function Payment() {
  const navigate = useNavigate();
  const location = useLocation();
  const { publicKey, connecting, connect, disconnect, sign } = useStellarWallet();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [txHash, setTxHash] = useState(null);
  const [step, setStep] = useState('idle'); // idle, building, signing, submitting, success

  // Get swarm from navigation state or fallback
  const swarm = location.state?.swarm || {
    name: 'Lima Food Hunters',
    type: 'Gastronomy',
    icon: 'ramen_dining',
    members: 4,
    color: 'bg-indigo-600',
    iconColor: 'text-indigo-600'
  };

  const short = (addr) => `${addr.slice(0, 6)}...${addr.slice(-4)}`;

  const handleDeposit = async () => {
    if (!publicKey) return;
    setLoading(true);
    setError(null);
    setTxHash(null);

    try {
      setStep('building');
      const server = new StellarSdk.Horizon.Server('https://horizon-testnet.stellar.org');
      
      let account;
      try {
        account = await server.loadAccount(publicKey);
      } catch (e) {
        // Si la cuenta no existe, fondearla con Friendbot automáticamente
        console.log("Account no encontrada. Fondeando con Friendbot...");
        await fetch(`https://friendbot.stellar.org?addr=${publicKey}`);
        account = await server.loadAccount(publicKey);
      }

      // Crear un Claimable Balance (Actúa como Smart Escrow básico)
      // En este demo, el claimant es el mismo usuario para poder recuperarlo,
      // pero en un flujo real aquí iría la cuenta multi-sig del Swarm.
      const claimant = new StellarSdk.Claimant(publicKey, StellarSdk.Claimant.predicateUnconditional());
      const operation = StellarSdk.Operation.createClaimableBalance({
        asset: StellarSdk.Asset.native(),
        amount: "5.0000000",
        claimants: [claimant]
      });

      const tx = new StellarSdk.TransactionBuilder(account, { fee: StellarSdk.BASE_FEE })
        .addOperation(operation)
        .setTimeout(300) // 5 minutos de validez (Timebounds)
        .setNetworkPassphrase(StellarSdk.Networks.TESTNET)
        .build();

      const txXdr = tx.toXDR();

      setStep('signing');
      // Delegar la firma a la extensión Freighter (a través de nuestro hook)
      const signedXdr = await sign(txXdr);

      setStep('submitting');
      // Enviar a la red de Stellar
      const transactionToSubmit = StellarSdk.TransactionBuilder.fromXDR(signedXdr, StellarSdk.Networks.TESTNET);
      const response = await server.submitTransaction(transactionToSubmit);
      
      setTxHash(response.hash);
      setStep('success');

    } catch (err) {
      console.error('Error procesando pago:', err);
      setError(err instanceof Error ? err.message : 'Error al procesar el depósito en la Testnet.');
      setStep('idle');
    } finally {
      setLoading(false);
    }
  };

  const stepLabel = {
    building: 'Preparando Smart Escrow...',
    signing: 'Esperando firma en Freighter...',
    submitting: 'Enviando a Stellar Testnet...',
    success: 'Spot Reservado ✅'
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-950 to-slate-900 text-white overflow-y-auto w-full absolute inset-0">
      
      {/* Header */}
      <header className="sticky top-0 z-10 px-6 py-4 bg-slate-900/50 backdrop-blur-md border-b border-white/5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate(-1)}
            className="flex size-8 items-center justify-center rounded-lg bg-slate-800 text-slate-300 hover:text-white transition-colors"
          >
            <span className="material-symbols-outlined text-sm">arrow_back</span>
          </button>
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-indigo-400 text-2xl">account_balance_wallet</span>
            <h1 className="text-lg font-bold tracking-tight">Smart Travel Escrow</h1>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-xl mx-auto px-4 py-8 md:py-12">
        <header className="text-center mb-10">
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight mb-3">
            Únete al Swarm 🚀
          </h1>
          <p className="text-slate-400">
            Deposita XLM en un escrow on-chain. Los fondos solo se liberan si el grupo se completa.
          </p>
        </header>

        {/* Wallet Connection */}
        {publicKey ? (
          <div className="flex items-center justify-between p-4 bg-slate-800 rounded-xl mb-8 border border-slate-700">
            <div>
              <span className="text-green-400 text-sm font-medium flex items-center gap-1.5">
                <span className="size-2 rounded-full bg-green-500 animate-pulse"></span>
                Conectado
              </span>
              <p className="font-mono text-sm text-slate-300 mt-1">
                {short(publicKey)}
              </p>
            </div>
            <button
              onClick={disconnect}
              className="text-sm text-slate-400 hover:text-red-400 transition-colors"
            >
              Desconectar
            </button>
          </div>
        ) : (
          <div className="mb-8 text-center p-6 bg-slate-800/50 rounded-xl border border-slate-700">
            <span className="material-symbols-outlined text-4xl text-slate-500 mb-3">lock</span>
            <button
              onClick={connect}
              disabled={connecting}
              className="w-full py-3 px-6 bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-700 disabled:cursor-not-allowed rounded-xl font-semibold transition-colors"
            >
              {connecting ? 'Conectando...' : 'Conectar Freighter Wallet'}
            </button>
            <p className="mt-3 text-slate-500 text-xs">
              Necesitas la extensión Freighter configurada en Testnet.
            </p>
          </div>
        )}

        {/* Swarm Details Card */}
        {publicKey && step !== 'success' && (
          <div className="mb-6 p-6 bg-slate-800/50 rounded-2xl border border-slate-700">
            <h2 className="text-xl font-semibold mb-6 flex items-center justify-between">
              Confirmar Depósito
              <span className="bg-indigo-900/50 text-indigo-300 text-xs px-2 py-1 rounded border border-indigo-500/30">94% Compatible</span>
            </h2>

            {/* Target Swarm */}
            <div className="flex items-center gap-4 mb-6 p-4 bg-slate-700/30 rounded-xl border border-slate-600">
               <div className="size-12 rounded-full bg-indigo-900/50 flex items-center justify-center border border-indigo-500/30 shrink-0">
                  <span className="material-symbols-outlined text-2xl text-indigo-400">{swarm.icon}</span>
               </div>
               <div>
                  <h3 className="font-bold text-lg">{swarm.name}</h3>
                  <p className="text-slate-400 text-sm">{swarm.type} · Faltan {2} miembros</p>
               </div>
            </div>

            <div className="space-y-3 mb-8">
              <div className="flex justify-between text-sm text-slate-400">
                <span>Costo de la actividad</span>
                <span className="text-slate-300">15 XLM</span>
              </div>
              <div className="flex justify-between text-sm text-slate-400">
                <span>Descuento de grupo (Swarm)</span>
                <span className="text-green-400">- 5 XLM</span>
              </div>
              <div className="pt-3 mt-3 border-t border-slate-700 flex justify-between items-center">
                <span className="font-semibold">Monto a bloquear (Escrow)</span>
                <span className="text-xl font-bold text-indigo-400">5.00 XLM</span>
              </div>
            </div>

            <button
              onClick={handleDeposit}
              disabled={loading}
              className="w-full py-3.5 bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-700 disabled:cursor-not-allowed rounded-xl font-bold transition-all"
            >
              {loading && step !== 'idle' ? stepLabel[step] : 'Firmar Depósito Escrow'}
            </button>

            {error && (
              <p className="mt-4 text-red-400 text-sm text-center bg-red-900/20 p-2 rounded border border-red-900">{error}</p>
            )}
          </div>
        )}

        {/* Success State */}
        {publicKey && step === 'success' && (
          <div className="mb-6 p-8 bg-green-900/20 border border-green-700/50 rounded-2xl text-center">
            <div className="size-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4 border border-green-500/30">
              <span className="material-symbols-outlined text-green-400 text-4xl">verified</span>
            </div>
            <h3 className="text-2xl font-bold text-green-400 mb-2">¡Cupo Asegurado!</h3>
            <p className="text-slate-300 mb-6 text-sm">
              Tu depósito de 5 XLM está bloqueado en el contrato inteligente. Esperando a los demás miembros.
            </p>
            {txHash && (
              <div className="bg-black/30 p-3 rounded-lg border border-white/5 font-mono text-xs text-slate-400 mb-6 break-all">
                TX: {txHash}
              </div>
            )}
            <button
              onClick={() => navigate('/map')}
              className="w-full py-3 bg-slate-700 hover:bg-slate-600 rounded-xl font-semibold transition-colors"
            >
              Volver al Mapa
            </button>
          </div>
        )}

        <footer className="mt-8 text-center text-slate-600 text-xs flex items-center justify-center gap-1">
          <span className="material-symbols-outlined text-[14px]">lock</span>
          Smart Contracts by Soroban · Stellar Testnet
        </footer>
      </main>
    </div>
  );
}
