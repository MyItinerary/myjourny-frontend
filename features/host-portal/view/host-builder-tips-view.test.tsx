import { render, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { HostBuilderTipsView } from "./host-builder-tips-view";

describe("HostBuilderTipsView", () => {
  it("shows a good and a weak title, and nothing about the descriptions", () => {
    render(<HostBuilderTipsView field="title" />);
    const tips = screen.getByRole("complementary", { name: "Tips for the title" });

    expect(within(tips).getByRole("img", { name: "Good" })).toBeInTheDocument();
    expect(within(tips).getByRole("img", { name: "Not so good" })).toBeInTheDocument();
    expect(within(tips).getByText("Lagos Island photowalk at golden hour")).toBeInTheDocument();
    expect(within(tips).getByText("Amazing photography experience!!!")).toBeInTheDocument();
    expect(screen.queryByText(/describe the feeling/)).not.toBeInTheDocument();
  });

  it("shows the short description's tip", () => {
    render(<HostBuilderTipsView field="hook" />);
    expect(screen.getByRole("complementary", { name: "Tips for the short description" })).toHaveTextContent(/describe the feeling/);
  });

  it("ends the long description's tip with what to answer", () => {
    render(<HostBuilderTipsView field="desc" />);
    const tips = screen.getByRole("complementary", { name: "Tips for the long description" });
    expect(within(tips).getByText(/who is it not for/)).toBeInTheDocument();
  });
});
