import { describe, expect, it } from "vitest";
import { isNavItemActive } from "@/components/navbar/nav-items";

describe("isNavItemActive", () => {
  it("matches nested oracle routes", () => {
    expect(isNavItemActive("/oracle/chat", "/oracle/chat")).toBe(true);
    expect(isNavItemActive("/oracle/chat/abc", "/oracle/chat")).toBe(true);
  });

  it("matches billing under premium", () => {
    expect(isNavItemActive("/billing", "/pricing")).toBe(true);
  });

  it("treats home as active for methods anchor", () => {
    expect(isNavItemActive("/", "/#methods")).toBe(true);
    expect(isNavItemActive("/daily", "/#methods")).toBe(false);
  });
});
