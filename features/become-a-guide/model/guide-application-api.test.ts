import { http, HttpResponse } from "msw";
import { afterEach, describe, expect, it } from "vitest";

import { apiUrl } from "@/test/msw/handlers";
import { server } from "@/test/msw/server";
import { renderHookWithProviders } from "@/test/utils/render";
import {
  clearApplicationDraft,
  emailHasAccount,
  loadApplicationDraft,
  saveApplicationDraft,
  submitGuideApplication,
  useSubmitHostApplication,
} from "./guide-application-api";
import { DEFAULT_APPLICATION_DATA } from "./guide-application.types";

const individual = {
  ...DEFAULT_APPLICATION_DATA,
  firstName: " Jane ",
  lastName: "Doe ",
  dateOfBirth: "12/03/1994",
  phoneNumber: "0801 234 5678",
  website: "",
  email: "jane@example.com",
  password: "secretpassword123",
};

function capture() {
  const sent: { body: unknown } = { body: null };
  server.use(
    http.post(apiUrl("/auth/register/guide"), async ({ request }) => {
      sent.body = await request.json();
      return HttpResponse.json({ access_token: "mock-token", refresh_token: "mock-refresh", token_type: "bearer" }, { status: 201 });
    }),
    http.get(apiUrl("/auth/me"), () =>
      HttpResponse.json({ id: "u1", email: "jane@example.com", full_name: "Jane Doe", avatar_url: null, signup_type: "guide" })
    )
  );
  return sent;
}

afterEach(() => window.localStorage.clear());

describe("guide-application-api", () => {
  it("signs the new guide in with the tokens it gets back", async () => {
    capture();

    await submitGuideApplication(individual);

    const stored = JSON.parse(window.localStorage.getItem("myjourny:auth") ?? "null");
    expect(stored).toMatchObject({
      accessToken: "mock-token",
      refreshToken: "mock-refresh",
      user: { id: "u1", email: "jane@example.com", fullName: "Jane Doe" },
    });
  });

  it("sends the whole application to the guide registration endpoint", async () => {
    const sent = capture();

    const result = await submitGuideApplication(individual);

    expect(result.success).toBe(true);
    expect(sent.body).toEqual({
      email: "jane@example.com",
      password: "secretpassword123",
      full_name: "Jane Doe",
      date_of_birth: "1994-03-12",
      phone_number: "+2348012345678",
      city: "Lagos",
      applicant_type: "individual",
      website: null,
      business_name: null,
      cac_number: null,
    });
  });

  it("sends an individual's brand name and a website with https in front", async () => {
    const sent = capture();
    await submitGuideApplication({ ...individual, businessName: "Jane's Walks", website: "janewalks.com" });
    expect(sent.body).toMatchObject({ applicant_type: "individual", business_name: "Jane's Walks", website: "https://janewalks.com" });
  });

  it("sends a business's name and CAC number", async () => {
    const sent = capture();

    await submitGuideApplication({
      ...individual,
      verificationType: "business",
      businessName: "Lagos Tours Ltd",
      cacNumber: "RC123456",
    });

    expect(sent.body).toMatchObject({
      applicant_type: "business",
      business_name: "Lagos Tours Ltd",
      cac_number: "RC123456",
    });
  });

  it("returns the API's reason when registration fails", async () => {
    server.use(
      http.post(apiUrl("/auth/register/guide"), () =>
        HttpResponse.json({ detail: "Email already registered" }, { status: 409 })
      )
    );

    const result = await submitGuideApplication(individual);

    // A 409 means the email has an account: the form offers to log in.
    expect(result).toEqual({ success: false, message: "Email already registered", accountExists: true });
  });

  it("reads the first field error when validation fails", async () => {
    server.use(
      http.post(apiUrl("/auth/register/guide"), () =>
        HttpResponse.json(
          { detail: [{ loc: ["body", "date_of_birth"], msg: "Value error, Guides must be at least 18" }] },
          { status: 422 }
        )
      )
    );

    const result = await submitGuideApplication(individual);

    expect(result).toEqual({ success: false, message: "Guides must be at least 18" });
  });

  it("adds hosting to the signed-in account and updates it", async () => {
    const sent: { body: unknown } = { body: null };
    const me = { id: "u1", email: "jane@example.com", signup_type: "both", guide_status: "pending", is_host: true };
    server.use(
      http.post(apiUrl("/auth/me/host"), async ({ request }) => {
        sent.body = await request.json();
        return HttpResponse.json(me, { status: 201 });
      })
    );
    const { result, queryClient } = renderHookWithProviders(() => useSubmitHostApplication());

    const outcome = await result.current.mutateAsync(individual);

    expect(outcome).toEqual({ success: true });
    expect(sent.body).toEqual({
      full_name: "Jane Doe",
      date_of_birth: "1994-03-12",
      phone_number: "+2348012345678",
      city: "Lagos",
      applicant_type: "individual",
      website: null,
      business_name: null,
      cac_number: null,
    });
    expect(queryClient.getQueryData(["auth", "me"])).toEqual(me);
  });

  it("returns the reason when adding hosting fails", async () => {
    server.use(
      http.post(apiUrl("/auth/me/host"), () => HttpResponse.json({ detail: "You're already a host" }, { status: 409 }))
    );
    const { result } = renderHookWithProviders(() => useSubmitHostApplication());

    expect(await result.current.mutateAsync(individual)).toEqual({ success: false, message: "You're already a host" });
  });

  it("keeps a draft until it's cleared, without the password", () => {
    saveApplicationDraft(individual);

    expect(loadApplicationDraft()).toMatchObject({ firstName: " Jane ", lastName: "Doe ", password: "" });
    clearApplicationDraft();
    expect(loadApplicationDraft()).toBeNull();
  });

  it("asks whether an email has an account, and says no when the lookup fails", async () => {
    let asked: unknown = null;
    server.use(
      http.post(apiUrl("/auth/email-exists"), async ({ request }) => {
        asked = await request.json();
        return HttpResponse.json({ exists: true });
      }),
    );
    expect(await emailHasAccount(" Jane@Example.com ")).toBe(true);
    expect(asked).toEqual({ email: "jane@example.com" });

    server.use(http.post(apiUrl("/auth/email-exists"), () => HttpResponse.json({}, { status: 500 })));
    expect(await emailHasAccount("jane@example.com")).toBe(false);
  });
});
