import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStellarWallet } from '../hooks/useStellarWallet';
import { getVotes, checkHasVoted, buildVoteTx, submitSignedTx, VOTE_OPTIONS, CONTRACT_ID } from '../services/stellarSoroban';

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

  const isMockMode = !CONTRACT_ID || !CONTRACT_ID.startsWith('C');

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-950 to-slate-900 text-white overflow-y-auto w-full absolute inset-0 pb-20">
      <header className="sticky top-0 z-10 px-6 py-4 bg-slate-900/50 backdrop-blur-md border-b border-white/5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate(-1)}
            className="flex size-8 items-center justify-center rounded-lg bg-slate-800 text-slate-300 hover:text-white transition-colors"
          >
            <span className="material-symbols-outlined text-sm">arrow_back</span>
          </button>
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-indigo-400 text-2xl">how_to_vote</span>
            <h1 className="text-lg font-bold tracking-tight">Swarm Voting</h1>
          </div>
        </div>
      </header>

      <main className="max-w-xl mx-auto px-4 py-8 md:py-12">
        <header className="text-center mb-10">
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight mb-3">
            Decide el Destino 🗺️
          </h1>
          <p className="text-slate-400">
            Vota on-chain por la próxima actividad de tu Travel Swarm.
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

        {loading ? (
          <div className="text-center py-12 text-slate-400">
            <span className="material-symbols-outlined animate-spin text-4xl mb-4">refresh</span>
            <p>Cargando votos desde Soroban...</p>
          </div>
        ) : (
          <>
            {publicKey && !hasVoted && (
              <div className="mb-6 p-6 bg-slate-800/50 rounded-2xl border border-slate-700 shadow-xl">
                <h2 className="text-xl font-semibold mb-1">
                  ¿Qué actividad priorizamos?
                </h2>
                <p className="text-slate-400 text-sm mb-6">
                  Tu voto quedará registrado de manera inmutable en Stellar Testnet
                </p>

                <div className="space-y-3 mb-6">
                  {VOTE_OPTIONS.map((option) => (
                    <button
                      key={option.id}
                      onClick={() => !voteLoading && setSelected(option.id)}
                      className={`w-full p-4 rounded-xl text-left transition-all border ${
                        selected === option.id
                          ? 'bg-indigo-600 border-indigo-500 text-white shadow-lg shadow-indigo-500/20'
                          : 'bg-slate-700/50 border-slate-600 text-slate-300 hover:border-slate-400 hover:bg-slate-700'
                      }`}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>

                <button
                  onClick={handleVote}
                  disabled={!selected || voteLoading}
                  className="w-full py-3.5 bg-indigo-600 hover:bg-indigo-500
                            disabled:bg-slate-700 disabled:cursor-not-allowed
                            rounded-xl font-bold transition-colors shadow-lg shadow-indigo-500/20"
                >
                  {voteLoading && step !== 'idle' ? stepLabel[step] : 'Firmar Voto On-Chain'}
                </button>

                {error && (
                  <p className="mt-4 text-red-400 text-sm text-center bg-red-900/20 p-2 rounded border border-red-900/50">{error}</p>
                )}

                {txHash && (
                  <p className="mt-4 text-green-400 text-xs text-center font-mono bg-green-900/20 p-2 rounded border border-green-900/50 break-all">
                    TX: {txHash}
                  </p>
                )}
              </div>
            )}

            {publicKey && hasVoted && (
              <div className="mb-6 p-5 bg-green-900/20 border border-green-700/50 rounded-2xl text-center shadow-lg">
                <div className="size-12 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-3 border border-green-500/30">
                  <span className="material-symbols-outlined text-green-400 text-2xl">verified</span>
                </div>
                <p className="text-green-400 font-bold text-lg mb-1">
                  Tu voto está on-chain
                </p>
                <p className="text-slate-300 text-sm">
                  Gracias por participar en la decisión del Swarm.
                </p>
              </div>
            )}

            {!publicKey && (
              <p className="text-center text-slate-500 text-sm mb-6 flex items-center justify-center gap-2">
                <span className="material-symbols-outlined text-sm">info</span>
                Conecta tu wallet para participar en la votación
              </p>
            )}

            {/* Results Section */}
            <div className="p-6 bg-slate-800/50 rounded-2xl border border-slate-700 shadow-xl">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold flex items-center gap-2">
                  <span className="material-symbols-outlined text-indigo-400">bar_chart</span>
                  Resultados en vivo
                </h2>
                <span className="bg-indigo-900/50 text-indigo-300 text-xs px-2.5 py-1 rounded-full border border-indigo-500/30 font-medium">
                  {totalVoters} {totalVoters === 1 ? 'voto' : 'votos'}
                </span>
              </div>

              <div className="space-y-5">
                {VOTE_OPTIONS.map((option) => {
                  const count = votes[option.id] ?? 0;
                  const percentage = totalVoters > 0 ? Math.round((count / totalVoters) * 100) : 0;
                  const maxVotes = Math.max(...Object.values(votes), 1);
                  const barWidth = totalVoters > 0 ? (count / maxVotes) * 100 : 0;

                  return (
                    <div key={option.id}>
                      <div className="flex justify-between text-sm mb-2">
                        <span className="text-slate-200 font-medium">{option.label}</span>
                        <span className="text-slate-400 tabular-nums font-bold">
                          {count} ({percentage}%)
                        </span>
                      </div>
                      <div className="h-2.5 bg-slate-700/50 rounded-full overflow-hidden border border-slate-700">
                        <div
                          className="h-full bg-gradient-to-r from-indigo-500 to-violet-500 rounded-full transition-all duration-1000 ease-out"
                          style={{ width: `${barWidth}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>

              {totalVoters === 0 && (
                <div className="text-center mt-6 p-4 bg-slate-700/20 rounded-xl border border-slate-700/50">
                  <p className="text-slate-400 text-sm">Aún no hay votos. ¡Sé el primero en elegir el destino!</p>
                </div>
              )}

              <div className="mt-6 pt-4 border-t border-slate-700/50 flex items-center justify-center gap-1.5 text-slate-500 text-[11px] font-medium uppercase tracking-wider">
                <span className="material-symbols-outlined text-[14px]">sync</span>
                Actualización en tiempo real · Soroban Testnet
              </div>
            </div>
          </>
        )}
      </main>
    </div>
  );
}
