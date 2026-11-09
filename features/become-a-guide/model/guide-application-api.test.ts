import { http, HttpResponse } from "msw";
import { describe, expect, it } from "vitest";

import { apiUrl } from "@/test/msw/handlers";
import { server } from "@/test/msw/server";
import { submitGuideApplication } from "./guide-application-api";
import { DEFAULT_APPLICATION_DATA } from "./guide-application.types";

const individual = {
  ...DEFAULT_APPLICATION_DATA,
  fullName: " Jane Doe ",
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
      return HttpResponse.json({ access_token: "mock-token", token_type: "bearer" }, { status: 201 });
    })
  );
  return sent;
}

describe("guide-application-api", () => {
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

    expect(result).toEqual({ success: false, message: "Email already registered" });
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
});
