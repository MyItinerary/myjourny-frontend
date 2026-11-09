import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { DEFAULT_APPLICATION_DATA, NIGERIAN_CITIES } from "../model/guide-application.types";
import type { GuideApplicationViewModel } from "../view-model/use-guide-application-view-model";
import { GuideApplicationView } from "./guide-application-view";

describe("GuideApplicationView", () => {
  const mockVm: GuideApplicationViewModel = {
    step: 1,
    formData: DEFAULT_APPLICATION_DATA,
    errors: {},
    isSubmitting: false,
    cityOptions: NIGERIAN_CITIES,
    setField: vi.fn(),
    setVerificationType: vi.fn(),
    handleContinue: vi.fn(),
    handleBack: vi.fn(),
    handleDone: vi.fn(),
  };

  it("renders Step 1 initially", () => {
    render(<GuideApplicationView {...mockVm} />);

    expect(screen.getByText("Page 1 of 2")).toBeInTheDocument();
    expect(screen.getByLabelText(/Full legal name/i)).toBeInTheDocument();
  });

  it("renders Step 2 when step is 2", () => {
    render(<GuideApplicationView {...mockVm} step={2} />);

    expect(screen.getByText("Page 2 of 2")).toBeInTheDocument();
    expect(screen.getByLabelText(/Add a website/i)).toBeInTheDocument();
  });

  it("renders Review screen when step is review", () => {
    render(<GuideApplicationView {...mockVm} step="review" />);

    expect(screen.getByText("Submitted for review")).toBeInTheDocument();
    expect(screen.getByText("You're in review")).toBeInTheDocument();
  });
});
