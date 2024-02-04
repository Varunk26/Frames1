import { EAS, SchemaEncoder } from "@ethereum-attestation-service/eas-sdk";
import { ethers } from 'ethers';
import 'dotenv/config'

// Configuration constants
const EAS_CONTRACT_ADDRESS = "0xC2679fBD37d54388Ce493F1DB75320D236e1815e"; // Sepolia v0.26 address

async function attest() {
    try {
        // Initialize provider and signer
        const provider = new ethers.JsonRpcProvider(process.env.QUICKNODE_ENDPOINT);
        const signer = new ethers.Wallet(process.env.WALLET_PRIVATE_KEY, provider);
        const eas = new EAS(EAS_CONTRACT_ADDRESS);
        eas.connect(signer);

        // Initialize SchemaEncoder with the schema string
        const schemaEncoder = new SchemaEncoder("uint256 pollId, string about, string feeling, string dateOfPoll"); // e.g., bytes32 contentHash, string urlOfContent
        const encodedData = schemaEncoder.encodeData([
            { name: "pollId", value: "1", type: "uint256" }, 
            { name: "about", value: "Crypto Today", type: "string" },
            { name: "feeling", value: "Neutral", type: "string" },
            { name: "dateOfPoll", value: "4th Feb 2024", type: "string" },
            /*
            In our example schema we provided, it would look something like this:
            { name: "contentHash", value: "0x2d2d2d0a617574686f723a20466572686174204b6f6368616e0a...", type: "bytes32" },
            { name: "urlOfContent", value: "quicknode.com/guides/ethereum-development/smart-contracts/what-is-ethereum-attestation-service-and-how-to-use-it", type: "string" },
            */
        ]);

        const schemaUID = "0x32bb7727b5d0ba7f8851cc67439dfbc90ec1549a749ef329e42c0c298868c627"; // The UID of the schema. The content schema is: 0x43183473396f22ec78464231c356f1763e89e0f5393261dd142ef8bc79a147be

        // Send transaction
        const tx = await eas.attest({
            schema: schemaUID,
            data: {
                recipient: "0x229922ef85a6660054F0e6cF67b3580635056c15", // The Ethereum address of the recipient of the attestation
                expirationTime: 0,
                revocable: true, // Note that if your schema is not revocable, this MUST be false
                data: encodedData,
            },
        });

        const newAttestationUID = await tx.wait();
        console.log("New attestation UID:", newAttestationUID);
    } catch (error) {
        console.error("An error occurred:", error);
    }
}

attest();