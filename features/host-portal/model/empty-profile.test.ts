import { describe, expect, it } from "vitest";

import { emptyProfile, maskEmail } from "./empty-profile";

describe("maskEmail", () => {
  it("keeps the first and last letters of the name and the domain", () => {
    expect(maskEmail("tunde.bakare@gmail.com")).toBe("t***e@gmail.com");
    expect(maskEmail("ab@x.com")).toBe("a***@x.com");
    expect(maskEmail("not-an-email")).toBe("not-an-email");
  });
});

describe("emptyProfile", () => {
  it("uses the account's name and email", () => {
    const profile = emptyProfile({ fullName: "Tunde Bakare", email: "tunde.bakare@gmail.com" });
    const personal = profile.rows.personal;

    expect(personal[0]).toMatchObject({ label: "Legal name", value: "Tunde Bakare", action: "Edit" });
    expect(personal[1]).toMatchObject({ label: "What guests call you", value: "Tunde" });
    expect(personal[3]).toMatchObject({ label: "Email address", value: "t***e@gmail.com" });
    expect(profile.preview.name).toBe("Tunde Bakare");
  });

  it("marks everything else as still to do", () => {
    const profile = emptyProfile({ fullName: "Tunde Bakare", email: "t@x.com" });
    expect(profile.rows.personal.slice(2, 3)[0]).toMatchObject({ value: "Not provided", muted: true, action: "Add" });
    expect(profile.rows.verify.slice(0, 3).map((r) => r.chip?.text)).toEqual(["To do", "To do", "To do"]);
    expect(profile.rows.payouts[0].value).toBe("No account added yet");
    expect(profile.verifyLeft).toBe(3);
    expect(profile.documents.every((d) => !d.checked)).toBe(true);
    expect(profile.closing).toEqual({ upcoming: 0, guests: 0 });
  });

  it("lists the three things to finish, each leading to its pane", () => {
    const { setup } = emptyProfile(null);
    expect(setup!.map((t) => [t.title, t.pane, t.done])).toEqual([
      ["Confirm who you are", "verify", false],
      ["Write your public profile", "public", false],
      ["Add the account we pay into", "payouts", false],
    ]);
  });

  it("copes with no account details", () => {
    const profile = emptyProfile(null);
    expect(profile.rows.personal[0]).toMatchObject({ value: "Not provided", action: "Add", muted: true });
    expect(profile.rows.personal[1]).toMatchObject({ value: "Not provided", action: "Add" });
    expect(profile.rows.personal[3]).toMatchObject({ value: "Not provided", action: "Add" });
    expect(profile.preview.name).toBe("Your name");
  });
});
