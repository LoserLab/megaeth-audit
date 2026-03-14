import type { Rule } from "./types";

export const solidityRules: Rule[] = [
  // ── Critical ────────────────────────────────────────────────
  {
    id: "MGA001",
    target: "solidity",
    severity: "critical",
    pattern: /\b21000\b|0x5208/,
    title: "Hardcoded 21000 gas is insufficient on MegaETH",
    detail:
      "MegaETH uses a dual gas model (compute + storage). A simple ETH transfer costs 60,000 gas minimum (21,000 compute + 39,000 storage). Hardcoding 21000 will cause 'intrinsic gas too low' errors.",
    fix: "Use eth_estimateGas via MegaETH RPC. Minimum gas for any transaction is 60,000.",
    url: "https://docs.megaeth.com/megaevm",
  },

  // ── High ────────────────────────────────────────────────────
  {
    id: "MGA002",
    target: "solidity",
    severity: "high",
    pattern: /\bblock\.(number|timestamp|coinbase|difficulty|gaslimit|basefee|prevrandao)\b|BLOCKHASH/,
    title: "Volatile opcode caps remaining compute gas to 20M on MegaETH",
    detail:
      "On MegaETH, accessing block.number, block.timestamp, block.coinbase, or similar volatile data caps the transaction's remaining compute gas to 20,000,000. The sequencer cannot produce a new block until the transaction finishes. Place heavy computation BEFORE volatile data reads.",
    fix: "Read volatile data (block.timestamp, block.number, etc.) as late as possible in execution. Restructure to minimize computation after volatile access.",
    url: "https://docs.megaeth.com/megaevm",
  },
  {
    id: "MGA003",
    target: "solidity",
    severity: "high",
    pattern: /63\s*\/\s*64|1\s*\/\s*64/,
    title: "MegaETH uses 98/100 gas forwarding, not Ethereum's 63/64",
    detail:
      "MegaETH forwards 98/100 of remaining gas to callees instead of Ethereum's 63/64 rule. Contracts relying on the 63/64 rule to reserve gas in the caller for post-call safety checks may be vulnerable.",
    fix: "Do not rely on 63/64 gas retention. Use explicit gas limits when calling untrusted contracts.",
    url: "https://docs.megaeth.com/megaevm",
  },
  {
    id: "MGA004",
    target: "solidity",
    severity: "high",
    pattern: /\bselfdestruct\s*\(/,
    title: "selfdestruct only works in creation transaction (EIP-6780)",
    detail:
      "On MegaETH (Prague-based EVM), selfdestruct only destroys contracts if called in the same transaction as CREATE/CREATE2. Otherwise it just sends funds without removing bytecode.",
    fix: "Do not rely on selfdestruct to clear contract state. Use a paused/disabled pattern instead.",
    url: "https://docs.megaeth.com/megaevm",
  },
  {
    id: "MGA005",
    target: "solidity",
    severity: "high",
    pattern: /7200|50400|216000/,
    title: "Hardcoded block count assumes 12-second blocks",
    detail:
      "MegaETH EVM blocks are produced every ~1 second. Constants like 7200 (1 day at 12s) resolve to ~2 hours on MegaETH, not 1 day.",
    fix: "Use block.timestamp for time-based logic, or adjust block counts for 1-second block times (86,400 blocks/day on MegaETH).",
    url: "https://docs.megaeth.com/megaevm",
  },
  {
    id: "MGA006",
    target: "solidity",
    severity: "high",
    pattern: /\bprevrandao\b/,
    title: "prevrandao is not reliable randomness on MegaETH",
    detail:
      "MegaETH uses a centralized sequencer. The prevrandao value may be predictable or directly controlled by the sequencer operator.",
    fix: "Use a VRF oracle (Chainlink VRF, Pyth VRF) or a commit-reveal scheme for randomness.",
    url: "https://docs.megaeth.com/megaevm",
  },
  {
    id: "MGA007",
    target: "solidity",
    severity: "high",
    pattern: /\bblock\.coinbase\b/,
    title: "block.coinbase is the sequencer address on MegaETH",
    detail:
      "On MegaETH, block.coinbase returns the centralized sequencer address. It does not vary between blocks and should not be used for randomness or varying identification.",
    fix: "Do not rely on block.coinbase for randomness or unique identification across blocks.",
    url: "https://docs.megaeth.com/megaevm",
  },
  {
    id: "MGA008",
    target: "solidity",
    severity: "high",
    pattern: /\bBLOBBASEFEE\b|block\.blobbasefee|BLOBHASH|blobhash/i,
    title: "Blob opcodes are not supported on MegaETH",
    detail:
      "MegaETH uses EigenDA for data availability, not EIP-4844 blobs. BLOBBASEFEE and BLOBHASH opcodes are not meaningful on MegaETH.",
    fix: "Do not use blob-related opcodes on MegaETH. Use EigenDA for data availability needs.",
    url: "https://docs.megaeth.com/megaevm",
  },

  // ── Moderate ────────────────────────────────────────────────
  {
    id: "MGA009",
    target: "solidity",
    severity: "moderate",
    pattern: /\bgasleft\s*\(\s*\)/,
    title: "gasleft() only reflects compute gas, not storage gas",
    detail:
      "On MegaETH's dual gas model, gasleft() returns remaining compute gas only. It does not account for the storage gas dimension. Metering or gas estimation logic based on gasleft() will be incomplete.",
    fix: "Account for both compute and storage gas dimensions. Do not use gasleft() as a complete gas measure on MegaETH.",
    url: "https://docs.megaeth.com/megaevm",
  },
  {
    id: "MGA010",
    target: "solidity",
    severity: "moderate",
    pattern: /\bblock\.difficulty\b/,
    title: "block.difficulty maps to prevrandao on MegaETH",
    detail:
      "Post-merge, block.difficulty maps to prevrandao. On MegaETH with a centralized sequencer, this value may be predictable or controlled.",
    fix: "Do not use block.difficulty for randomness. Use a VRF oracle or commit-reveal scheme.",
    url: "https://docs.megaeth.com/megaevm",
  },

  // ── Info ────────────────────────────────────────────────────
  {
    id: "MGA011",
    target: "solidity",
    severity: "info",
    pattern: /pragma solidity/,
    title: "Verify EVM version compatibility with MegaETH",
    detail:
      "MegaETH Rex3 hardfork is Prague-based. Contract size limit is 512 KB (vs 24 KB on Ethereum). Initcode limit is 536 KB. Ensure your Solidity compiler targets a compatible EVM version.",
    fix: "Set evmVersion to 'prague' or later in your compiler config. Max contract size is 512 KB on MegaETH.",
    url: "https://docs.megaeth.com/megaevm",
  },
];
