import { Command } from "commander";
import { resolve } from "path";
import { scan } from "./scanner";
import { formatHuman, formatJson } from "./reporter";
import type { Severity } from "./rules/types";

const SEVERITY_ORDER: Severity[] = ["critical", "high", "moderate", "info"];

export function cli(argv: string[]): void {
  const program = new Command();

  program
    .name("megaeth-audit")
    .description(
      "Solidity contract and project scanner for MegaETH. Catches dual gas model issues, volatile opcode throttling, and EVM incompatibilities before deployment.",
    )
    .version("0.1.0")
    .argument("[path]", "Path to project directory", ".")
    .option("--json", "Output as JSON")
    .option(
      "--severity <level>",
      "Minimum severity to report (critical, high, moderate, info)",
      "info",
    )
    .action((targetPath, opts) => {
      const resolvedPath = resolve(targetPath);

      try {
        const result = scan(resolvedPath);

        const minSeverity = opts.severity as Severity;
        const minIndex = SEVERITY_ORDER.indexOf(minSeverity);
        if (minIndex > 0) {
          result.issues = result.issues.filter(
            (i) => SEVERITY_ORDER.indexOf(i.severity) <= minIndex,
          );
          result.summary = { critical: 0, high: 0, moderate: 0, info: 0 };
          for (const issue of result.issues) {
            result.summary[issue.severity]++;
          }
        }

        if (opts.json) {
          console.log(formatJson(result));
        } else {
          console.log(formatHuman(result));
        }

        if (result.summary.critical > 0) {
          process.exit(2);
        } else if (result.summary.high > 0 || result.summary.moderate > 0) {
          process.exit(1);
        }
      } catch (err: unknown) {
        console.error(`Error: ${err instanceof Error ? err.message : String(err)}`);
        process.exit(1);
      }
    });

  program.parse(argv);
}
