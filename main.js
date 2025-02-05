import dotenv from 'dotenv';
import { ethers } from 'ethers';
import fetch from 'node-fetch';
import { HttpsProxyAgent } from 'https-proxy-agent';
import fs from 'fs';
import chalk from 'chalk';

dotenv.config();
const config = JSON.parse(fs.readFileSync('config.json', 'utf8'));

const AMOUNT_TO_SWAP = '0.0001';
const LOOP_DELAY = 10;
const WALLET_DELAY = 800;
const MAX_LOOP = 1000;
const MAX_LOOP_DURATION = 60 * 1000;
const ERROR_PAUSE = 10 * 60 * 1000;
const MAX_ERROR_COUNT = 3;

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const WRAP_CONTRACT_ADDRESS = '0x1Cd0cd01c8C902AdAb3430ae04b9ea32CB309CF1';
const WRAP_ABI = ['function wrap(uint256 amount, address recipient) external'];

async function getGasPrice(provider) {
  const gasPrice = await provider.getFeeData();
  return gasPrice.gasPrice * BigInt(11) / BigInt(10);
}

async function swapForWallet(account) {
  try {
    const provider = new ethers.JsonRpcProvider(account.rpc_url);
    const wallet = new ethers.Wallet(account.privateKey, provider);
    const contract = new ethers.Contract(WRAP_CONTRACT_ADDRESS, WRAP_ABI, wallet);

    const wpolContract = new ethers.Contract(
      '0x0d500B1d8E8eF31E21C99d1Db9A6444d3ADf1270',
      ['function balanceOf(address) view returns (uint256)'],
      provider
    );

    const amountToSwap = ethers.parseUnits(AMOUNT_TO_SWAP, 18);

    const balance = await wpolContract.balanceOf(wallet.address);
    const formattedBalance = parseFloat(ethers.formatUnits(balance, 18)).toFixed(4);

    if (balance < amountToSwap) {
      console.log(chalk.red(`Wallet ${wallet.address} | WPOL Balance: ${formattedBalance} | Insufficient WPOL.`));
      return { success: false, error: 'Insufficient WPOL balance' };
    }

    const gasPrice = await getGasPrice(provider);
    const txResponse = await contract.wrap(amountToSwap, wallet.address, {
      gasLimit: 300000,
      gasPrice: gasPrice,
    });

    const receipt = await txResponse.wait();

    const payload = {
      blockchainId: 137,
      type: 2,
      walletAddress: wallet.address,
      hash: txResponse.hash,
      fromTokenAddress: '0x0d500B1d8E8eF31E21C99d1Db9A6444d3ADf1270',
      toTokenAddress: WRAP_CONTRACT_ADDRESS,
      fromTokenSymbol: 'WPOL',
      toTokenSymbol: 'tPOL',
      fromAmount: amountToSwap.toString(),
      toAmount: amountToSwap.toString(),
      gasFeeTokenAddress: '0x0000000000000000000000000000000000000000',
      gasFeeTokenSymbol: 'POL',
      gasFeeAmount: receipt.gasUsed.toString(),
    };

    const apiResponse = await fetch(config.api_Url, {
      method: 'POST',
      headers: {
        'Accept': 'application/json, text/plain, */*',
        'Content-Type': 'application/json',
        'Origin': 'https://app.tea-fi.com',
        'Referer': 'https://app.tea-fi.com/',
      },
      body: JSON.stringify(payload),
      agent: new HttpsProxyAgent(account.proxy),
    });

    let apiData = {};
    if (apiResponse.ok) {
      apiData = await apiResponse.json();
    } else {
      const errorText = await apiResponse.text();
      console.error(chalk.red(`API Error: ${apiResponse.status} - ${errorText}`));
      return { success: false, error: `API Error: ${errorText}` };
    }

    console.log(
      chalk.yellowBright(`Wallet `) + chalk.white(wallet.address) + ' | ' +
      chalk.greenBright(`WPOL Balance: `) + chalk.white(formattedBalance) + ' | ' +
      chalk.yellowBright(`Block Confirmed: `) + chalk.white(receipt.blockNumber) + ' | ' +
      chalk.blueBright(`API Response: `) +
      `ID ${chalk.white(apiData.id || 'N/A')} - ${chalk.greenBright(apiData.pointsAmount || 'N/A')}`
    );

    return { success: true };

  } catch (error) {
    console.error(chalk.red(`Error for wallet ${account.privateKey.slice(-6)}: ${error.message}`));
    return { success: false, error: error.message };
  }
}

async function main() {
  console.clear();
  let loop = 1;
  let consecutiveErrors = 0;

  while (loop <= MAX_LOOP) {
    console.log(chalk.bgWhite.black(`\n 🔄 Loop ${loop} - Running...\n`));

    const startTime = Date.now();

    const walletPromises = config.accounts.map(async (account, index) => {
      await delay(index * WALLET_DELAY);
      return swapForWallet(account);
    });

    let results = [];
    const timeoutPromise = new Promise((_, reject) =>
      setTimeout(() => reject(new Error('Loop exceeded maximum duration')), MAX_LOOP_DURATION)
    );

    try {
      results = await Promise.race([Promise.all(walletPromises), timeoutPromise]);
    } catch (error) {
      console.error(chalk.bgRed.black(`\n ❌ Loop ${loop} failed: ${error.message}\n`));
      results = null;
    }

    if (results) {
      let loopFailed = false;

      results.forEach((result, index) => {
        if (!result?.success) {
          console.error(
            chalk.red(`Wallet ${config.accounts[index].privateKey.slice(-6)} failed: ${result?.error || 'Unknown error'}`)
          );
          loopFailed = true;
        }
      });

      if (loopFailed) {
        consecutiveErrors++;
      } else {
        consecutiveErrors = 0;
      }
    } else {
      consecutiveErrors++;
    }

    if (consecutiveErrors >= MAX_ERROR_COUNT) {
      console.error(chalk.bgRed.black(`\n 🚨 Maximum consecutive errors reached (${MAX_ERROR_COUNT}). Exiting...\n`));
      break;
    }

    const loopDuration = (Date.now() - startTime) / 1000;
    console.log(
      chalk.bgGreen.black(`\n ✅ Loop ${loop} - Completed in ${loopDuration.toFixed(2)} seconds.\n`)
    );

    if (loopDuration > MAX_LOOP_DURATION / 1000) {
      console.error(
        chalk.bgRed.black(`\n ⚠️ Warning: Loop ${loop} took longer than the allowed 1 minute.\n`)
      );
    }

    loop++;

    if (consecutiveErrors > 0) {
      console.log(chalk.bgYellow.black(`\n ⏸ Pausing for 10 minutes due to errors...\n`));
      await delay(ERROR_PAUSE);
    } else {
      for (let i = LOOP_DELAY; i > 0; i--) {
        process.stdout.write(`\r${chalk.cyan(`⏳ Wait ${i} seconds...`)} `);
        await delay(1000);
      }
      console.log('\n');
    }
  }

  console.log(chalk.bgRed.black('\n 🚨 Max loop reached. Exiting...\n'));
}

main().catch((error) => console.error(chalk.red('Error in main process:', error.message)));
