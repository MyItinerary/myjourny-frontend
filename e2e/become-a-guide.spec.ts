import { expect, mockApi, test } from "./fixtures";

test.describe("become a guide application", () => {
  test("completes individual host application and lands in review", async ({ page }) => {
    let capturedPayload: Record<string, unknown> | null = null;

    await mockApi(page, {
      "POST /auth/register/guide": async (route) => {
        capturedPayload = route.request().postDataJSON() as Record<string, unknown>;
        return route.fulfill({
          status: 201,
          json: { access_token: "mock-token", token_type: "bearer" },
        });
      },
    });

    await page.goto("/become-a-guide/apply");

    // Step 1: Personal info
    await page.getByLabel("Full legal name").fill("Amara Okafor");
    await page.getByLabel("Date of birth").fill("15/08/1995");
    await page.getByLabel("Phone number").fill("8012345678");

    // Default is individual host
    await page.getByRole("button", { name: "Continue" }).filter({ visible: true }).click();

    // Step 2: Credentials & website
    await expect(page.getByLabel("Add a website")).toBeVisible();
    await page.getByLabel("Add a website").fill("amara.guide");
    await page.getByLabel("Email address").fill("amara@example.com");
    await page.getByLabel("Password").fill("SecurePass123!");

    await page.getByRole("button", { name: "Continue" }).filter({ visible: true }).click();

    // Confirmation screen
    await expect(page.getByRole("heading", { name: "You're in review" })).toBeVisible();
    await expect(page.getByText("A real person checks this, not a bot.")).toBeVisible();
    await expect(page.getByText(/your details are checked and matched/i)).toBeVisible();

    expect(capturedPayload).toMatchObject({
      full_name: "Amara Okafor",
      date_of_birth: "1995-08-15",
      phone_number: "+2348012345678",
      applicant_type: "individual",
      website: "amara.guide",
      business_name: null,
      cac_number: null,
      email: "amara@example.com",
    });
  });

  test("completes registered business application with CAC number", async ({ page }) => {
    let capturedPayload: Record<string, unknown> | null = null;

    await mockApi(page, {
      "POST /auth/register/guide": async (route) => {
        capturedPayload = route.request().postDataJSON() as Record<string, unknown>;
        return route.fulfill({
          status: 201,
          json: { access_token: "mock-token", token_type: "bearer" },
        });
      },
    });

    await page.goto("/become-a-guide/apply");

    // Step 1: Select registered business
    await page.getByLabel("Full legal name").fill("Tunde Adeleke");
    await page.getByLabel("Date of birth").fill("20/05/1990");
    await page.getByLabel("Phone number").fill("8123456789");
    await page.getByRole("button", { name: /A registered business/i }).click();

    await page.getByRole("button", { name: "Continue" }).filter({ visible: true }).click();

    // Step 2: Business fields
    await expect(page.getByLabel("Registered business name")).toBeVisible();
    await expect(page.getByLabel("CAC registration number")).toBeVisible();

    await page.getByLabel("Registered business name").fill("Lagos Cultural Tours Ltd");
    await page.getByLabel("CAC registration number").fill("RC1234567");
    await page.getByLabel("Add a website").fill("lagostours.ng");
    await page.getByLabel("Email address").fill("info@lagostours.ng");
    await page.getByLabel("Password").fill("BusinessPass123!");

    await page.getByRole("button", { name: "Create an account" }).filter({ visible: true }).click();

    // Confirmation screen
    await expect(page.getByRole("heading", { name: "You're in review" })).toBeVisible();
    await expect(page.getByText("A real person checks this, not a bot.")).toBeVisible();
    await expect(page.getByText(/Details and business details are checked and matched/i)).toBeVisible();

    expect(capturedPayload).toMatchObject({
      full_name: "Tunde Adeleke",
      date_of_birth: "1990-05-20",
      applicant_type: "business",
      business_name: "Lagos Cultural Tours Ltd",
      cac_number: "RC1234567",
      website: "lagostours.ng",
      email: "info@lagostours.ng",
    });
  });

  test("displays error toast and stays on step 2 when registration fails", async ({ page }) => {
    await mockApi(page, {
      "POST /auth/register/guide": (route) =>
        route.fulfill({
          status: 409,
          json: { detail: "Email already registered" },
        }),
    });

    await page.goto("/become-a-guide/apply");

    // Step 1
    await page.getByLabel("Full legal name").fill("Amara Okafor");
    await page.getByLabel("Date of birth").fill("15/08/1995");
    await page.getByLabel("Phone number").fill("8012345678");
    await page.getByRole("button", { name: "Continue" }).filter({ visible: true }).click();

    // Step 2
    await page.getByLabel("Email address").fill("duplicate@example.com");
    await page.getByLabel("Password").fill("SecurePass123!");
    await page.getByRole("button", { name: "Continue" }).filter({ visible: true }).click();

    // Error toast shown and still on Step 2
    await expect(page.getByText("Email already registered")).toBeVisible();
    await expect(page.getByLabel("Email address")).toBeVisible();
    await expect(page.getByRole("heading", { name: "You're in review" })).not.toBeVisible();
  });
});
