import { expect, test } from "./fixtures";

test.describe("smoke", () => {
  test("home page renders the hero", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  });

  test("login page renders and enables Continue once both fields are filled", async ({ page }) => {
    await page.goto("/login");
    const submit = page.getByRole("button", { name: "Continue", exact: true });
    await expect(submit).toBeDisabled();

    // On a cold server the inputs can be filled before React hydrates, which
    // resets the controlled values. Re-fill until the UI reacts.
    await expect(async () => {
      await page.getByPlaceholder("Enter email address").fill("traveller@example.com");
      await page.getByPlaceholder("Enter password").fill("correct-horse-battery");
      await expect(submit).toBeEnabled({ timeout: 1_000 });
    }).toPass();
  });
});
