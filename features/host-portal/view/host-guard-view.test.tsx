import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { HostGuardView } from "./host-guard-view";

describe("HostGuardView", () => {
  it("holds the dashboard back while the account is checked", () => {
    render(
      <HostGuardView ready={false} banner={null}>
        <p>Your listings</p>
      </HostGuardView>,
    );
    expect(screen.getByText("Checking your account…")).toBeInTheDocument();
    expect(screen.queryByText("Your listings")).not.toBeInTheDocument();
  });

  it("shows the dashboard under the application banner", () => {
    render(
      <HostGuardView ready banner={{ title: "Your guide application is in review", body: "We'll email you." }}>
        <p>Your listings</p>
      </HostGuardView>,
    );
    expect(screen.getByRole("status")).toHaveTextContent("Your guide application is in review");
    expect(screen.getByText("Your listings")).toBeInTheDocument();
  });

  it("shows no banner for an approved guide", () => {
    render(
      <HostGuardView ready banner={null}>
        <p>Your listings</p>
      </HostGuardView>,
    );
    expect(screen.queryByRole("status")).not.toBeInTheDocument();
  });
});
