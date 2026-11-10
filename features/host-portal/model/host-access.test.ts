import { describe, expect, it } from "vitest";

import { hostAccessOf } from "./host-access";

const signedIn = { hydrated: true, signedIn: true };

describe("hostAccessOf", () => {
  it("waits until the session has been read", () => {
    expect(hostAccessOf({ hydrated: false, signedIn: false, me: undefined })).toBe("checking");
  });

  it("knows a signed-out visitor straight away", () => {
    expect(hostAccessOf({ hydrated: true, signedIn: false, me: undefined })).toBe("signed-out");
  });

  it("waits for the account before deciding", () => {
    expect(hostAccessOf({ ...signedIn, me: undefined })).toBe("checking");
  });

  it("treats anyone who didn't sign up as a guide as a traveller", () => {
    expect(hostAccessOf({ ...signedIn, me: { signup_type: "traveller", guide_status: "none" } })).toBe("traveller");
    expect(hostAccessOf({ ...signedIn, me: {} })).toBe("traveller");
  });

  it("follows the guide application", () => {
    expect(hostAccessOf({ ...signedIn, me: { signup_type: "guide", guide_status: "approved" } })).toBe("approved");
    expect(hostAccessOf({ ...signedIn, me: { signup_type: "guide", guide_status: "pending" } })).toBe("pending");
    expect(hostAccessOf({ ...signedIn, me: { signup_type: "guide", guide_status: "rejected" } })).toBe("rejected");
    expect(hostAccessOf({ ...signedIn, me: { signup_type: "guide" } })).toBe("pending");
  });
});
