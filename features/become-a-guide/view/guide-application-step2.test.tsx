import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { DEFAULT_APPLICATION_DATA } from "../model/guide-application.types";
import { GuideApplicationStep2 } from "./guide-application-step2";

describe("GuideApplicationStep2", () => {
  const defaultProps = {
    formData: DEFAULT_APPLICATION_DATA,
    errors: {},
    isSubmitting: false,
    setField: vi.fn(),
    onContinue: vi.fn(),
    onBack: vi.fn(),
  };

  it("renders individual step 2 with website, email, password and Continue button", () => {
    render(<GuideApplicationStep2 {...defaultProps} />);

    expect(screen.getByLabelText(/Add a website/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Email address/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Password/i)).toBeInTheDocument();
    expect(screen.getAllByRole("button", { name: "Continue" })[0]).toBeInTheDocument();
    expect(screen.queryByLabelText(/Registered business name/i)).not.toBeInTheDocument();
  });

  it("renders business step 2 with CAC fields and Create an account button", () => {
    render(
      <GuideApplicationStep2
        {...defaultProps}
        formData={{ ...DEFAULT_APPLICATION_DATA, verificationType: "business" }}
      />
    );

    expect(screen.getByLabelText(/Registered business name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/CAC registration number/i)).toBeInTheDocument();
    expect(screen.getAllByRole("button", { name: "Create an account" })[0]).toBeInTheDocument();
  });

  it("calls onContinue when user clicks submit button", async () => {
    const user = userEvent.setup();
    const onContinue = vi.fn();
    render(<GuideApplicationStep2 {...defaultProps} onContinue={onContinue} />);

    const continueButtons = screen.getAllByRole("button", { name: "Continue" });
    await user.click(continueButtons[0]);

    expect(onContinue).toHaveBeenCalled();
  });

  it("leaves out the email and password for a signed-in applicant", () => {
    render(<GuideApplicationStep2 {...defaultProps} signedInEmail="amara@example.com" />);

    expect(screen.getByText("ADD HOSTING TO YOUR ACCOUNT")).toBeInTheDocument();
    expect(screen.getByText("amara@example.com")).toBeInTheDocument();
    expect(screen.queryByLabelText(/Email address/i)).not.toBeInTheDocument();
    expect(screen.queryByLabelText(/Password/i)).not.toBeInTheDocument();
    expect(screen.getAllByRole("button", { name: "Submit application" })[0]).toBeInTheDocument();
  });

  it("says when the email already has an account and offers to log in", async () => {
    const onLogIn = vi.fn();
    render(<GuideApplicationStep2 {...defaultProps} accountExists onLogIn={onLogIn} />);

    expect(screen.getByRole("alert")).toHaveTextContent("You already have a MyJourny account with this email.");
    await userEvent.click(screen.getByRole("button", { name: "Log in to continue" }));
    expect(onLogIn).toHaveBeenCalled();
  });
});
