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
});
