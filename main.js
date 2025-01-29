import dotenv from "dotenv";
import { ethers } from "ethers";
import fetch from "node-fetch";
import chalk from'chalk';

dotenv.config();

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function main() {
  try {
   console.log(chalk.green("\n📌 Wallet Information"));
    const privateKey = process.env.PRIVATE_KEY;
    const rpcUrl = process.env.RPC_URL;
    const API_URL = process.env.API_URL;
    const HEADERS = {
      "Accept": "application/json, text/plain, */*",
      "Content-Type": "application/json",
      "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)",
    };

    if (!privateKey || !rpcUrl || !API_URL) {
      throw new Error("PRIVATE_KEY, RPC_URL, or API_URL is missing in the .env file.");
    }

    const provider = new ethers.JsonRpcProvider(rpcUrl);
    const wallet = new ethers.Wallet(privateKey, provider);

    console.log("Wallet address:", wallet.address);

    const balance = await provider.getBalance(wallet.address);
    console.log("Wallet Balance (in MATIC):", ethers.formatUnits(balance, "ether"));

    const amountToWrap = ethers.parseEther("0.00015");
    if (balance < amountToWrap) {
      throw new Error("Insufficient MATIC balance for the transaction.");
    }

    const wmaticAbi = ["function deposit() public payable"];
    const wmaticAddress = "0x0d500B1d8E8eF31E21C99d1Db9A6444d3ADf1270";
    const wmaticContract = new ethers.Contract(wmaticAddress, wmaticAbi, wallet);

    const loops = 100000;  // Define the number of loops here (can be modified manually)

    for (let i = 1; i <= loops; i++) {
      console.log(`\n🔁 Loop ${i} of ${loops}`);
      let retry = true;

      while (retry) {
        try {
          console.log("Wrapping MATIC to WMATIC...");
          const txResponse = await wmaticContract.deposit({ value: amountToWrap });
          console.log("✅ Transaction sent! Hash:", txResponse.hash);

          const receipt = await txResponse.wait();
          const lastTransactionHash = receipt.transactionHash;
          console.log("✅ WMATIC wrapped successfully! Transaction Hash:", txResponse.hash);

          const payload = {
            blockchainId: 137,
            type: 2,
            walletAddress: wallet.address,
            hash: txResponse.hash,
            fromTokenAddress: "0x0000000000000000000000000000000000000000",
            toTokenAddress: "0x0d500b1d8e8ef31e21c99d1db9a6444d3adf1270",
            fromTokenSymbol: "POL",
            toTokenSymbol: "WPOL",
            fromAmount: "150000000000000",
            toAmount: "150000000000000",
            gasFeeTokenAddress: "0x0000000000000000000000000000000000000000",
            gasFeeTokenSymbol: "POL",
            gasFeeAmount: "8055000012888000",
          };

          const response = await fetch(API_URL, {
            method: "POST",
            headers: HEADERS,
            body: JSON.stringify(payload),
          });

          if (!response.ok) {
            const errorText = await response.text();
            console.error(`❌ API Error: ${response.status} - ${errorText}`);
            retry = false;
          } else {
            const result = await response.json();
            console.log("✅ API Response:", result);
            retry = false;
          }
        } catch (error) {
          console.error(`❌ Error during transaction or API call:`, error.message);

          if (error.message.includes("Too many requests")) {
            console.log("⏳ Rate limit hit. Retrying in 1 minutes...");
            await delay(60000);
          } else {
            retry = false;
          }
        }
      }

      console.log("🕐 Waiting 1 minute before next transaction...");
      await delay(60000);
    }

  } catch (error) {
    console.error("Error occurred:", error.reason || error.message);
  }
}

main();
