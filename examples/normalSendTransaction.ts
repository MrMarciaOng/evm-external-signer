import { ethers } from "ethers";
import fs from "fs";

// Load the private key from a JSON file
const devWallet = JSON.parse(
  fs.readFileSync("./data/testnet_wallet.json", "utf-8")
);

async function createTransaction() {
  const provider = new ethers.JsonRpcProvider(
    "https://eth-sepolia.public.blastapi.io"
  );
  const wallet = new ethers.Wallet(devWallet.privateKey, provider);

  // Get the current balance
  const balance = await provider.getBalance(wallet.address);
  console.log("Wallet balance:", ethers.formatEther(balance), "ETH");

  // Fetch the current fee data
  const feeData = await provider.getFeeData();
  console.log("Fee data:", feeData);

  // Setup the transaction details
  const unsignedTx = {
    nonce: await wallet.getNonce(),
    gasLimit: 21000, // Typical gas limit for a simple transfer
    maxFeePerGas: feeData.maxFeePerGas,
    maxPriorityFeePerGas: feeData.maxPriorityFeePerGas,
    to: "0xeCB8e0Bc19630a78AabD1AB4b37B1608342F2e4E",
    value: ethers.parseEther("0.01"),
    data: "0x",
    chainId: 11155111, // Sepolia testnet
  };

  // Estimate the gas limit for the transaction
  const estimatedGas = await provider.estimateGas(unsignedTx);
  console.log("Estimated gas:", estimatedGas.toString());

  // Calculate the total cost with a buffer to handle gas price fluctuations
  unsignedTx.gasLimit = ethers.toNumber(BigInt(estimatedGas)); // Update the gas limit with the estimated value
  if (unsignedTx.maxFeePerGas) {
    const gasBuffer = unsignedTx.maxFeePerGas / BigInt(100); // 1% buffer
    unsignedTx.maxFeePerGas += gasBuffer; // Add the buffer
  }

  const estimatedGasCost =
    BigInt(estimatedGas) * (unsignedTx.maxFeePerGas || BigInt(0));
  const totalCost = unsignedTx.value + estimatedGasCost;
  console.log("Total cost with buffer:", ethers.formatEther(totalCost), "ETH");

  // Send the transaction
  const response = await wallet.sendTransaction(unsignedTx);
  console.log("Transaction response:", response);
}

createTransaction();
