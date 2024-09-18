# evm-external-signer
This project is a Proof of Concept (POC) demonstrating how to sign Ethereum transactions or transaction hashes using an external signer service. The signer service is designed to be extracted and integrated into an internal system, leveraging cloud-based Key Management Services (KMS) such as Google Cloud Platform (GCP) KMS or Amazon Web Services (AWS) KMS.


## Examples

This project includes two example implementations to demonstrate different approaches to transaction signing:

1. **Sign Transaction Payload (v4)**
   - File: `examples/v4 sign transaction payload.ts`
   - Description: This example demonstrates how to sign a complete transaction payload using an external signer service.

2. **Sign Transaction Hash (v5)**
   - File: `examples/v5 sign transaction hash.ts`
   - Description: This example shows how to sign only the transaction hash, which can be more efficient in certain scenarios.

These examples provide a practical reference for integrating external signing capabilities into your Ethereum-based applications. They showcase different methods of interacting with the signer service, allowing you to choose the approach that best fits your specific use case and security requirements.

To run these examples, navigate to the `examples` folder and follow the instructions provided in each file's comments.