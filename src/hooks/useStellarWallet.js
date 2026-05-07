import { useState, useCallback } from 'react';
import { StellarWalletsKit, WalletNetwork, allowAllModules } from '@creit.tech/stellar-wallets-kit';

// Initialize the wallet kit for Testnet (as per Stellar guidelines)
const kit = new StellarWalletsKit({
  network: WalletNetwork.TESTNET,
  modules: allowAllModules(),
});

export function useStellarWallet() {
  const [publicKey, setPublicKey] = useState(null);
  const [connecting, setConnecting] = useState(false);

  const connect = useCallback(async () => {
    setConnecting(true);
    try {
      await kit.openModal({
        onWalletSelected: async (option) => {
          kit.setWallet(option.id);
          const { address } = await kit.getAddress();
          setPublicKey(address);
        },
      });
    } catch (err) {
      console.error("Wallet connection failed:", err);
    } finally {
      setConnecting(false);
    }
  }, []);

  const disconnect = useCallback(() => {
    setPublicKey(null);
  }, []);

  const sign = useCallback(async (txXdr) => {
    try {
      const { signedTxXdr } = await kit.signTransaction(txXdr, {
        networkPassphrase: WalletNetwork.TESTNET,
      });
      return signedTxXdr;
    } catch (err) {
      console.error("Transaction signing failed:", err);
      throw err;
    }
  }, []);

  return { publicKey, connecting, connect, disconnect, sign };
}
