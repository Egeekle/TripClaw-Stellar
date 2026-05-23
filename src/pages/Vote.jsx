import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStellarWallet } from '../hooks/useStellarWallet';
import { getVotes, checkHasVoted, buildVoteTx, submitSignedTx, VOTE_OPTIONS, CONTRACT_ID } from '../services/stellarSoroban';
import PageHeader from '../components/PageHeader';
import BottomNav from '../components/BottomNav';
import { Card, Badge } from '../components/ui';

export default function Vote() {
  const navigate = useNavigate();
  const { publicKey, connecting, connect, disconnect, sign } = useStellarWallet();
  const [hasVoted, setHasVoted] = useState(false);
  const [votes, setVotes] = useState({});
  const [totalVoters, setTotalVoters] = useState(0);
  const [loading, setLoading] = useState(true);
  
  const [selected, setSelected] = useState(null);
  const [voteLoading, setVoteLoading] = useState(false);
  const [error, setError] = useState(null);
  const [txHash, setTxHash] = useState(null);
  const [step, setStep] = useState('idle');

  const short = (addr) => `${addr.slice(0, 6)}...${addr.slice(-4)}`;

  const loadVotes = async () => {
    try {
      const data = await getVotes();
      setVotes(data);
      setTotalVoters(Object.values(data).reduce((a, b) => a + b, 0));
    } catch (err) {
      console.error('Error cargando votos:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadVotes();
    const interval = setInterval(loadVotes, 10_000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (publicKey) {
      checkHasVoted(publicKey).then(setHasVoted);
    } else {
      setHasVoted(false);
    }
  }, [publicKey]);

  const handleVote = async () => {
    if (!selected || !publicKey) return;
    setVoteLoading(true);
    setError(null);
    setTxHash(null);

    try {
      setStep('building');
      const txXDR = await buildVoteTx(publicKey, selected);

      setStep('signing');
      // En modo mock, saltamos la firma si el XDR indica mock
      const signedTxXdr = txXDR.startsWith('MOCK_TX_') ? txXDR : await sign(txXDR);

      setStep('submitting');
      const hash = await submitSignedTx(signedTxXdr);
      setTxHash(hash);
      
      setHasVoted(true);
      loadVotes();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al votar. Intenta de nuevo.');
    } finally {
      setVoteLoading(false);
      setStep('idle');
    }
  };

  const stepLabel = {
    building: 'Preparando transacción...',
    signing: 'Esperando firma en Freighter...',
    submitting: 'Enviando a Stellar Testnet...',
  };

  return (
    <div className="min-h-screen pb-24 md:pb-6 bg-background-light dark:bg-background-dark text-slate-900 dark:text-white flex flex-col font-display transition-colors">
      
      {/* Header */}
      <PageHeader 
        title="Votación de Enjambre" 
        subtitle="Gobernanza"
        showBack={true}
        backTo="/dashboard"
      />

      <main className="flex-1 max-w-2xl mx-auto px-4 py-8 md:py-12 w-full">
        <header className="text-center mb-10">
          <h1 className="text-3xl md:text-4xl font-black tracking-tight mb-3">
            Decide el Destino 🗺️
          </h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm">
            Vota on-chain por la próxima actividad prioritaria de tu enjambre de viaje.
          </p>
        </header>

        {/* Wallet Connection Status */}
        {publicKey ? (
          <div className="flex items-center justify-between p-4 bg-white dark:bg-[#2b2724] border border-slate-200 dark:border-slate-800 rounded-2xl mb-8 shadow-sm">
            <div>
              <span className="text-success text-xs font-bold flex items-center gap-1.5 uppercase">
                <span className="size-2 rounded-full bg-success animate-pulse"></span>
                Wallet Conectada
              </span>
              <p className="font-mono text-sm text-slate-700 dark:text-slate-300 mt-1 font-semibold">
                {short(publicKey)}
              </p>
            </div>
            <button
              onClick={disconnect}
              className="text-xs font-bold text-slate-400 hover:text-red-500 transition-colors uppercase tracking-wider"
            >
              Desconectar
            </button>
          </div>
        ) : (
          <div className="mb-8 text-center p-6 bg-white dark:bg-[#2b2724]/40 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm">
            <span className="material-symbols-outlined text-4xl text-slate-400 mb-3">lock</span>
            <button
              onClick={connect}
              disabled={connecting}
              className="w-full py-3.5 px-6 bg-primary hover:bg-primary/95 text-white disabled:bg-slate-700 disabled:cursor-not-allowed rounded-xl font-bold transition-all shadow-md shadow-primary/20"
            >
              {connecting ? 'Conectando...' : 'Conectar Freighter Wallet'}
            </button>
            <p className="mt-3 text-slate-400 text-xs font-medium">
              Necesitas la extensión Freighter configurada en Testnet.
            </p>
          </div>
        )}

        {loading ? (
          <div className="text-center py-12 text-slate-400">
            <span className="material-symbols-outlined animate-spin text-4xl mb-4">refresh</span>
            <p className="text-sm font-bold uppercase tracking-wider">Cargando votos desde Soroban...</p>
          </div>
        ) : (
          <div className="space-y-6">
            {publicKey && !hasVoted && (
              <div className="mb-6 p-6 bg-white dark:bg-[#2b2724] border border-slate-200 dark:border-slate-800 rounded-3xl shadow-md">
                <h2 className="text-lg font-black text-slate-900 dark:text-white mb-1">
                  ¿Qué actividad priorizamos esta semana?
                </h2>
                <p className="text-slate-500 dark:text-slate-400 text-xs mb-6 font-medium">
                  Tu voto quedará registrado de manera inmutable en Stellar Soroban Testnet.
                </p>

                <div className="space-y-3 mb-6">
                  {VOTE_OPTIONS.map((option) => (
                    <button
                      key={option.id}
                      onClick={() => !voteLoading && setSelected(option.id)}
                      className={`w-full p-4 rounded-xl text-left transition-all border font-bold text-sm ${
                        selected === option.id
                          ? 'bg-primary border-primary text-white shadow-lg shadow-primary/25'
                          : 'bg-slate-50 dark:bg-slate-900/40 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:border-slate-400 dark:hover:bg-slate-800'
                      }`}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>

                <button
                  onClick={handleVote}
                  disabled={!selected || voteLoading}
                  className="w-full py-3.5 bg-primary hover:bg-primary/95 text-white disabled:bg-slate-700 disabled:cursor-not-allowed rounded-xl font-bold transition-all shadow-lg shadow-primary/20 active:scale-95"
                >
                  {voteLoading && step !== 'idle' ? stepLabel[step] : 'Firmar Voto On-Chain'}
                </button>

                {error && (
                  <p className="mt-4 text-red-500 text-xs font-bold text-center bg-red-500/10 p-2.5 rounded-xl border border-red-500/20">{error}</p>
                )}

                {txHash && (
                  <p className="mt-4 text-success text-[10px] text-center font-mono bg-success/10 p-2.5 rounded-xl border border-success/20 break-all font-semibold">
                    TRANSACCIÓN: {txHash}
                  </p>
                )}
              </div>
            )}

            {publicKey && hasVoted && (
              <div className="mb-6 p-5 bg-success/10 border border-success/20 rounded-2xl text-center shadow-sm">
                <div className="size-12 bg-success/20 rounded-full flex items-center justify-center mx-auto mb-3 border border-success/30">
                  <span className="material-symbols-outlined text-success text-2xl font-bold">verified</span>
                </div>
                <p className="text-success font-black text-lg mb-1 leading-tight">
                  Tu voto está registrado on-chain
                </p>
                <p className="text-slate-500 dark:text-slate-400 text-xs font-medium">
                  Gracias por participar activamente en la gobernanza colectiva de Aquisito.
                </p>
              </div>
            )}

            {!publicKey && (
              <p className="text-center text-slate-400 text-xs font-bold uppercase tracking-wider mb-6 flex items-center justify-center gap-1.5">
                <span className="material-symbols-outlined text-base">info</span>
                Conecta tu wallet para participar en la decisión del enjambre
              </p>
            )}

            {/* Results Section */}
            <div className="p-6 bg-white dark:bg-[#2b2724] border border-slate-200 dark:border-slate-800 rounded-3xl shadow-md">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-black flex items-center gap-2">
                  <span className="material-symbols-outlined text-primary">bar_chart</span>
                  Resultados en vivo
                </h2>
                <Badge variant="primary" className="bg-primary/10 border border-primary/20 text-primary font-bold">
                  {totalVoters} {totalVoters === 1 ? 'voto' : 'votos'}
                </Badge>
              </div>

              <div className="space-y-5">
                {VOTE_OPTIONS.map((option) => {
                  const count = votes[option.id] ?? 0;
                  const percentage = totalVoters > 0 ? Math.round((count / totalVoters) * 100) : 0;
                  const maxVotes = Math.max(...Object.values(votes), 1);
                  const barWidth = totalVoters > 0 ? (count / maxVotes) * 100 : 0;

                  return (
                    <div key={option.id}>
                      <div className="flex justify-between text-xs font-bold mb-2">
                        <span className="text-slate-700 dark:text-slate-300">{option.label}</span>
                        <span className="text-slate-400 font-mono">
                          {count} ({percentage}%)
                        </span>
                      </div>
                      <div className="h-2.5 bg-slate-100 dark:bg-slate-900/60 rounded-full overflow-hidden border border-slate-200 dark:border-slate-800">
                        <div
                          className="h-full bg-gradient-primary rounded-full transition-all duration-1000 ease-out"
                          style={{ width: `${barWidth}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>

              {totalVoters === 0 && (
                <div className="text-center mt-6 p-4 bg-slate-50 dark:bg-slate-950/20 rounded-xl border border-slate-200 dark:border-slate-850">
                  <p className="text-slate-400 text-xs font-medium">Aún no hay votos registrados. ¡Sé el primero en elegir el rumbo!</p>
                </div>
              )}

              <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-center gap-1.5 text-slate-400 text-[10px] font-bold uppercase tracking-widest">
                <span className="material-symbols-outlined text-[14px] animate-spin">sync</span>
                Soroban Testnet · Actualizado en tiempo real
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Bottom Nav */}
      <BottomNav />
    </div>
  );
}
