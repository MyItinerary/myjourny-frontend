import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { BroadcastVsMatchSection } from "./broadcast-vs-match-section";

describe("BroadcastVsMatchSection", () => {
  it("renders comparison pills and copy accurately", () => {
    render(<BroadcastVsMatchSection />);

    expect(screen.getByText(/Your followers are a broadcast\./i)).toBeInTheDocument();
    expect(screen.getByText("Posting it yourself")).toBeInTheDocument();
    expect(screen.getByText("Listing on MyJourny")).toBeInTheDocument();
    expect(screen.getByText("Example taste profile")).toBeInTheDocument();
    expect(screen.getByText("Adire dyeing workshop")).toBeInTheDocument();
  });
});
