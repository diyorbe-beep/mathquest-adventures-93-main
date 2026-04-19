import { test, expect } from "@playwright/test";

test.describe("Smoke", () => {
  test("bosh sahifa yuklanadi va MathQuest ko‘rinadi", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByRole("heading", { name: /MathQuest/i })).toBeVisible();
  });

  test("/auth sahifasi ochiladi", async ({ page }) => {
    await page.goto("/auth");
    await expect(page).toHaveURL(/\/auth/);
  });
});
