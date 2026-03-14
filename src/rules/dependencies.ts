import type { Rule } from "./types";

export const dependencyRules: Rule[] = [
  // ── High (Deprecated/sunset packages) ──────────────────────
  {
    id: "DEP001",
    target: "config",
    severity: "high",
    pattern: /"ethers":\s*"\^?5\./,
    title: "ethers v5 is end-of-life",
    detail:
      "ethers v5 is no longer maintained. It has known issues with modern EVM chains and missing support for newer transaction types.",
    fix: "Migrate to ethers v6 or (recommended) viem for better MegaETH compatibility.",
  },
  {
    id: "DEP002",
    target: "config",
    severity: "high",
    pattern: /"web3":\s*"\^?[0-3]\./,
    title: "web3.js < 4.0 is deprecated",
    detail:
      "web3.js versions before 4.0 are deprecated and no longer maintained. They lack support for modern EVM features.",
    fix: "Upgrade to web3.js v4+ or migrate to viem/ethers v6.",
  },
  {
    id: "DEP003",
    target: "config",
    severity: "high",
    pattern: /@truffle\//,
    title: "Truffle is sunset and no longer maintained",
    detail:
      "The Truffle Suite was officially sunset by Consensys in September 2023. It will not receive updates or security patches.",
    fix: "Migrate to Hardhat or Foundry.",
  },
  {
    id: "DEP004",
    target: "config",
    severity: "high",
    pattern: /ganache/,
    title: "Ganache is sunset and no longer maintained",
    detail:
      "Ganache was part of the Truffle Suite sunset. It is no longer maintained.",
    fix: "Use Hardhat Network or Anvil (Foundry) for local development.",
  },

  // ── Moderate ────────────────────────────────────────────────
  {
    id: "DEP005",
    target: "config",
    severity: "moderate",
    pattern: /@openzeppelin\/contracts":\s*"\^?[0-4]\./,
    title: "@openzeppelin/contracts < 5.0 is outdated",
    detail:
      "OpenZeppelin Contracts v5 introduced breaking changes and better Solidity 0.8.20+ support.",
    fix: "Upgrade to @openzeppelin/contracts v5+. See migration guide: docs.openzeppelin.com/contracts/5.x/upgradeable",
  },
  {
    id: "DEP006",
    target: "config",
    severity: "moderate",
    pattern: /@arbitrum\/sdk/,
    title: "@arbitrum/sdk is not relevant for MegaETH",
    detail:
      "MegaETH is an OP Stack L2, not an Arbitrum chain. The Arbitrum SDK has no functionality for MegaETH.",
    fix: "Remove @arbitrum/sdk. Use standard EVM tools (viem, ethers) for MegaETH development.",
  },
  {
    id: "DEP007",
    target: "config",
    severity: "moderate",
    pattern: /forge script|forge test/,
    title: "Foundry simulation won't account for MegaETH storage gas",
    detail:
      "Running forge script or forge test locally simulates standard EVM gas. MegaETH's dual gas model (compute + storage) is not replicated locally.",
    fix: "Always use MegaETH RPC for gas estimation. Use --skip-simulation with forge script when deploying.",
    url: "https://docs.megaeth.com/megaevm",
  },

  // ── Info ────────────────────────────────────────────────────
  {
    id: "DEP008",
    target: "config",
    severity: "info",
    pattern: /hardhat-deploy/,
    title: "Consider using MegaETH RPC for accurate gas estimation",
    detail:
      "While Hardhat works with MegaETH, local gas estimation will not account for the dual gas model. Always verify gas costs against MegaETH RPC.",
    fix: "Configure Hardhat to use MegaETH RPC for gas estimation and deployment.",
    url: "https://docs.megaeth.com/megaevm",
  },
];
