import { screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { renderWithProviders } from "@/test/utils/render";

import { COUNTRIES, DEFAULT_APPLICATION_DATA, VERIFICATION_TYPES } from "../model/guide-application.types";
import type { GuideApplicationViewModel } from "../view-model/use-guide-application-view-model";
import { GuideApplicationView } from "./guide-application-view";

const vm = (over: Partial<GuideApplicationViewModel> = {}): GuideApplicationViewModel => ({
  step: 1,
  formData: DEFAULT_APPLICATION_DATA,
  errors: {},
  isSubmitting: false,
  verificationTypes: VERIFICATION_TYPES,
  countries: COUNTRIES,
  passwordRules: [],
  showPasswordErrors: false,
  signedInEmail: null,
  applyingEmail: "",
  accountExists: false,
  checkingEmail: false,
  showPassword: false,
  onTogglePassword: vi.fn(),
  handleLogIn: vi.fn(),
  setField: vi.fn(),
  setVerificationType: vi.fn(),
  handleContinue: vi.fn(),
  handleBack: vi.fn(),
  handleDone: vi.fn(),
  ...over,
});

describe("GuideApplicationView", () => {
  it("shows step 1 in the card, with the logo and step count", () => {
    renderWithProviders(<GuideApplicationView {...vm()} />);
    expect(screen.getByRole("img", { name: "MyJourny" })).toBeInTheDocument();
    expect(screen.getByText("Step 1 of 2")).toBeInTheDocument();
    expect(screen.getByLabelText("First name")).toBeInTheDocument();
  });

  it("shows step 2", () => {
    renderWithProviders(<GuideApplicationView {...vm({ step: 2 })} />);
    expect(screen.getByText("Step 2 of 2")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Submit" })).toBeInTheDocument();
  });

  it("shows the review screen once submitted", () => {
    renderWithProviders(<GuideApplicationView {...vm({ step: "review" })} />);
    expect(screen.getByText("You're in review")).toBeInTheDocument();
  });
});
