import { ethers } from "ethers";
import fs from "fs";

// Load the private key from a JSON file
const devWallet = JSON.parse(
  fs.readFileSync("./data/testnet_wallet.json", "utf-8")
);

// Function to sign the txHash using a mock function
async function signAndSend(txHash: string, unsignedTx: any) {
  const provider = new ethers.JsonRpcProvider(
    "https://eth-sepolia.public.blastapi.io"
  );
  const thePrivateKey = devWallet.privateKey; // Replace with another private key if needed
  const theWallet = new ethers.Wallet(thePrivateKey, provider);
  const signature = await theWallet.signMessage(ethers.getBytes(txHash));
  // console.log("Signature:", signature);
  //send the transaction on chain
  const response = await theWallet.sendTransaction(unsignedTx);

  return response;
}

async function createTransaction() {
  const provider = new ethers.JsonRpcProvider(
    "https://eth-sepolia.public.blastapi.io"
  );
  const wallet = new ethers.VoidSigner(devWallet.address, provider);

  // Check the balance before proceeding
  const balance = await provider.getBalance(devWallet.address);
  console.log("Wallet balance:", ethers.formatEther(balance), "ETH");

  if (balance === 0n) {
    console.error(
      "Error: Wallet balance is zero. Please add some Sepolia ETH to your wallet."
    );
    return;
  }

  const unsignedTx = {
    nonce: await wallet.getNonce(),
    gasLimit: 21000, // Typical gas limit for a simple transfer
    maxFeePerGas: (await provider.getFeeData()).maxFeePerGas,
    maxPriorityFeePerGas: (await provider.getFeeData()).maxPriorityFeePerGas,
    to: "0xeCB8e0Bc19630a78AabD1AB4b37B1608342F2e4E",
    value: ethers.parseEther("0.01"),
    data: "0x",
    chainId: 11155111, // Sepolia testnet
  };

  // Serialize the unsigned transaction
  const serializedUnsignedTx =
    ethers.Transaction.from(unsignedTx).unsignedSerialized;
  console.log("Serialized Unsigned Transaction:", serializedUnsignedTx);

  // Generate the txHash
  const txHash = ethers.keccak256(serializedUnsignedTx);
  console.log("Transaction Hash (txHash):", txHash);

  // Sign the txHash
  const result = await signAndSend(txHash, unsignedTx);
  console.log(result);
}

createTransaction();
