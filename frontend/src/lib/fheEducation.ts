import type { FheStageKey } from "@/lib/fheStages";

type QuizOption = {
  label: string;
  isCorrect: boolean;
  helper?: string;
};

export type FheEducationStep = {
  id: number;
  title: string;
  headline: string;
  description: string;
  keyTakeaway: string;
  codeSnippet?: {
    language: string;
    code: string;
    title: string;
  };
  stageKey?: FheStageKey;
  quiz?: {
    question: string;
    options: QuizOption[];
  };
};

export const FHE_EDUCATION_STEPS: FheEducationStep[] = [
  {
    id: 1,
    title: "🔑 Client keys",
    headline: "Your browser boots the FHE client and prepares a fresh key set.",
    description:
      "The Zama SDK generates a session-bound key pair on the user's device. The public key handles encryption, while the secret key never leaves memory and is used only for local decryption.",
    keyTakeaway:
      "Key generation happens off-chain, so the network only ever receives ciphertext.",
    stageKey: "prepare-client",
    codeSnippet: {
      title: "Client bootstrap",
      language: "typescript",
      code: `// Runs inside the browser
const fheClient = await Fhevm.create();
const { publicKey, secretKey } = await fheClient.generateKeys();
// 🔐 keep the secret key in memory instead of persisting it`,
    },
    quiz: {
      question: "What is the public key responsible for?",
      options: [
        {
          label: "Decrypting the encrypted result",
          isCorrect: false,
          helper: "Decryption is performed with the secret key that stays on the device.",
        },
        {
          label: "Encrypting user data",
          isCorrect: true,
          helper: "The public key encrypts your move before it is sent to the contract.",
        },
        {
          label: "Reducing gas costs",
          isCorrect: false,
          helper: "Key choice does not directly change the gas you pay.",
        },
      ],
    },
  },
  {
    id: 2,
    title: "🔒 Encrypt and prepare",
    headline: "The raw move is encrypted locally before it goes anywhere.",
    description:
      "Your chosen move is converted into a homomorphic data type with the public key. The plaintext never leaves the client during this step.",
    keyTakeaway:
      "Even prior to transmission the network never sees the raw value—only you do.",
    stageKey: "encrypt-input",
    codeSnippet: {
      title: "Encrypting the move",
      language: "typescript",
      code: `const move = 0; // Rock
const encryptedMove = await fheClient.encryptUInt8(move);
// Output example: E(0x3f) style ciphertext string`,
    },
    quiz: {
      question: "Where does encryption take place?",
      options: [
        {
          label: "Inside the smart contract",
          isCorrect: false,
          helper: "Contracts only receive ciphertext—encryption happens on the client.",
        },
        {
          label: "In the browser or client app",
          isCorrect: true,
          helper: "The user's device encrypts the data using the public key.",
        },
        {
          label: "Directly on validator nodes",
          isCorrect: false,
        },
      ],
    },
  },
  {
    id: 3,
    title: "📡 Broadcast to chain",
    headline: "You sign the transaction containing the ciphertext and proof.",
    description:
      "The payload is sent with a lightweight validity proof so validators can check the structure without seeing the plaintext. The contract only ever receives the encrypted package.",
    keyTakeaway:
      "Public chains expose transactions, yet your data remains encrypted end-to-end.",
    stageKey: "submit-ciphertext",
    codeSnippet: {
      title: "Preparing the transaction",
      language: "solidity",
      code: `function makeMove(euint8 encryptedMove) public {
    // Encrypted move reaches the chain
    latestCiphertext[msg.sender] = encryptedMove;
}`,
    },
    quiz: {
      question: "What does the validator get to inspect?",
      options: [
        {
          label: "The raw move",
          isCorrect: false,
        },
        {
          label: "The encrypted move plus a validity proof",
          isCorrect: true,
          helper: "Ciphertext and its proof are enough—plaintext never appears on-chain.",
        },
        {
          label: "Your secret key",
          isCorrect: false,
        },
      ],
    },
  },
  {
    id: 4,
    title: "🧮 Blind computation",
    headline: "The contract computes the result without seeing plaintext.",
    description:
      "FHEVM exposes enriched data types such as `euint8` that support arithmetic and comparisons directly on ciphertext. Business logic runs normally, only on encrypted values.",
    keyTakeaway:
      "Contract logic stays auditable while player data stays private.",
    stageKey: "blind-computation",
    codeSnippet: {
      title: "Homomorphic comparison",
      language: "solidity",
      code: `euint8 result = playerMove.eq(computerMove);
// result remains encrypted: E(true) or E(false)`,
    },
    quiz: {
      question: "Does the contract ever see plaintext at this stage?",
      options: [
        {
          label: "Yes, to perform the comparison",
          isCorrect: false,
        },
        {
          label: "No, everything runs on ciphertext",
          isCorrect: true,
          helper: "Homomorphic operations remove the need to expose raw values.",
        },
        {
          label: "Validators peek at plaintext for a moment",
          isCorrect: false,
        },
      ],
    },
  },
  {
    id: 5,
    title: "📬 Decrypt locally",
    headline: "Only your device can decrypt the final outcome.",
    description:
      "The contract returns ciphertext which you decrypt locally with the secret key. No other participant learns whether you won or lost.",
    keyTakeaway:
      "Encrypted results travel across the chain, but only the player can reveal them.",
    stageKey: "decrypt-output",
    codeSnippet: {
      title: "Decrypting the result",
      language: "typescript",
      code: `const encryptedResult = await contract.getResult(gameId);
const didWin = await fheClient.decryptBool(encryptedResult);
console.log(didWin ? "You won" : "You lost");`,
    },
    quiz: {
      question: "Who can decrypt the outcome?",
      options: [
        {
          label: "Any validator",
          isCorrect: false,
        },
        {
          label: "Whoever holds the player's secret key",
          isCorrect: true,
          helper: "The secret key stays on the client, so only the player can decrypt.",
        },
        {
          label: "The smart contract itself",
          isCorrect: false,
        },
      ],
    },
  },
  {
    id: 6,
    title: "⚙️ Performance tips",
    headline: "FHE workloads are heavier—be intentional with gas and latency.",
    description:
      "Expect 3–5× more computation compared to plaintext flows. Keep contracts lean, avoid on-chain loops, and push preprocessing off-chain whenever possible.",
    keyTakeaway:
      "Optimised circuits and batching strategies are essential for production deployments.",
    codeSnippet: {
      title: "Reducing gas pressure",
      language: "solidity",
      code: `// Prepare heavy work off-chain first
struct EncryptedPayload { euint8 move; ebool saltProof; }
// Send only validated, minimal payloads on-chain`,
    },
    quiz: {
      question: "What is the quickest win for performance?",
      options: [
        {
          label: "Reducing on-chain loops",
          isCorrect: true,
          helper: "Homomorphic operations are costly—loops amplify that cost fast.",
        },
        {
          label: "Shipping the secret key on-chain",
          isCorrect: false,
        },
        {
          label: "Skipping the encryption step",
          isCorrect: false,
        },
      ],
    },
  },
];

