import { ethers, SigningKey } from "ethers";
import fs from "fs";
// Load the private key from a JSON file
const devWallet = JSON.parse(
  fs.readFileSync("./data/testnet_wallet.json", "utf-8")
);

// Function to broadcast the signed transaction using eth_sendRawTransaction
async function broadcastTransaction(signedTx: string) {
  const provider = new ethers.JsonRpcProvider(
    "https://eth-sepolia.public.blastapi.io"
  );

  try {
    const txResponse = await provider.send("eth_sendRawTransaction", [
      signedTx,
    ]);
    console.log("Transaction Hash:", txResponse);
    return txResponse;
  } catch (error) {
    console.error("Error broadcasting transaction:", error);
    throw error;
  }
}

// Create the unsigned transaction and get it signed externally
async function createTransaction() {
  const provider = new ethers.JsonRpcProvider(
    "https://eth-sepolia.public.blastapi.io"
  );
  const fromAddress = devWallet.address; // Set the sender's address
  const wallet = new ethers.VoidSigner(fromAddress, provider);

  // Check the balance before proceeding
  const balance = await provider.getBalance(fromAddress);
  console.log("Wallet balance:", ethers.formatEther(balance), "ETH");

  if (balance === 0n) {
    console.error(
      "Error: Wallet balance is zero. Please add some Sepolia ETH to your wallet."
    );
    return;
  }

  // Construct the unsigned transaction object
  const unsignedTx = {
    nonce: await wallet.getNonce(),
    gasLimit: 21000, // Typical gas limit for a simple transfer
    maxFeePerGas: (await provider.getFeeData()).maxFeePerGas,
    maxPriorityFeePerGas: (await provider.getFeeData()).maxPriorityFeePerGas,
    to: "0xeCB8e0Bc19630a78AabD1AB4b37B1608342F2e4E", // Replace with the recipient address
    value: ethers.parseEther("0.01"), // Replace with the amount to send
    data: "0x",
    chainId: 11155111, // Sepolia testnet chain ID
  };

  // Create the Transaction object
  const tx = ethers.Transaction.from(unsignedTx);

  // Get the unsigned transaction hash
  const unsignedTransactionHash = tx.unsignedHash;
  console.log("Unsigned Transaction Hash:", unsignedTransactionHash);

  // Get the signature from the external signer
  const signature = await getSignedTransactionFromExternalSigner(
    unsignedTransactionHash
  );

  // Assign the signature to the transaction
  tx.signature = signature;

  // Serialize the signed transaction
  const serializedSignedTx = tx.serialized;
  console.log("Serialized Signed Transaction:", serializedSignedTx);

  // Broadcast the signed transaction
  const result = await broadcastTransaction(serializedSignedTx);
  console.log("Transaction Result:", result);
}

// Function for getting the signed transaction from an external signer
async function getSignedTransactionFromExternalSigner(
  unsignedTransactionHash: string
): Promise<ethers.Signature> {
  console.log("Signing unsigned transaction hash...");
  const privateKey = devWallet.privateKey;
  // Sign the unsigned transaction hash
  const signingKey = new SigningKey(privateKey);
  const signature = signingKey.sign(unsignedTransactionHash);

  console.log("Signature:", signature);
  return signature;
}

// Execute the transaction creation and broadcasting process
createTransaction();
