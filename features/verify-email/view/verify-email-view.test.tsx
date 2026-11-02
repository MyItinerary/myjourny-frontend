import { screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { renderWithProviders } from "@/test/utils/render";

import { VerifyEmailView } from "./verify-email-view";

describe("VerifyEmailView", () => {
  it("shows the result and where to go next", () => {
    renderWithProviders(
      <VerifyEmailView status="verified" heading="Email verified" subtitle="You're all set." ctaLabel="Start exploring" ctaHref="/" />,
    );

    expect(screen.getByRole("heading", { name: "Email verified" })).toBeInTheDocument();
    expect(screen.getByText("You're all set.")).toBeInTheDocument();
    expect(screen.getByText("Start exploring").closest("a")).toHaveAttribute("href", "/");
  });

  it("has no button while it's still checking the link", () => {
    renderWithProviders(
      <VerifyEmailView status="verifying" heading="Verifying your email…" subtitle="One moment." ctaLabel="" ctaHref="" />,
    );

    expect(screen.getByRole("heading", { name: "Verifying your email…" })).toBeInTheDocument();
    expect(screen.queryByRole("button")).not.toBeInTheDocument();
  });
});
