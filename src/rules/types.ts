export type Severity = "critical" | "high" | "moderate" | "info";

export type RuleTarget = "solidity" | "config";

export interface Rule {
  id: string;
  target: RuleTarget;
  severity: Severity;
  pattern: RegExp;
  title: string;
  detail: string;
  fix: string;
  url?: string;
}

export interface Issue {
  severity: Severity;
  ruleId: string;
  file: string;
  line: number;
  match: string;
  title: string;
  detail: string;
  fix: string;
  url?: string;
}

export interface ScanResult {
  version: string;
  issues: Issue[];
  summary: Record<Severity, number>;
  totalFiles: number;
  solidityFiles: number;
  configFiles: number;
}
