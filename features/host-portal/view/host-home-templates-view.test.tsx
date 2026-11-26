import { screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { renderWithProviders } from "@/test/utils/render";

import { HostHomeTemplatesView } from "./host-home-templates-view";

const TEMPLATES = {
  heading: "Templates you can start from",
  items: [
    { id: "portrait-walk", href: "/host/dashboard/listings/new?template=portrait-walk", imageUrl: "/1.jpg", eyebrow: "Art & creativity", title: "Golden hour portrait walk", sub: "Six people.", money: "8 guests × ₦10,000 = ₦80,000" },
    { id: "boat-morning", href: "/host/dashboard/listings/new?template=boat-morning", imageUrl: "/3.jpg", eyebrow: "Water activity", title: "Boat morning", sub: "One boat.", money: "5 guests × ₦18,000 = ₦90,000" },
  ],
};

describe("HostHomeTemplatesView", () => {
  it("shows each template with what it could make", () => {
    renderWithProviders(<HostHomeTemplatesView templates={TEMPLATES} />);

    expect(screen.getByRole("heading", { name: "Templates you can start from" })).toBeInTheDocument();
    expect(screen.getByText("Golden hour portrait walk")).toBeInTheDocument();
    expect(screen.getByText("5 guests × ₦18,000 = ₦90,000")).toBeInTheDocument();
  });

  it("opens the builder with the template each card is for", () => {
    renderWithProviders(<HostHomeTemplatesView templates={TEMPLATES} />);

    expect(screen.getAllByRole("link", { name: "Use this template" }).map((l) => l.getAttribute("href"))).toEqual([
      "/host/dashboard/listings/new?template=portrait-walk",
      "/host/dashboard/listings/new?template=boat-morning",
    ]);
  });
});
