import { RPCSubprovider, Web3ProviderEngine } from '0x.js';
import { MnemonicWalletSubprovider } from '@0x/subproviders';

import { BASE_DERIVATION_PATH, MNEMONIC, NETWORK_CONFIGS } from './configs';
import { SignerSubprovider } from '@0x/subproviders/lib/src/subproviders/signer';

export const mnemonicWallet = new MnemonicWalletSubprovider({
    mnemonic: MNEMONIC,
    baseDerivationPath: BASE_DERIVATION_PATH,
});

export const pe = new Web3ProviderEngine();
pe.addProvider(mnemonicWallet);
pe.addProvider(new RPCSubprovider(NETWORK_CONFIGS.rpcUrl));
console.log(NETWORK_CONFIGS.rpcUrl);
// pe.addProvider(new SignerSubprovider(window.web3.currentProvider));
// pe.addProvider(new RPCSubprovider('http://localhost:8545'))
pe.start();

export const providerEngine = pe;
