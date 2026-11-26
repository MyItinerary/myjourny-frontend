import { screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { renderWithProviders } from "@/test/utils/render";

import { GuideApplicationContent } from "./content";

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn(), replace: vi.fn() }),
}));

describe("GuideApplicationContent", () => {
  it("opens on step 1 of the application", () => {
    renderWithProviders(<GuideApplicationContent />);

    expect(screen.getByText("Step 1 of 2")).toBeInTheDocument();
    expect(screen.getByText("CREATE AN ACCOUNT")).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Let's get to know you" })).toBeInTheDocument();
    expect(screen.getByLabelText("How do you run your business?")).toHaveValue("individual");
  });
});
