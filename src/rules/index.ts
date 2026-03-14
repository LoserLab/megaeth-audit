import { solidityRules } from "./solidity";
import { configRules } from "./config";
import { dependencyRules } from "./dependencies";
import type { Rule } from "./types";

export const allRules: Rule[] = [...solidityRules, ...configRules, ...dependencyRules];

export { solidityRules, configRules, dependencyRules };
export type { Rule, Severity, Issue, ScanResult, RuleTarget } from "./types";
