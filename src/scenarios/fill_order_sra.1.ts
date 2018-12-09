import {
    assetDataUtils,
    BigNumber,
    ContractWrappers,
    generatePseudoRandomSalt,
    Order,
    orderHashUtils,
    signatureUtils,
} from '0x.js';
import { HttpClient, OrderbookRequest } from '@0x/connect';
import { Web3Wrapper } from '@0x/web3-wrapper';

import { NETWORK_CONFIGS, TX_DEFAULTS } from '../configs';
import { DECIMALS, NULL_ADDRESS } from '../constants';
import { contractAddresses } from '../contracts';
import { PrintUtils } from '../print_utils';
import { providerEngine } from '../provider_engine';
import { getRandomFutureDateInSeconds } from '../utils';

/**
 * In this scenario, the maker creates and signs an order for selling ZRX for WETH. This
 * order is then submitted to a Relayer via the Standard Relayer API. A Taker queries
 * this Standard Relayer API to discover orders.
 * The taker fills this order via the 0x Exchange contract.
 */
export async function scenarioAsync(): Promise<void> {
    PrintUtils.printScenario('Fill Order Standard Relayer API (Maker)');
    // Initialize the ContractWrappers, this provides helper functions around calling
    // 0x contracts as well as ERC20/ERC721 token contracts on the blockchain
    const contractWrappers = new ContractWrappers(providerEngine, { networkId: NETWORK_CONFIGS.networkId });
    // Initialize the Web3Wrapper, this provides helper functions around fetching
    // account information, balances, general contract logs
    const web3Wrapper = new Web3Wrapper(providerEngine);
    // const [maker] = Id;
    const [maker, taker] = await web3Wrapper.getAvailableAddressesAsync();
    const zrxTokenAddress = contractAddresses.zrxToken;
    const etherTokenAddress = contractAddresses.etherToken;
    const printUtils = new PrintUtils(
        web3Wrapper,
        contractWrappers,
        { maker, taker },
        { ZRX: zrxTokenAddress, WETH: etherTokenAddress },
    );
    printUtils.printAccounts();

    const makerAssetData = assetDataUtils.encodeERC20AssetData(zrxTokenAddress);
    const takerAssetData = assetDataUtils.encodeERC20AssetData(etherTokenAddress);
    // the amount the maker is selling of maker asset
    const makerAssetAmount = Web3Wrapper.toBaseUnitAmount(new BigNumber(5), DECIMALS);
    // the amount the maker wants of taker asset
    const takerAssetAmount = Web3Wrapper.toBaseUnitAmount(new BigNumber(0.1), DECIMALS);

    let txHash;
    let txReceipt;

    // Allow the 0x ERC20 Proxy to move ZRX on behalf of makerAccount
    //commented this before
    // const makerZRXApprovalTxHash = await contractWrappers.erc20Token.setUnlimitedProxyAllowanceAsync(
    //     zrxTokenAddress,
    //     maker,
    // );
    // await printUtils.awaitTransactionMinedSpinnerAsync('Maker ZRX Approval', makerZRXApprovalTxHash);

    // Allow the 0x ERC20 Proxy to move WETH on behalf of takerAccount
    // const takerWETHApprovalTxHash = await contractWrappers.erc20Token.setUnlimitedProxyAllowanceAsync(
    //     etherTokenAddress,
    //     taker,
    // );
    // await printUtils.awaitTransactionMinedSpinnerAsync('Taker WETH Approval', takerWETHApprovalTxHash);

    // // Convert ETH into WETH for taker by depositing ETH into the WETH contract
    // const takerWETHDepositTxHash = await contractWrappers.etherToken.depositAsync(
    //     etherTokenAddress,
    //     takerAssetAmount,
    //     taker,
    // );
    // await printUtils.awaitTransactionMinedSpinnerAsync('Taker WETH Deposit', takerWETHDepositTxHash);

    // PrintUtils.printData('Setup', [
    //     ['Maker ZRX Approval', makerZRXApprovalTxHash]
    //     // ['Taker WETH Approval', takerWETHApprovalTxHash],
    //     // ['Taker WETH Deposit', takerWETHDepositTxHash],
    // ]);

    // Initialize the Standard Relayer API client
    const httpClient = new HttpClient('http://localhost:3000/v2/');

    // Generate and expiration time and find the exchange smart contract address
    const randomExpiration = getRandomFutureDateInSeconds();
    const exchangeAddress = contractAddresses.exchange;

    // Ask the relayer about the parameters they require for the order
    const orderConfigRequest = {
        exchangeAddress,
        makerAddress: maker,
        takerAddress: NULL_ADDRESS,
        expirationTimeSeconds: randomExpiration,
        makerAssetAmount, //amt of token maker is offering
        takerAssetAmount, //amt of token maker is requesting from taker
        makerAssetData, //token addr maker is offering
        takerAssetData, //token addr maker is requesting from the taker
    };
    console.log("hiiiii " + exchangeAddress);
    const orderConfig = await httpClient.getOrderConfigAsync(orderConfigRequest, {
        networkId: NETWORK_CONFIGS.networkId,
    });

    // Create the order
    const order: Order = {
        salt: generatePseudoRandomSalt(),
        ...orderConfigRequest,
        ...orderConfig,
    };

    // Generate the order hash and sign it
    const orderHashHex = orderHashUtils.getOrderHashHex(order);
    const signature = await signatureUtils.ecSignHashAsync(providerEngine, orderHashHex, maker);
    const signedOrder = { ...order, signature };
    console.log(signedOrder);

    // Validate this order
    // await contractWrappers.exchange.validateOrderFillableOrThrowAsync(signedOrder);

    // Submit the order to the SRA Endpoint
    await httpClient.submitOrderAsync(signedOrder, { networkId: NETWORK_CONFIGS.networkId });

    const orderbookRequest: OrderbookRequest = { baseAssetData: makerAssetData, quoteAssetData: takerAssetData };
    const response = await httpClient.getOrderbookAsync(orderbookRequest, { networkId: NETWORK_CONFIGS.networkId });
    // console.log(response.asks.records[1]);
    console.log(response.asks.records[0].order.makerAssetAmount);
    console.log("Total orders in orderbook: " + response.asks.total);
    // Stop the Provider Engine
    providerEngine.stop();
}

void (async () => {
    try {
        if (!module.parent) {
            await scenarioAsync();
        }
    } catch (e) {
        console.log(e);
        providerEngine.stop();
        process.exit(1);
    }
})();
