export type FheStageKey =
  | "prepare-client"
  | "encrypt-input"
  | "submit-ciphertext"
  | "blind-computation"
  | "decrypt-output"
  | "fallback-mode";

export type FheStage = {
  key: FheStageKey;
  label: string;
  summary: string;
  insight: string;
  icon: string;
  order: number;
  isProgress: boolean;
};

export const FHE_PROGRESS_STAGES: FheStage[] = [
  {
    key: "prepare-client",
    label: "Generate client keys",
    summary: "Browser initializes the FHE client and loads your key material.",
    insight: "Keys never leave the device; the chain only sees ciphertext.",
    icon: "🔐",
    order: 1,
    isProgress: true,
  },
  {
    key: "encrypt-input",
    label: "Encrypt your choice",
    summary: "Your move is transformed into ciphertext using the FHE public key.",
    insight: "Plaintext moves are never written to disk or transmitted in clear text.",
    icon: "📝",
    order: 2,
    isProgress: true,
  },
  {
    key: "submit-ciphertext",
    label: "Broadcast ciphertext",
    summary: "The encrypted payload is sent to the smart contract together with a proof.",
    insight: "Validators verify correctness without seeing your original value.",
    icon: "⛓️",
    order: 3,
    isProgress: true,
  },
  {
    key: "blind-computation",
    label: "Blind computation",
    summary: "The contract compares encrypted values and computes an encrypted result.",
    insight: "Business logic runs on ciphertext; no observer learns the moves.",
    icon: "🔍",
    order: 4,
    isProgress: true,
  },
  {
    key: "decrypt-output",
    label: "Local decryption",
    summary: "Your browser decrypts the outcome using the private key.",
    insight: "Only you can reveal the result; the chain remains oblivious.",
    icon: "🔓",
    order: 5,
    isProgress: true,
  },
];

export const FHE_EXTRA_STAGES: FheStage[] = [
  {
    key: "fallback-mode",
    label: "Fallback to demo flow",
    summary: "The app switched to a deterministic mock response because FHE services were unreachable.",
    insight: "Use this mode for UX exploration only; on-chain privacy is disabled.",
    icon: "⚠️",
    order: 99,
    isProgress: false,
  },
];

export const ALL_FHE_STAGES: FheStage[] = [...FHE_PROGRESS_STAGES, ...FHE_EXTRA_STAGES];

export const getStageByKey = (key: FheStageKey): FheStage => {
  const stage = ALL_FHE_STAGES.find((item) => item.key === key);

  if (!stage) {
    throw new Error(`Unknown FHE stage: ${key}`);
  }

  return stage;
};
