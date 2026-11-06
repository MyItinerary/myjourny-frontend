import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { GuideApplicationContent } from "./content";

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn() }),
}));

describe("GuideApplicationContent", () => {
  it("renders guide application view and step 1 fields", () => {
    render(<GuideApplicationContent />);

    expect(screen.getByText("CREATE AN ACCOUNT")).toBeInTheDocument();
    expect(screen.getByText("Let's get to know you")).toBeInTheDocument();
    expect(screen.getByText("An individual")).toBeInTheDocument();
  });
});
