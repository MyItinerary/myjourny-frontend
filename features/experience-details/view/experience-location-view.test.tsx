import { screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { renderWithProviders } from "@/test/utils/render";

import { ExperienceLocationView } from "./experience-location-view";

describe("ExperienceLocationView", () => {
  it("shows a real map of the area and says the exact spot comes after booking", () => {
    renderWithProviders(
      <ExperienceLocationView
        location={{ mode: "approximate", label: "Lagos, Nigeria", embedUrl: "https://www.openstreetmap.org/export/embed.html?bbox=1" }}
      />,
    );
    expect(screen.getByTitle("Map of Lagos, Nigeria")).toHaveAttribute(
      "src",
      "https://www.openstreetmap.org/export/embed.html?bbox=1",
    );
    expect(screen.getByText(/general area.*Exact meeting point shared after booking/)).toBeInTheDocument();
  });

  it("gives a booked traveller the exact pin, instructions and directions", () => {
    renderWithProviders(
      <ExperienceLocationView
        heading="Where to meet"
        location={{
          mode: "exact",
          label: "Lagos, Nigeria",
          latitude: 6.49,
          longitude: 3.39,
          instructions: "Blue gate at the jetty",
          embedUrl: "https://www.openstreetmap.org/export/embed.html?marker=6.49,3.39",
          directionsUrl: "https://www.google.com/maps/dir/?api=1&destination=6.49,3.39",
        }}
      />,
    );
    expect(screen.getByRole("heading", { name: "Where to meet" })).toBeInTheDocument();
    expect(screen.getByTitle("Meeting point map")).toBeInTheDocument();
    expect(screen.getByText("Blue gate at the jetty")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Get directions" })).toHaveAttribute(
      "href",
      "https://www.google.com/maps/dir/?api=1&destination=6.49,3.39",
    );
    expect(screen.queryByText(/shared after booking/)).not.toBeInTheDocument();
  });

  it("shows only the map when the page lists the details itself", () => {
    renderWithProviders(
      <ExperienceLocationView
        heading="Where to meet"
        mapOnly
        location={{
          mode: "exact",
          label: "Lagos, Nigeria",
          latitude: 6.49,
          longitude: 3.39,
          instructions: "Blue gate at the jetty",
          embedUrl: "https://www.openstreetmap.org/export/embed.html?marker=6.49,3.39",
          directionsUrl: "https://www.google.com/maps/dir/?api=1&destination=6.49,3.39",
        }}
      />,
    );
    expect(screen.getByTitle("Meeting point map")).toBeInTheDocument();
    expect(screen.queryByText("Blue gate at the jetty")).not.toBeInTheDocument();
    expect(screen.queryByRole("link", { name: "Get directions" })).not.toBeInTheDocument();
  });

  it("shows instructions without a map when there are no coordinates", () => {
    renderWithProviders(
      <ExperienceLocationView location={{ mode: "exact-text", label: "Lagos, Nigeria", instructions: "Call on arrival" }} />,
    );
    expect(screen.getByText("Call on arrival")).toBeInTheDocument();
    expect(screen.queryByRole("link", { name: "Get directions" })).not.toBeInTheDocument();
  });

  it("shows only the city without coordinates, and nothing without a location", () => {
    renderWithProviders(<ExperienceLocationView location={{ mode: "label", label: "Lagos, Nigeria" }} />);
    expect(screen.getByText("Lagos, Nigeria")).toBeInTheDocument();
    expect(screen.queryByRole("link")).not.toBeInTheDocument();

    const { container } = renderWithProviders(<ExperienceLocationView location={null} />);
    expect(container).toBeEmptyDOMElement();
  });
});
