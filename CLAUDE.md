# megaeth-audit

Solidity contract and project scanner for MegaETH (OP Stack L2).

## Commands

- `npm run build` — Build with tsup (CJS + ESM + types)
- `npm test` — Run vitest tests
- `npm run lint` — Type check with tsc

## Architecture

- `src/scanner.ts` — Core: recursive file walker, regex line scanner, deduplication
- `src/rules/solidity.ts` — 11 Solidity rules (MGA001-MGA011)
- `src/rules/dependencies.ts` — 8 dependency rules (DEP001-DEP008)
- `src/reporter.ts` — ANSI terminal + JSON output
- `src/cli.ts` — Commander CLI with severity filtering
- `bin/megaeth-audit.ts` — CLI entry point

## Key concept

MegaETH's biggest gotcha is the dual gas model (compute + storage). MGA001 is critical severity because hardcoded 21000 gas will fail (minimum is 60,000). Rules also cover volatile opcode throttling (20M compute cap), 98/100 gas forwarding, 1-second block times, centralized sequencer randomness, and EigenDA (no EIP-4844 blobs).

## Adding rules

Add a new object to `src/rules/solidity.ts` or `src/rules/dependencies.ts` with id, target, severity, pattern (RegExp), title, detail, fix, and optional url.

## Test fixtures

- `test/fixtures/clean/` — Should produce zero non-info issues
- `test/fixtures/vulnerable/` — Should trigger rules from every severity category

## Conventions

- Pure TypeScript, no runtime deps except commander
- Regex-based scanning (no AST parsing)
- Exit code 2 for critical, 1 for high/moderate, 0 for clean
