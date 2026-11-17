import { expect, mockApi, test } from "./fixtures";

test.describe("become a guide application", () => {
  test("completes individual host application and lands in review", async ({ page }) => {
    let capturedPayload: Record<string, unknown> | null = null;

    await mockApi(page, {
      "POST /auth/register/guide": async (route) => {
        capturedPayload = route.request().postDataJSON() as Record<string, unknown>;
        return route.fulfill({
          status: 201,
          json: { access_token: "mock-token", refresh_token: "mock-refresh", token_type: "bearer" },
        });
      },
      "GET /auth/me": (route) =>
        route.fulfill({ json: { id: "guide-1", email: "amara@example.com", signup_type: "guide", guide_status: "pending" } }),
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

    // Signed in already: straight on to the dashboard, which says the application is in review.
    await page.getByRole("button", { name: "Go to your dashboard" }).click();
    await expect(page).toHaveURL(/\/host\/dashboard$/);
    await expect(page.getByRole("status")).toContainText("Your guide application is in review");
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

  test("offers to log in when the email already has an account, and picks up after", async ({ page }) => {
    await mockApi(page, {
      "POST /auth/register/guide": (route) =>
        route.fulfill({
          status: 409,
          json: { detail: "This email is already registered with MyJourny. Log in with it and you can add hosting to your account." },
        }),
    });

    await page.goto("/become-a-guide/apply");

    // Step 1
    await page.getByLabel("Full legal name").fill("Amara Okafor");
    await page.getByLabel("Date of birth").fill("15/08/1995");
    await page.getByLabel("Phone number").fill("8012345678");
    await page.getByRole("button", { name: "Continue" }).filter({ visible: true }).click();

    // Step 2
    await page.getByLabel("Email address").fill("amara@example.com");
    await page.getByLabel("Password").fill("SecurePass123!");
    await page.getByRole("button", { name: "Continue" }).filter({ visible: true }).click();

    // Said on the form, with a way forward; still on step 2.
    await expect(page.getByRole("alert").filter({ hasText: "You already have a MyJourny account" })).toBeVisible();
    await expect(page.getByRole("heading", { name: "You're in review" })).not.toBeVisible();

    await page.getByRole("button", { name: "Log in to continue" }).click();
    await expect(page).toHaveURL(/\/login\?next=%2Fbecome-a-guide%2Fapply$/);
  });

  test("a signed-in traveller adds hosting to their account", async ({ page }) => {
    let capturedPayload: Record<string, unknown> | null = null;
    let host = false;
    await page.addInitScript(() => {
      window.localStorage.setItem(
        "myjourny:auth",
        JSON.stringify({
          accessToken: "e2e-access",
          refreshToken: "e2e-refresh",
          user: { id: "user-1", email: "amara@example.com", fullName: "Amara Okafor", avatarUrl: null },
        }),
      );
    });
    const me = () => ({
      id: "user-1",
      email: "amara@example.com",
      full_name: "Amara Okafor",
      signup_type: host ? "both" : "traveller",
      guide_status: host ? "pending" : "none",
      is_host: host,
    });
    await mockApi(page, {
      "GET /auth/me": (route) => route.fulfill({ json: me() }),
      "POST /auth/me/host": async (route) => {
        capturedPayload = route.request().postDataJSON() as Record<string, unknown>;
        host = true;
        return route.fulfill({ status: 201, json: me() });
      },
    });

    await page.goto("/become-a-guide/apply");

    // The name comes from the account.
    await expect(page.getByLabel("Full legal name")).toHaveValue("Amara Okafor");
    await page.getByLabel("Date of birth").fill("15/08/1995");
    await page.getByLabel("Phone number").fill("8012345678");
    await page.getByRole("button", { name: "Continue" }).filter({ visible: true }).click();

    // No email or password: it's the same login.
    await expect(page.getByText("ADD HOSTING TO YOUR ACCOUNT")).toBeVisible();
    await expect(page.getByLabel("Email address")).toHaveCount(0);
    await page.getByRole("button", { name: "Submit application" }).filter({ visible: true }).click();

    await expect(page.getByRole("heading", { name: "You're in review" })).toBeVisible();
    expect(capturedPayload).toMatchObject({ full_name: "Amara Okafor", applicant_type: "individual" });
    expect(capturedPayload).not.toHaveProperty("email");

    await page.getByRole("button", { name: "Go to your dashboard" }).click();
    await expect(page).toHaveURL(/\/host\/dashboard$/);
    await expect(page.getByRole("status")).toContainText("Your guide application is in review");

    // And back to the traveller side.
    await page.getByRole("link", { name: "Switch to travelling" }).click();
    await expect(page).toHaveURL(/\/$/);
  });
});
