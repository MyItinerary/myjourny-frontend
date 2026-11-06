import { http, HttpResponse } from "msw";
import { describe, expect, it } from "vitest";

import { apiUrl } from "@/test/msw/handlers";
import { server } from "@/test/msw/server";
import { submitGuideApplication } from "./guide-application-api";
import { DEFAULT_APPLICATION_DATA } from "./guide-application.types";

describe("guide-application-api", () => {
  it("submits application payload to registration endpoint and returns success", async () => {
    server.use(
      http.post(apiUrl("/auth/register"), async () => {
        return HttpResponse.json({
          access_token: "mock-token",
          token_type: "bearer",
        });
      })
    );

    const result = await submitGuideApplication({
      ...DEFAULT_APPLICATION_DATA,
      fullName: "Jane Doe",
      email: "jane@example.com",
      password: "secretpassword123",
      phoneNumber: "8012345678",
    });

    expect(result.success).toBe(true);
  });

  it("handles business payload with business name and CAC number", async () => {
    let capturedPayload: unknown = null;
    server.use(
      http.post(apiUrl("/auth/register"), async ({ request }) => {
        capturedPayload = await request.json();
        return HttpResponse.json({ success: true });
      })
    );

    await submitGuideApplication({
      ...DEFAULT_APPLICATION_DATA,
      verificationType: "business",
      businessName: "Lagos Tours Ltd",
      cacNumber: "RC123456",
      email: "host@business.com",
      password: "pass",
    });

    expect(capturedPayload).toMatchObject({
      business_name: "Lagos Tours Ltd",
      cac_number: "RC123456",
      verification_type: "business",
    });
  });
});
