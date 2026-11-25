import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { DEFAULT_APPLICATION_DATA, NIGERIAN_CITIES } from "../model/guide-application.types";
import { GuideApplicationStep1 } from "./guide-application-step1";

describe("GuideApplicationStep1", () => {
  const defaultProps = {
    formData: DEFAULT_APPLICATION_DATA,
    errors: {},
    cityOptions: NIGERIAN_CITIES,
    setField: vi.fn(),
    setVerificationType: vi.fn(),
    onContinue: vi.fn(),
    onBack: vi.fn(),
  };

  it("renders all step 1 inputs and selection cards", () => {
    render(<GuideApplicationStep1 {...defaultProps} />);

    expect(screen.getByText("CREATE AN ACCOUNT")).toBeInTheDocument();
    expect(screen.getByText("Let's get to know you")).toBeInTheDocument();
    expect(screen.getByLabelText(/Full legal name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Date of birth/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Phone number/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/City/i)).toBeInTheDocument();
    expect(screen.getByText("An individual")).toBeInTheDocument();
    expect(screen.getByText("A registered business")).toBeInTheDocument();
  });

  it("calls setVerificationType when clicking business card", async () => {
    const user = userEvent.setup();
    const setVerificationType = vi.fn();
    render(
      <GuideApplicationStep1
        {...defaultProps}
        setVerificationType={setVerificationType}
      />
    );

    const businessCard = screen.getByText("A registered business");
    await user.click(businessCard);

    expect(setVerificationType).toHaveBeenCalledWith("business");
  });

  it("calls onContinue when clicking Continue button", async () => {
    const user = userEvent.setup();
    const onContinue = vi.fn();
    render(<GuideApplicationStep1 {...defaultProps} onContinue={onContinue} />);

    const continueButtons = screen.getAllByRole("button", { name: "Continue" });
    await user.click(continueButtons[0]);

    expect(onContinue).toHaveBeenCalled();
  });
});
