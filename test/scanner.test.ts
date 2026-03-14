import { describe, it, expect } from "vitest";
import { join } from "path";
import { scan } from "../src/scanner";

const FIXTURES = join(__dirname, "fixtures");

describe("scanner", () => {
  describe("clean project", () => {
    it("should find no critical, high, or moderate issues", () => {
      const result = scan(join(FIXTURES, "clean"));
      const serious = result.issues.filter(
        (i) => i.severity !== "info",
      );
      expect(serious).toHaveLength(0);
    });

    it("should scan .sol files", () => {
      const result = scan(join(FIXTURES, "clean"));
      expect(result.solidityFiles).toBeGreaterThan(0);
    });

    it("should scan config files", () => {
      const result = scan(join(FIXTURES, "clean"));
      expect(result.configFiles).toBeGreaterThan(0);
    });

    it("should return correct version", () => {
      const result = scan(join(FIXTURES, "clean"));
      expect(result.version).toBe("0.1.0");
    });
  });

  describe("vulnerable project", () => {
    it("should find critical issues for hardcoded 21000 gas (MGA001)", () => {
      const result = scan(join(FIXTURES, "vulnerable"));
      const issues = result.issues.filter(
        (i) => i.ruleId === "MGA001",
      );
      expect(issues.length).toBeGreaterThan(0);
      expect(issues[0].severity).toBe("critical");
    });

    it("should find high issues for volatile opcode throttling (MGA002)", () => {
      const result = scan(join(FIXTURES, "vulnerable"));
      const issues = result.issues.filter(
        (i) => i.ruleId === "MGA002",
      );
      expect(issues.length).toBeGreaterThan(0);
      expect(issues[0].severity).toBe("high");
    });

    it("should find high issues for selfdestruct (MGA004)", () => {
      const result = scan(join(FIXTURES, "vulnerable"));
      const issues = result.issues.filter(
        (i) => i.ruleId === "MGA004",
      );
      expect(issues.length).toBeGreaterThan(0);
      expect(issues[0].severity).toBe("high");
    });

    it("should find high issues for hardcoded block count (MGA005)", () => {
      const result = scan(join(FIXTURES, "vulnerable"));
      const issues = result.issues.filter(
        (i) => i.ruleId === "MGA005",
      );
      expect(issues.length).toBeGreaterThan(0);
      expect(issues[0].severity).toBe("high");
    });

    it("should find high issues for prevrandao (MGA006)", () => {
      const result = scan(join(FIXTURES, "vulnerable"));
      const issues = result.issues.filter(
        (i) => i.ruleId === "MGA006",
      );
      expect(issues.length).toBeGreaterThan(0);
      expect(issues[0].severity).toBe("high");
    });

    it("should find high issues for block.coinbase (MGA007)", () => {
      const result = scan(join(FIXTURES, "vulnerable"));
      const issues = result.issues.filter(
        (i) => i.ruleId === "MGA007",
      );
      expect(issues.length).toBeGreaterThan(0);
      expect(issues[0].severity).toBe("high");
    });

    it("should find high issues for blob opcodes (MGA008)", () => {
      const result = scan(join(FIXTURES, "vulnerable"));
      const issues = result.issues.filter(
        (i) => i.ruleId === "MGA008",
      );
      expect(issues.length).toBeGreaterThan(0);
      expect(issues[0].severity).toBe("high");
    });

    it("should find moderate issues for gasleft (MGA009)", () => {
      const result = scan(join(FIXTURES, "vulnerable"));
      const issues = result.issues.filter(
        (i) => i.ruleId === "MGA009",
      );
      expect(issues.length).toBeGreaterThan(0);
      expect(issues[0].severity).toBe("moderate");
    });

    it("should find moderate issues for block.difficulty (MGA010)", () => {
      const result = scan(join(FIXTURES, "vulnerable"));
      const issues = result.issues.filter(
        (i) => i.ruleId === "MGA010",
      );
      expect(issues.length).toBeGreaterThan(0);
      expect(issues[0].severity).toBe("moderate");
    });

    it("should find high issues for deprecated @truffle (DEP003)", () => {
      const result = scan(join(FIXTURES, "vulnerable"));
      const issues = result.issues.filter(
        (i) => i.ruleId === "DEP003",
      );
      expect(issues.length).toBeGreaterThan(0);
      expect(issues[0].severity).toBe("high");
    });

    it("should find high issues for deprecated ganache (DEP004)", () => {
      const result = scan(join(FIXTURES, "vulnerable"));
      const issues = result.issues.filter(
        (i) => i.ruleId === "DEP004",
      );
      expect(issues.length).toBeGreaterThan(0);
      expect(issues[0].severity).toBe("high");
    });

    it("should find high issues for ethers v5 (DEP001)", () => {
      const result = scan(join(FIXTURES, "vulnerable"));
      const issues = result.issues.filter(
        (i) => i.ruleId === "DEP001",
      );
      expect(issues.length).toBeGreaterThan(0);
      expect(issues[0].severity).toBe("high");
    });

    it("should find moderate issues for old OZ contracts (DEP005)", () => {
      const result = scan(join(FIXTURES, "vulnerable"));
      const issues = result.issues.filter(
        (i) => i.ruleId === "DEP005",
      );
      expect(issues.length).toBeGreaterThan(0);
      expect(issues[0].severity).toBe("moderate");
    });

    it("should include file and line information", () => {
      const result = scan(join(FIXTURES, "vulnerable"));
      for (const issue of result.issues) {
        expect(issue.file).toBeTruthy();
        expect(issue.line).toBeGreaterThanOrEqual(0);
      }
    });

    it("should sort issues by severity", () => {
      const result = scan(join(FIXTURES, "vulnerable"));
      const severityOrder = { critical: 0, high: 1, moderate: 2, info: 3 };
      for (let i = 1; i < result.issues.length; i++) {
        expect(
          severityOrder[result.issues[i].severity],
        ).toBeGreaterThanOrEqual(
          severityOrder[result.issues[i - 1].severity],
        );
      }
    });

    it("should have correct summary counts", () => {
      const result = scan(join(FIXTURES, "vulnerable"));
      let critical = 0, high = 0, moderate = 0, info = 0;
      for (const issue of result.issues) {
        if (issue.severity === "critical") critical++;
        if (issue.severity === "high") high++;
        if (issue.severity === "moderate") moderate++;
        if (issue.severity === "info") info++;
      }
      expect(result.summary.critical).toBe(critical);
      expect(result.summary.high).toBe(high);
      expect(result.summary.moderate).toBe(moderate);
      expect(result.summary.info).toBe(info);
    });
  });

  describe("error handling", () => {
    it("should throw for non-existent directory", () => {
      expect(() => scan("/nonexistent/path")).toThrow("Directory not found");
    });
  });
});
