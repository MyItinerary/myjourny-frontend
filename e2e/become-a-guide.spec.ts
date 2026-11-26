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
      "POST /auth/email-exists": (route) => route.fulfill({ json: { exists: false, has_password: false } }),
    });

    await page.goto("/become-a-guide/apply");

    // Step 1: Personal info
    await expect(page.getByText("Step 1 of 2")).toBeVisible();
    await page.getByLabel("First name").fill("Amara");
    await page.getByLabel("Last name").fill("Okafor");
    await page.getByLabel("Date of birth").fill("15/08/1995");
    await page.getByLabel("Phone number").fill("8012345678");
    await page.getByLabel("Email address").fill("amara@example.com");
    await page.getByLabel("Password", { exact: true }).fill("SecurePass123!");
    await page.getByRole("button", { name: "Continue" }).click();

    // Step 2: the brand and where it's registered
    await expect(page.getByText("Step 2 of 2")).toBeVisible();
    await page.getByLabel("Website (optional)").fill("amara.guide");
    await page.getByLabel("Where are you registered?").selectOption("Nigeria");
    await page.getByRole("button", { name: "Submit" }).click();

    // Confirmation screen
    await expect(page.getByRole("heading", { name: "You're in review" })).toBeVisible();
    await expect(page.getByText("A real person checks this, not a bot.")).toBeVisible();
    await expect(page.getByText(/your details are checked and matched/i)).toBeVisible();

    expect(capturedPayload).toMatchObject({
      full_name: "Amara Okafor",
      date_of_birth: "1995-08-15",
      phone_number: "+2348012345678",
      applicant_type: "individual",
      website: "https://amara.guide",
      business_name: null,
      cac_number: null,
      email: "amara@example.com",
    });

    // Signed in already: straight on to the dashboard, which nudges them to get verified.
    // "In review" waits until they've sent their verification details.
    await page.getByRole("button", { name: "Go to your dashboard" }).click();
    await expect(page).toHaveURL(/\/host\/dashboard$/);
    await expect(page.getByRole("heading", { name: "Finish setting up" })).toBeVisible();
    await expect(page.getByText("Your guide application is in review")).toHaveCount(0);
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
    await page.getByLabel("How do you run your business?").selectOption("business");
    await page.getByLabel("First name").fill("Tunde");
    await page.getByLabel("Last name").fill("Adeleke");
    await page.getByLabel("Date of birth").fill("20/05/1990");
    await page.getByLabel("Phone number").fill("8123456789");
    await page.getByLabel("Email address").fill("info@lagostours.ng");
    await page.getByLabel("Password", { exact: true }).fill("BusinessPass123!");
    await page.getByRole("button", { name: "Continue" }).click();

    // Step 2: business details
    await page.getByRole("button", { name: "Submit" }).click();
    await expect(page.getByText("Enter your company's brand name")).toBeVisible();
    await page.getByLabel("Company's brand name").fill("Lagos Cultural Tours Ltd");
    await page.getByLabel("CAC registration number").fill("RC1234567");
    await page.getByLabel("Website (optional)").fill("lagostours.ng");
    await page.getByLabel("Where are you registered?").selectOption("Nigeria");
    await page.getByRole("button", { name: "Submit" }).click();

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
      website: "https://lagostours.ng",
      email: "info@lagostours.ng",
    });
  });

  test("sends someone whose email already has an account to log in from step 1, keeping what they typed", async ({ page }) => {
    await mockApi(page, {
      "POST /auth/email-exists": (route) => route.fulfill({ json: { exists: true, has_password: true } }),
    });

    await page.goto("/become-a-guide/apply");
    await page.getByLabel("First name").fill("Amara");
    await page.getByLabel("Last name").fill("Okafor");
    await page.getByLabel("Date of birth").fill("15/08/1995");
    await page.getByLabel("Phone number").fill("8012345678");
    await page.getByLabel("Email address").fill("amara@example.com");
    await page.getByLabel("Password", { exact: true }).fill("SecurePass123!");
    await page.getByRole("button", { name: "Continue" }).click();

    // Still on step 1, told on the form, with the way forward.
    await expect(page.getByRole("alert").filter({ hasText: "There's already an account with this email" })).toBeVisible();
    await expect(page.getByText("Step 1 of 2")).toBeVisible();

    await page.getByRole("button", { name: "Log in", exact: true }).click();
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
    await expect(page.getByLabel("First name")).toHaveValue("Amara");
    await expect(page.getByLabel("Last name")).toHaveValue("Okafor");
    await expect(page.getByLabel("Email address")).toHaveCount(0);
    await page.getByLabel("Date of birth").fill("15/08/1995");
    await page.getByLabel("Phone number").fill("8012345678");
    await page.getByRole("button", { name: "Continue" }).click();

    // No email or password: it's the same login.
    await expect(page.getByText("You're applying with")).toBeVisible();
    await page.getByLabel("Where are you registered?").selectOption("Nigeria");
    await page.getByRole("button", { name: "Submit" }).click();

    await expect(page.getByRole("heading", { name: "You're in review" })).toBeVisible();
    expect(capturedPayload).toMatchObject({ full_name: "Amara Okafor", applicant_type: "individual" });
    expect(capturedPayload).not.toHaveProperty("email");

    await page.getByRole("button", { name: "Go to your dashboard" }).click();
    await expect(page).toHaveURL(/\/host\/dashboard$/);
    await expect(page.getByRole("heading", { name: "Finish setting up" })).toBeVisible();

    // And back to the traveller side.
    await page.getByRole("link", { name: "Switch to travelling" }).click();
    await expect(page).toHaveURL(/\/$/);
  });

  test("signed out, Get Started in the top bar opens the application and account settings stay closed", async ({ page }) => {
    await mockApi(page, {});
    await page.goto("/become-a-guide");

    await page.getByRole("banner").getByRole("button", { name: "Get Started" }).click();
    await expect(page).toHaveURL(/\/become-a-guide\/apply$/);

    // Typing the address doesn't open an empty settings page either.
    await page.goto("/profile?tab=security");
    await expect(page).toHaveURL(/\/login\?next=%2Fprofile%3Ftab%3Dsecurity$/);
  });
});
