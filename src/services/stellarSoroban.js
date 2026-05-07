import * as StellarSdk from '@stellar/stellar-sdk';

const RPC_URL = 'https://soroban-testnet.stellar.org';
export const CONTRACT_ID = import.meta.env.VITE_CONTRACT_ID ?? '';
const NETWORK_PASSPHRASE = StellarSdk.Networks.TESTNET;

export const server = new StellarSdk.rpc.Server(RPC_URL);

// --- MOCK STATE PARA DEMO (Cuando no hay contrato válido) ---
let mockVotes = { 'Opcion_A': 12, 'Opcion_B': 8, 'Opcion_C': 4 };
let mockVoters = new Set();
// -----------------------------------------------------------

function isMockMode() {
  return !CONTRACT_ID || !CONTRACT_ID.startsWith('C');
}

// Lazy — evita el crash si CONTRACT_ID está vacío al cargar la página
function getContract() {
  if (isMockMode()) throw new Error('Modo Mock Activo');
  return new StellarSdk.Contract(CONTRACT_ID);
}

// Cuenta dummy para simular llamadas de solo lectura.
const DUMMY_ACCOUNT = new StellarSdk.Account(
  'GBYLYPVE5WIRYS7WIISE3TLKMW6FMIK377HXLLJDE7VHUM4YMIMK7WDK',
  '0'
);

export const VOTE_OPTIONS = [
  { id: 'Opcion_A', label: 'Trekking en el Valle Sagrado' },
  { id: 'Opcion_B', label: 'Ruta Gastronómica en Lima' },
  { id: 'Opcion_C', label: 'Surf en Máncora' },
];

// Lee el mapa completo de votos desde el contrato
export async function getVotes() {
  if (isMockMode()) {
    return new Promise(res => setTimeout(() => res({ ...mockVotes }), 500));
  }

  try {
    const tx = new StellarSdk.TransactionBuilder(DUMMY_ACCOUNT, {
      fee: '100',
      networkPassphrase: NETWORK_PASSPHRASE,
    })
      .addOperation(getContract().call('get_votes'))
      .setTimeout(30)
      .build();

    const sim = await server.simulateTransaction(tx);

    if (StellarSdk.rpc.Api.isSimulationError(sim)) return {};

    const retval = sim.result?.retval;
    if (!retval) return {};

    const native = StellarSdk.scValToNative(retval);
    return native ?? {};
  } catch {
    return {};
  }
}

// Verifica si una wallet ya votó
export async function checkHasVoted(walletAddress) {
  if (isMockMode()) {
    return new Promise(res => setTimeout(() => res(mockVoters.has(walletAddress)), 300));
  }

  try {
    const tx = new StellarSdk.TransactionBuilder(DUMMY_ACCOUNT, {
      fee: '100',
      networkPassphrase: NETWORK_PASSPHRASE,
    })
      .addOperation(
        getContract().call('has_voted', new StellarSdk.Address(walletAddress).toScVal())
      )
      .setTimeout(30)
      .build();

    const sim = await server.simulateTransaction(tx);
    if (StellarSdk.rpc.Api.isSimulationError(sim)) return false;

    const retval = sim.result?.retval;
    return retval ? StellarSdk.scValToNative(retval) : false;
  } catch {
    return false;
  }
}

// Construye y prepara la transacción de voto (lista para firmar)
export async function buildVoteTx(walletAddress, optionId) {
  if (isMockMode()) {
    // Si estamos en modo mock, no construimos un XDR real, 
    // solo devolvemos un string que indica simulación
    return `MOCK_TX_${walletAddress}_${optionId}`;
  }

  const accountData = await server.getAccount(walletAddress);
  const tx = new StellarSdk.TransactionBuilder(accountData, {
    fee: '1000',
    networkPassphrase: NETWORK_PASSPHRASE,
  })
    .addOperation(
      getContract().call(
        'vote',
        new StellarSdk.Address(walletAddress).toScVal(),
        StellarSdk.nativeToScVal(optionId, { type: 'symbol' })
      )
    )
    .setTimeout(60)
    .build();

  const prepared = await server.prepareTransaction(tx);
  return prepared.toXDR();
}

// Envía la transacción firmada y espera la confirmación on-chain
export async function submitSignedTx(signedXDR) {
  if (isMockMode()) {
    // Simulamos la espera de firma y red
    await new Promise(res => setTimeout(res, 2000));
    
    // Extraemos la información del mock XDR
    if (signedXDR.startsWith('MOCK_TX_')) {
      const [, , wallet, option] = signedXDR.split('_');
      mockVotes[option] = (mockVotes[option] || 0) + 1;
      mockVoters.add(wallet);
      return `MOCK_HASH_${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
    }
    throw new Error('Transacción inválida');
  }

  const tx = StellarSdk.TransactionBuilder.fromXDR(signedXDR, NETWORK_PASSPHRASE);
  const response = await server.sendTransaction(tx);

  if (response.status === 'ERROR') {
    throw new Error('La transacción fue rechazada por la red');
  }

  // Polling hasta confirmar el resultado
  let result;
  let attempts = 0;
  do {
    await new Promise((r) => setTimeout(r, 1000));
    result = await server.getTransaction(response.hash);
    attempts++;
  } while (result.status === 'NOT_FOUND' && attempts < 30);

  if (result.status === 'FAILED') throw new Error('La transacción falló en la red');
  if (attempts >= 30) throw new Error('Timeout esperando confirmación');

  return response.hash;
}