export type GlossaryEntry = {
  term: string;
  definition: string;
};

export const FHE_GLOSSARY: GlossaryEntry[] = [
  {
    term: "Ciphertext",
    definition: "The encrypted representation of data produced from plaintext; meaningless without the matching key.",
  },
  {
    term: "FHE",
    definition: "Fully Homomorphic Encryption; a cryptographic scheme that supports computations directly on encrypted data.",
  },
  {
    term: "Public/Secret key",
    definition: "The public key encrypts data for anyone, while the secret key lets only the owner decrypt the result.",
  },
  {
    term: "Relayer",
    definition: "A service that intermediates between the client and the chain, often handling heavy FHE preprocessing steps.",
  },
  {
    term: "Bootstrapping",
    definition: "A costly FHE procedure that refreshes ciphertext noise so additional homomorphic operations remain accurate.",
  },
  {
    term: "Plaintext",
    definition: "The original, unencrypted input data (e.g., a number or boolean) before it is transformed into ciphertext.",
  },
  {
    term: "Noise",
    definition: "Random data added during encryption to ensure security. It grows with every operation and must be managed via bootstrapping.",
  },
  {
    term: "Evaluation Key",
    definition: "A special public key that allows the network (or server) to perform homomorphic operations, such as bootstrapping, on ciphertexts.",
  },
  {
    term: "TFHE",
    definition: "Torus Fully Homomorphic Encryption; a fast FHE scheme optimized for boolean and integer arithmetic, used by Zama.",
  },
  {
    term: "fhEVM",
    definition: "An EVM extension that integrates FHE capabilities, allowing smart contracts to compute on encrypted data natively.",
  },
  {
    term: "Homomorphic Addition",
    definition: "An operation where adding two ciphertexts results in a new ciphertext that decrypts to the sum of the original plaintexts.",
  },
  {
    term: "Re-encryption",
    definition: "The process of securely converting a ciphertext from the network's key to the user's key so they can decrypt the result.",
  },
];
