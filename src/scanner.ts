import { readFileSync, existsSync, readdirSync, statSync } from "fs";
import { join, relative } from "path";
import { solidityRules } from "./rules/solidity";
import { dependencyRules } from "./rules/dependencies";
import type { Issue, ScanResult, Severity } from "./rules/types";

const CONFIG_FILES = [
  "hardhat.config.ts",
  "hardhat.config.js",
  "foundry.toml",
  "package.json",
];

function collectFiles(
  dir: string,
  predicate: (name: string) => boolean,
  results: string[] = [],
): string[] {
  let entries: string[];
  try {
    entries = readdirSync(dir);
  } catch {
    return results;
  }

  for (const entry of entries) {
    if (
      entry === "node_modules" ||
      entry === "dist" ||
      entry === "build" ||
      entry === "out" ||
      entry === "artifacts" ||
      entry === "cache" ||
      entry === ".git"
    ) {
      continue;
    }

    const full = join(dir, entry);
    let stat;
    try {
      stat = statSync(full);
    } catch {
      continue;
    }

    if (stat.isDirectory()) {
      collectFiles(full, predicate, results);
    } else if (predicate(entry)) {
      results.push(full);
    }
  }

  return results;
}

function scanLine(
  content: string,
  lineNum: number,
  filePath: string,
  rules: typeof solidityRules,
): Issue[] {
  const issues: Issue[] = [];

  for (const rule of rules) {
    if (rule.pattern.test(content)) {
      const match = content.match(rule.pattern);
      issues.push({
        severity: rule.severity,
        ruleId: rule.id,
        file: filePath,
        line: lineNum,
        match: match ? match[0] : "",
        title: rule.title,
        detail: rule.detail,
        fix: rule.fix,
        url: rule.url,
      });
    }
  }

  return issues;
}

function deduplicateIssues(issues: Issue[]): Issue[] {
  const severityOrder: Record<Severity, number> = {
    critical: 0,
    high: 1,
    moderate: 2,
    info: 3,
  };

  const groups = new Map<string, Issue[]>();
  for (const issue of issues) {
    const key = `${issue.file}:${issue.line}:${issue.ruleId}:${issue.match}`;
    const group = groups.get(key) ?? [];
    group.push(issue);
    groups.set(key, group);
  }

  const result: Issue[] = [];
  for (const group of groups.values()) {
    if (group.length === 1) {
      result.push(group[0]);
    } else {
      group.sort(
        (a, b) => severityOrder[a.severity] - severityOrder[b.severity],
      );
      result.push(group[0]);
    }
  }

  return result;
}

export function scan(targetDir: string): ScanResult {
  if (!existsSync(targetDir)) {
    throw new Error(`Directory not found: ${targetDir}`);
  }

  const issues: Issue[] = [];

  const solFiles = collectFiles(targetDir, (name) => name.endsWith(".sol"));

  for (const filePath of solFiles) {
    const relPath = relative(targetDir, filePath);
    let content: string;
    try {
      content = readFileSync(filePath, "utf8");
    } catch {
      continue;
    }

    const lines = content.split("\n");
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      if (line.trimStart().startsWith("//")) continue;
      if (line.trimStart().startsWith("*") || line.trimStart().startsWith("/*"))
        continue;

      const lineIssues = scanLine(line, i + 1, relPath, solidityRules);
      issues.push(...lineIssues);
    }
  }

  const configFiles: string[] = [];

  for (const configName of CONFIG_FILES) {
    const configPath = join(targetDir, configName);
    if (existsSync(configPath)) {
      configFiles.push(configPath);
    }
  }

  for (const configPath of configFiles) {
    const relPath = relative(targetDir, configPath);
    let content: string;
    try {
      content = readFileSync(configPath, "utf8");
    } catch {
      continue;
    }

    const lines = content.split("\n");
    for (let i = 0; i < lines.length; i++) {
      const lineIssues = scanLine(lines[i], i + 1, relPath, dependencyRules);
      issues.push(...lineIssues);
    }
  }

  const dedupedIssues = deduplicateIssues(issues);

  const severityOrder: Record<Severity, number> = {
    critical: 0,
    high: 1,
    moderate: 2,
    info: 3,
  };
  dedupedIssues.sort(
    (a, b) => severityOrder[a.severity] - severityOrder[b.severity],
  );

  const summary: Record<Severity, number> = {
    critical: 0,
    high: 0,
    moderate: 0,
    info: 0,
  };
  for (const issue of dedupedIssues) {
    summary[issue.severity]++;
  }

  return {
    version: "0.1.0",
    issues: dedupedIssues,
    summary,
    totalFiles: solFiles.length + configFiles.length,
    solidityFiles: solFiles.length,
    configFiles: configFiles.length,
  };
}
