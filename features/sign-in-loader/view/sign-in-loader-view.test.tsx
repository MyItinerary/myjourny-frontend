import { render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { SignInLoaderView } from "./sign-in-loader-view";

describe("SignInLoaderView", () => {
  it("covers the screen with the logo while signing in", () => {
    render(<SignInLoaderView visible />);

    const loader = screen.getByRole("status");
    expect(loader).toHaveClass("fixed", "inset-0", "bg-white");
    expect(screen.getByAltText("MyJourny")).toBeInTheDocument();
    expect(loader).toHaveTextContent("Signing you in…");
  });

  it("shows nothing otherwise", () => {
    render(<SignInLoaderView visible={false} />);

    expect(screen.queryByRole("status")).not.toBeInTheDocument();
  });

  it("goes away when it's no longer needed", async () => {
    const { rerender } = render(<SignInLoaderView visible />);

    rerender(<SignInLoaderView visible={false} />);

    await waitFor(() => expect(screen.queryByRole("status")).not.toBeInTheDocument());
  });
});
