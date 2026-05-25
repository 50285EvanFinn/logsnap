import { describe, it, expect } from "vitest";
import {
  buildRedactorConfig,
  redactLine,
  redactLines,
} from "./redactor";
import {
  parseRedactorOptions,
  validateRedactorOptions,
} from "./redactorconfig";

describe("redactLine", () => {
  it("redacts email addresses", () => {
    const cfg = buildRedactorConfig();
    const result = redactLine("user: admin@example.com logged in", cfg);
    expect(result).not.toContain("admin@example.com");
    expect(result).toContain("[EMAIL]");
  });

  it("redacts IP addresses", () => {
    const cfg = buildRedactorConfig();
    const result = redactLine("request from 192.168.1.1 received", cfg);
    expect(result).toContain("[IP]");
    expect(result).not.toContain("192.168.1.1");
  });

  it("redacts credentials", () => {
    const cfg = buildRedactorConfig();
    const result = redactLine("token=abc123secret", cfg);
    expect(result).toContain("[CREDENTIAL]");
  });

  it("applies custom placeholder", () => {
    const cfg = buildRedactorConfig([], "***");
    const result = redactLine("contact user@test.org now", cfg);
    expect(result).toContain("***");
  });

  it("applies extra custom rules", () => {
    const cfg = buildRedactorConfig([
      { pattern: /ORDER-\d+/g, replacement: "[ORDER]" },
    ]);
    const result = redactLine("processed ORDER-99821", cfg);
    expect(result).toContain("[ORDER]");
    expect(result).not.toContain("ORDER-99821");
  });

  it("returns line unchanged when no matches", () => {
    const cfg = buildRedactorConfig();
    const line = "nothing sensitive here";
    expect(redactLine(line, cfg)).toBe(line);
  });
});

describe("redactLines", () => {
  it("redacts all lines in array", () => {
    const cfg = buildRedactorConfig();
    const lines = ["hello world", "email: foo@bar.com"];
    const result = redactLines(lines, cfg);
    expect(result[0]).toBe("hello world");
    expect(result[1]).toContain("[EMAIL]");
  });
});

describe("parseRedactorOptions", () => {
  it("parses plain string patterns", () => {
    const opts = parseRedactorOptions({ patterns: ["SECRET"] });
    expect(opts.rules).toHaveLength(1);
  });

  it("parses regex-style patterns", () => {
    const opts = parseRedactorOptions({ patterns: ["/ORDER-\\d+/gi"] });
    expect(opts.rules[0].pattern.flags).toContain("g");
  });

  it("defaults useBuiltins to true", () => {
    const opts = parseRedactorOptions({});
    expect(opts.useBuiltins).toBe(true);
  });
});

describe("validateRedactorOptions", () => {
  it("returns no errors for valid options", () => {
    expect(validateRedactorOptions({ patterns: ["foo"] })).toHaveLength(0);
  });

  it("returns error for invalid regex", () => {
    const errors = validateRedactorOptions({ patterns: ["[invalid"] });
    expect(errors.length).toBeGreaterThan(0);
  });

  it("returns error for empty placeholder", () => {
    const errors = validateRedactorOptions({ placeholder: "   " });
    expect(errors.length).toBeGreaterThan(0);
  });
});
