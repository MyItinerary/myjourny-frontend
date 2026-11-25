import { screen } from "@testing-library/react";
import { http, HttpResponse } from "msw";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { apiUrl } from "@/test/msw/handlers";
import { server } from "@/test/msw/server";
import { renderWithProviders } from "@/test/utils/render";
import { BecomeAGuideContent } from "./content";

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: vi.fn(),
  }),
}));

vi.mock("@/features/footer", () => ({
  Footer: () => <footer data-testid="mock-footer" />,
}));

describe("BecomeAGuideContent", () => {
  beforeEach(() => {
    server.use(
      http.get(apiUrl("/experiences/filter"), () => {
        return HttpResponse.json({ items: [] });
      })
    );
  });
  it("renders the become a guide content wrapper", () => {
    renderWithProviders(<BecomeAGuideContent />);
    expect(
      screen.getByRole("heading", { name: /You built the audience\. Start earning from it\./i })
    ).toBeInTheDocument();
  });
});
