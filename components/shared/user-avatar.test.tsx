import { fireEvent, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { renderWithProviders } from "@/test/utils/render";

import { UserAvatar, userInitials } from "./user-avatar";

describe("userInitials", () => {
  it("takes up to two initials from the name, else the first letter of the email", () => {
    expect(userInitials({ fullName: "Ada Obi", email: null })).toBe("AO");
    expect(userInitials({ fullName: "ada grace obi", email: null })).toBe("AG");
    expect(userInitials({ fullName: "Ada", email: "x@y.com" })).toBe("A");
    expect(userInitials({ fullName: "  ", email: "zed@y.com" })).toBe("Z");
    expect(userInitials({ fullName: null, email: null })).toBe("?");
  });
});

describe("UserAvatar", () => {
  it("shows the picture Google provided", () => {
    const { container } = renderWithProviders(
      <UserAvatar user={{ fullName: "Ada Obi", email: "a@b.com", avatarUrl: "https://lh3.googleusercontent.com/a/photo" }} />,
    );
    expect(container.querySelector("img")).toHaveAttribute("src", "https://lh3.googleusercontent.com/a/photo");
    expect(screen.queryByText("AO")).not.toBeInTheDocument();
  });

  it("shows initials on a plain background when there is no picture", () => {
    const { container } = renderWithProviders(
      <UserAvatar user={{ fullName: "Ada Obi", email: "a@b.com", avatarUrl: null }} />,
    );
    expect(screen.getByText("AO")).toBeInTheDocument();
    expect(container.querySelector("img")).toBeNull();
  });

  it("falls back to initials when the picture can't load", () => {
    const { container } = renderWithProviders(
      <UserAvatar user={{ fullName: "Ada Obi", email: "a@b.com", avatarUrl: "https://broken.test/p.jpg" }} />,
    );
    fireEvent.error(container.querySelector("img")!);
    expect(screen.getByText("AO")).toBeInTheDocument();
  });

  it("shows the default icon to a signed-out visitor", () => {
    const { container } = renderWithProviders(<UserAvatar user={null} />);
    expect(container.querySelector("img")).toHaveAttribute("src", expect.stringContaining("profile-button"));
  });
});
