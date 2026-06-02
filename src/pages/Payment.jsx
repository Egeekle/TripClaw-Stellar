import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useStellarWallet } from '../hooks/useStellarWallet';
import { useAuth } from '../hooks/useAuth';
import { xpService } from '../services/xpService';
import { syncMissionAndProgression } from '../services/identityApi';
import * as StellarSdk from '@stellar/stellar-sdk';
import PageHeader from '../components/PageHeader';
import BottomNav from '../components/BottomNav';

export default function Payment() {
  const navigate = useNavigate();
  const location = useLocation();
  const { publicKey, connecting, connect, disconnect, sign } = useStellarWallet();
  const { user: profile } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [txHash, setTxHash] = useState(null);
  const [step, setStep] = useState('idle'); // idle, building, signing, submitting, success
  const [levelUpData, setLevelUpData] = useState(null);

  // Get swarm from navigation state or fallback
  const swarm = location.state?.swarm || {
    name: 'Camino Inca Secreto',
    type: 'Adventure',
    guide: 'Guía del Enjambre',
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
        console.log("Cuenta no encontrada. Fondeando con Friendbot...");
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

      // Sync mission completion and city progress to Supabase
      if (profile && profile.id) {
        syncMissionAndProgression(profile.id, swarm.city || 'Cusco', swarm.name);
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
    <div className="min-h-screen bg-background-light dark:bg-background-dark text-slate-900 dark:text-white pb-24 md:pb-6 flex flex-col font-display transition-colors">
      {/* Header */}
      <PageHeader 
        title="Confirmar Reserva" 
        subtitle="Pagos"
        showBack={true}
      />

      {/* Content */}
      <main className="flex-1 max-w-md mx-auto w-full flex flex-col p-6">
        {!publicKey ? (
          <div className="flex-1 flex flex-col items-center justify-center animate-in fade-in zoom-in-95 duration-500">
            <div className="w-24 h-24 rounded-full bg-primary/10 flex items-center justify-center mb-6">
              <span className="material-symbols-outlined text-primary text-5xl">lock</span>
            </div>
            <h3 className="text-2xl font-black mb-2">Conectar Wallet</h3>
            <p className="text-slate-500 dark:text-slate-400 text-center text-sm leading-relaxed mb-8">
              Aquisito utiliza contratos inteligentes en Stellar para garantizar la seguridad de tus fondos y depósitos escrow.
            </p>
            <button
              onClick={connect}
              disabled={connecting}
              className="w-full h-14 bg-primary hover:bg-primary/95 disabled:bg-slate-700 disabled:cursor-not-allowed rounded-xl font-bold text-white transition-colors flex items-center justify-center gap-2 shadow-lg shadow-primary/20"
            >
              <span className="material-symbols-outlined">account_balance_wallet</span>
              {connecting ? 'Conectando Freighter...' : 'Conectar Freighter'}
            </button>
          </div>
        ) : step !== 'success' ? (
          <div className="flex flex-col h-full animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Experience Summary */}
            <div className="bg-white dark:bg-[#2b2724] border border-slate-200 dark:border-slate-800 rounded-3xl p-6 mb-6 shadow-md">
              <h3 className="text-xl font-black text-slate-900 dark:text-white mb-1 leading-tight">{swarm.name}</h3>
              <p className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-6">con {swarm.guide || 'Guía Aquisito'}</p>

              <div className="flex items-baseline gap-2 mb-6">
                <span className="text-4xl font-black text-primary">{swarm.price}</span>
                <span className="text-slate-500 font-bold text-lg">XLM</span>
              </div>

              <div className="space-y-3 text-sm border-t border-slate-100 dark:border-slate-800 pt-4">
                <div className="flex justify-between text-slate-600 dark:text-slate-400">
                  <span>Subtotal</span>
                  <span className="font-semibold text-slate-900 dark:text-white">{swarm.price}.00 XLM</span>
                </div>
                <div className="flex justify-between text-slate-600 dark:text-slate-400">
                  <span>Comisión Aquisito</span>
                  <span className="font-semibold text-slate-900 dark:text-white">0.00 XLM</span>
                </div>
                <div className="border-t border-slate-100 dark:border-slate-800 pt-3 flex justify-between font-black text-base mt-2">
                  <span>Total</span>
                  <span className="text-primary">{swarm.price}.00 XLM</span>
                </div>
              </div>
            </div>

            {/* Stellar Features */}
            <div className="space-y-4 mb-8">
              <div className="flex items-start gap-4 p-3 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                <div className="size-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                  <span className="material-symbols-outlined text-primary">security</span>
                </div>
                <div>
                  <p className="text-sm font-bold text-slate-800 dark:text-slate-200 mb-0.5">Escrow Automático</p>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    El dinero se retiene en el contrato inteligente hasta que valides tu asistencia localmente.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4 p-3 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                <div className="size-10 rounded-full bg-[#3fa774]/10 flex items-center justify-center shrink-0">
                  <span className="material-symbols-outlined text-[#3fa774]">bolt</span>
                </div>
                <div>
                  <p className="text-sm font-bold text-slate-800 dark:text-slate-200 mb-0.5">Pago Instantáneo</p>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    Transacción inmutable y segura en Stellar Network en menos de 5 segundos.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4 p-3 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                <div className="size-10 rounded-full bg-accent/10 flex items-center justify-center shrink-0">
                  <span className="material-symbols-outlined text-accent">qr_code</span>
                </div>
                <div>
                  <p className="text-sm font-bold text-slate-800 dark:text-slate-200 mb-0.5">Liberación por Check-In</p>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    El enjambre recibe el pago solo tras verificar tu código de asistencia local.
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
                className="w-full h-14 bg-gradient-primary text-white rounded-xl font-bold hover:opacity-90 transition-all disabled:opacity-50 disabled:grayscale flex items-center justify-center gap-2 shadow-lg shadow-primary/20 active:scale-95"
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
              <p className="text-xs text-center text-slate-400 font-medium mt-4 pb-2">
                Sin claves privadas. Sin intermediarios. Pago directo.
              </p>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-full animate-in zoom-in-95 duration-500 py-8">
            <div className="w-24 h-24 rounded-full bg-success/20 flex items-center justify-center mb-6 border border-success/30">
              <span className="material-symbols-outlined text-success text-5xl">check_circle</span>
            </div>

            <h3 className="text-3xl font-black mb-2 text-center tracking-tight text-slate-900 dark:text-white">¡Reserva Confirmada!</h3>
            <p className="text-slate-500 dark:text-slate-400 text-center mb-8 px-4 leading-relaxed text-sm">
              Tu depósito está seguro en el contrato de escrow de Stellar. El guía del enjambre recibirá el XLM tras tu check-in digital.
            </p>

            <div className="bg-white dark:bg-[#2b2724] border border-slate-200 dark:border-slate-800 rounded-3xl p-5 w-full text-center shadow-lg mb-8 relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-primary/5 pointer-events-none"></div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">
                ¡Misión Iniciada!
              </p>
              <div className="flex items-center justify-center gap-2">
                <span className="text-primary text-2xl font-black">+150 XP</span>
                <span className="text-2xl animate-bounce">🏔️</span>
              </div>
              {levelUpData && (
                <div className="mt-3 inline-block px-3 py-1 bg-accent/10 text-accent border border-accent/20 rounded-full text-xs font-bold uppercase tracking-wider">
                  ¡Sube de Nivel! Ahora eres {levelUpData.rank.name}
                </div>
              )}
            </div>

            <button
              onClick={() => navigate('/passport')}
              className="w-full h-14 bg-primary text-white rounded-xl font-bold hover:scale-[1.01] transition-all shadow-md shadow-primary/20"
            >
              Ver Mi Pasaporte
            </button>
          </div>
        )}
      </main>

      {/* Bottom Navigation */}
      <BottomNav />
    </div>
  );
}
