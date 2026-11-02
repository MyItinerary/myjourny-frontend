import { screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { renderWithProviders } from "@/test/utils/render";

import { VerifyEmailNoticeView } from "./verify-email-notice-view";

describe("VerifyEmailNoticeView", () => {
  it("asks the person to verify and resends the link on request", async () => {
    const onResend = vi.fn();
    const { user } = renderWithProviders(<VerifyEmailNoticeView visible sending={false} sent={false} onResend={onResend} />);

    expect(screen.getByText("Verify your email")).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Resend link" }));
    expect(onResend).toHaveBeenCalledOnce();
  });

  it("says where to look once a link has gone out", () => {
    renderWithProviders(<VerifyEmailNoticeView visible sending={false} sent onResend={() => {}} />);

    expect(screen.getByText(/Check your inbox/)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Send again" })).toBeInTheDocument();
  });

  it("disables the button while sending", () => {
    renderWithProviders(<VerifyEmailNoticeView visible sending sent={false} onResend={() => {}} />);

    expect(screen.getByRole("button", { name: "Sending…" })).toBeDisabled();
  });

  it("renders nothing for a verified account", () => {
    const { container } = renderWithProviders(
      <VerifyEmailNoticeView visible={false} sending={false} sent={false} onResend={() => {}} />,
    );

    expect(container).toBeEmptyDOMElement();
  });
});
