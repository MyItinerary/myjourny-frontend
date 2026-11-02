import { expect, mockApi, test } from "./fixtures";

// The page the "Verify your email" message links to. It works signed out:
// the token in the link is the proof.

test("a valid link verifies the email", async ({ page }) => {
  let token: string | null = null;
  await mockApi(page, {
    "GET /auth/email/verify": (r) => {
      token = new URL(r.request().url()).searchParams.get("token");
      return r.fulfill({ json: { message: "Email verified" } });
    },
  });

  await page.goto("/verify-email?token=tok123");

  await expect(page.getByRole("heading", { name: "Email verified" })).toBeVisible();
  expect(token).toBe("tok123");
  await expect(page.getByText("Log in").first()).toBeVisible();
});

test("an expired or used link says so", async ({ page }) => {
  await mockApi(page, {
    "GET /auth/email/verify": (r) =>
      r.fulfill({ status: 400, json: { detail: "This link has expired or was already used" } }),
  });

  await page.goto("/verify-email?token=old");

  await expect(page.getByRole("heading", { name: "This link didn't work" })).toBeVisible();
  await expect(page.getByText("This link has expired or was already used")).toBeVisible();
});
