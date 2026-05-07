import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useStellarWallet } from '../hooks/useStellarWallet';
import { xpService } from '../services/xpService';
import * as StellarSdk from '@stellar/stellar-sdk';

export default function Payment() {
  const navigate = useNavigate();
  const location = useLocation();
  const { publicKey, connecting, connect, disconnect, sign } = useStellarWallet();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [txHash, setTxHash] = useState(null);
  const [step, setStep] = useState('idle'); // idle, building, signing, submitting, success
  const [levelUpData, setLevelUpData] = useState(null);

  // Get swarm from navigation state or fallback
  const swarm = location.state?.swarm || {
    name: 'Camino Inca Secreto',
    type: 'Adventure',
    guide: 'Pachacutec Tours',
    price: 45
  };

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
        console.log("Account no encontrada. Fondeando con Friendbot...");
        await fetch(`https://friendbot.stellar.org?addr=${publicKey}`);
        account = await server.loadAccount(publicKey);
      }

      // Crear un Claimable Balance
      const claimant = new StellarSdk.Claimant(publicKey, StellarSdk.Claimant.predicateUnconditional());
      const operation = StellarSdk.Operation.createClaimableBalance({
        asset: StellarSdk.Asset.native(),
        amount: swarm.price.toString(),
        claimants: [claimant]
      });

      const tx = new StellarSdk.TransactionBuilder(account, { fee: StellarSdk.BASE_FEE })
        .addOperation(operation)
        .setTimeout(300)
        .setNetworkPassphrase(StellarSdk.Networks.TESTNET)
        .build();

      const txXdr = tx.toXDR();

      setStep('signing');
      const signedXdr = await sign(txXdr);

      setStep('submitting');
      const transactionToSubmit = StellarSdk.TransactionBuilder.fromXDR(signedXdr, StellarSdk.Networks.TESTNET);
      const response = await server.submitTransaction(transactionToSubmit);
      
      setTxHash(response.hash);
      setStep('success');

      // Grant XP for payment
      const xpResult = xpService.grantXp('mission_complete');
      if (xpResult && xpResult.leveledUp) {
        setLevelUpData(xpResult);
      }

    } catch (err) {
      console.error('Error procesando pago:', err);
      setError(err instanceof Error ? err.message : 'Error al procesar el depósito en la Testnet.');
      setStep('idle');
    } finally {
      setLoading(false);
    }
  };

  const stepLabel = {
    building: 'Preparando Escrow...',
    signing: 'Firma en Freighter...',
    submitting: 'Enviando a Stellar...',
    success: 'Reserva Confirmada'
  };

  return (
    <div className="min-h-screen bg-background-light dark:bg-background-dark text-slate-900 dark:text-white p-6 flex flex-col font-display">
      {/* Header */}
      <div className="flex items-center justify-between mb-8 max-w-md mx-auto w-full pt-4">
        <button onClick={() => navigate(-1)} className="text-violet-600 dark:text-violet-400 font-medium flex items-center gap-1">
          <span className="material-symbols-outlined text-sm">arrow_back</span>
          Volver
        </button>
        <h2 className="text-lg font-bold">Confirmar Reserva</h2>
        <div className="w-16" />
      </div>

      {/* Content */}
      <div className="flex-1 max-w-md mx-auto w-full flex flex-col">
        {!publicKey ? (
          <div className="flex-1 flex flex-col items-center justify-center animate-in fade-in zoom-in-95 duration-500">
            <div className="w-24 h-24 rounded-full bg-violet-500/10 flex items-center justify-center mb-6">
              <span className="material-symbols-outlined text-violet-500 text-5xl">lock</span>
            </div>
            <h3 className="text-2xl font-bold mb-2">Conectar Wallet</h3>
            <p className="text-slate-500 text-center mb-8">
              TripClaw utiliza contratos inteligentes en Stellar para garantizar la seguridad de tus fondos.
            </p>
            <button
              onClick={connect}
              disabled={connecting}
              className="w-full h-14 bg-violet-600 hover:bg-violet-500 disabled:bg-slate-700 disabled:cursor-not-allowed rounded-xl font-bold text-white transition-colors flex items-center justify-center gap-2 shadow-lg shadow-violet-500/20"
            >
              <span className="material-symbols-outlined">account_balance_wallet</span>
              {connecting ? 'Conectando Freighter...' : 'Conectar Freighter'}
            </button>
          </div>
        ) : step !== 'success' ? (
          <div className="flex flex-col h-full animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Experience Summary */}
            <div className="bg-white dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-2xl p-6 mb-6 shadow-sm">
              <h3 className="text-xl font-bold mb-1">{swarm.name}</h3>
              <p className="text-slate-500 text-sm mb-6">con {swarm.guide || 'Swarm Guide'}</p>

              <div className="flex items-baseline gap-2 mb-6">
                <span className="text-4xl font-black text-violet-600 dark:text-violet-400">{swarm.price}</span>
                <span className="text-slate-500 font-bold">XLM</span>
              </div>

              <div className="space-y-3 text-sm">
                <div className="flex justify-between text-slate-600 dark:text-slate-400">
                  <span>Subtotal</span>
                  <span className="font-medium text-slate-900 dark:text-white">{swarm.price}.00 XLM</span>
                </div>
                <div className="flex justify-between text-slate-600 dark:text-slate-400">
                  <span>Comisión TripClaw</span>
                  <span className="font-medium text-slate-900 dark:text-white">0.00 XLM</span>
                </div>
                <div className="border-t border-slate-200 dark:border-slate-700 pt-3 flex justify-between font-bold text-base mt-2">
                  <span>Total</span>
                  <span className="text-violet-600 dark:text-violet-400">{swarm.price}.00 XLM</span>
                </div>
              </div>
            </div>

            {/* Stellar Features */}
            <div className="space-y-4 mb-8">
              <div className="flex items-start gap-4 p-3 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                <div className="size-10 rounded-full bg-violet-500/10 flex items-center justify-center shrink-0">
                  <span className="material-symbols-outlined text-violet-500">security</span>
                </div>
                <div>
                  <p className="text-sm font-bold mb-0.5">Escrow Automático</p>
                  <p className="text-xs text-slate-500 leading-relaxed">
                    El dinero se retiene en el contrato inteligente hasta que valides tu asistencia.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4 p-3 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                <div className="size-10 rounded-full bg-emerald-500/10 flex items-center justify-center shrink-0">
                  <span className="material-symbols-outlined text-emerald-500">bolt</span>
                </div>
                <div>
                  <p className="text-sm font-bold mb-0.5">Pago Instantáneo</p>
                  <p className="text-xs text-slate-500 leading-relaxed">
                    Transacción inmutable en Stellar Network en menos de 5 segundos.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4 p-3 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                <div className="size-10 rounded-full bg-fuchsia-500/10 flex items-center justify-center shrink-0">
                  <span className="material-symbols-outlined text-fuchsia-500">qr_code</span>
                </div>
                <div>
                  <p className="text-sm font-bold mb-0.5">Liberación Segura</p>
                  <p className="text-xs text-slate-500 leading-relaxed">
                    El guía recibe el pago solo tras verificar tu Check-In digital.
                  </p>
                </div>
              </div>
            </div>

            {error && (
              <div className="mb-4 p-3 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center gap-2 text-red-500 text-xs font-medium">
                <span className="material-symbols-outlined text-sm">error</span>
                {error}
              </div>
            )}

            {/* Payment Button */}
            <div className="mt-auto">
              <button
                onClick={handleDeposit}
                disabled={loading}
                className="w-full h-14 bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white rounded-xl font-bold hover:opacity-90 transition-all disabled:opacity-50 disabled:grayscale flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(139,92,246,0.3)] active:scale-95"
              >
                {loading && step !== 'idle' ? (
                  <>
                    <span className="material-symbols-outlined animate-spin text-lg">progress_activity</span>
                    <span>{stepLabel[step]}</span>
                  </>
                ) : (
                  <>
                    <span>Pagar {swarm.price} XLM con Stellar</span>
                  </>
                )}
              </button>
              <p className="text-xs text-center text-slate-500 font-medium mt-4 pb-2">
                Sin claves privadas. Sin complicaciones. Solo reserva.
              </p>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-full animate-in zoom-in-95 duration-500">
            <div className="w-24 h-24 rounded-full bg-emerald-500/20 flex items-center justify-center mb-6 border border-emerald-500/30">
              <span className="material-symbols-outlined text-emerald-500 text-5xl">check_circle</span>
            </div>

            <h3 className="text-3xl font-black mb-2 text-center tracking-tight">¡Reserva Confirmada!</h3>
            <p className="text-slate-500 text-center mb-8 px-4 leading-relaxed">
              Tu pago está seguro en el contrato de escrow. El guía recibirá el XLM tras tu check-in.
            </p>

            <div className="bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-2xl p-5 w-full text-center shadow-lg mb-8 relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-violet-500/5 to-fuchsia-500/5 pointer-events-none"></div>
              <p className="text-sm font-bold text-slate-600 dark:text-slate-300 mb-2">
                ¡Misión Completada!
              </p>
              <div className="flex items-center justify-center gap-2">
                <span className="text-violet-600 dark:text-violet-400 text-2xl font-black">+150 XP</span>
                <span className="text-2xl animate-bounce">🏔️</span>
              </div>
              {levelUpData && (
                <div className="mt-3 inline-block px-3 py-1 bg-fuchsia-500/10 text-fuchsia-500 border border-fuchsia-500/20 rounded-full text-xs font-bold uppercase tracking-wider">
                  Level Up! You are now {levelUpData.rank.name}
                </div>
              )}
            </div>

            <button
              onClick={() => navigate('/passport')}
              className="w-full h-14 bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 rounded-xl font-bold hover:opacity-90 transition-opacity"
            >
              Ver Mi Pasaporte
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
