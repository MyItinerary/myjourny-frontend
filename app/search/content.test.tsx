import { screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { renderWithProviders } from "@/test/utils/render";
import { SearchContent } from "./content";

const listState = vi.hoisted(() => ({
  data: undefined as { pages: Array<{ items: unknown[]; total?: number }> } | undefined,
  isPending: false,
  isError: false,
  error: null as unknown,
  refetch: vi.fn(),
  lastFilters: undefined as Record<string, unknown> | undefined,
}));

const navState = vi.hoisted(() => ({ query: "kayak" }));

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn(), replace: vi.fn(), back: vi.fn() }),
  useSearchParams: () => new URLSearchParams(navState.query ? `q=${navState.query}` : ""),
  usePathname: () => "/search",
}));

vi.mock("@/components/home/home-nav", () => ({ HomeNav: () => <nav data-testid="home-nav" /> }));
vi.mock("@/features/footer", () => ({ Footer: () => <footer data-testid="footer" /> }));
vi.mock("@/features/taste-quiz-cta", () => ({
  TasteQuizCtaView: () => null,
  useTasteQuizCtaViewModel: () => ({ isVisible: false, onDismiss: vi.fn(), href: "/quiz" }),
  useTasteQuizAudience: () => "guest",
}));

vi.mock("@/lib/queries/experiences", () => ({
  useInfiniteFilteredExperiences: (filters: Record<string, unknown>) => {
    listState.lastFilters = filters;
    return {
      data: listState.data,
      isPending: listState.isPending,
      isError: listState.isError,
      error: listState.error,
      hasNextPage: false,
      isFetchingNextPage: false,
      isFetchNextPageError: false,
      refetch: listState.refetch,
      fetchNextPage: vi.fn(),
    };
  },
  experienceListItemToCardProps: (item: { id: string; title: string }) => ({
    id: item.id,
    title: item.title,
    category: "Lagos",
    imageAlt: item.title,
    imageSrc: "/images/kayak.jpg",
    rating: 4.8,
    reviewCount: 10,
    priceFrom: 10000,
    currency: "NGN",
    duration: "2 hours",
  }),
}));

vi.mock("@/components/experiences/experience-card-vertical", () => ({
  ExperienceCardVertical: ({ title }: { title: string }) => (
    <div data-testid="experience-card">{title}</div>
  ),
}));

function setList(state: Partial<typeof listState>) {
  Object.assign(listState, { data: undefined, isPending: false, isError: false, error: null }, state);
}

describe("SearchContent", () => {
  it("starts the date filter from the link", () => {
    navState.query = "kayak&date=2030-06-01";
    setList({ data: { pages: [{ items: [], total: 0 }] } });
    renderWithProviders(<SearchContent />);
    expect(listState.lastFilters).toMatchObject({ search: "kayak", date: "2030-06-01" });
    navState.query = "kayak";
  });

  it("lists from the public listing with the typed text", () => {
    setList({ data: { pages: [{ items: [], total: 0 }] } });
    renderWithProviders(<SearchContent />);
    expect(listState.lastFilters).toMatchObject({ search: "kayak" });
  });

  it("shows skeletons, and no empty state, while pending", () => {
    setList({ isPending: true });
    const { container } = renderWithProviders(<SearchContent />);

    expect(container.querySelectorAll(".animate-pulse").length).toBeGreaterThan(0);
    expect(screen.queryByText("No results found")).not.toBeInTheDocument();
  });

  it("shows the error, not an empty state, and retries on 'Try again'", async () => {
    const refetch = vi.fn();
    setList({ isError: true, refetch });
    const { user } = renderWithProviders(<SearchContent />);

    expect(screen.getByText("(Failed to load)")).toBeInTheDocument();
    expect(screen.queryByText("No results found")).not.toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Try again" }));
    expect(refetch).toHaveBeenCalledOnce();
  });

  it("shows the empty state when nothing matches", () => {
    setList({ data: { pages: [{ items: [], total: 0 }] } });
    renderWithProviders(<SearchContent />);
    expect(screen.getByText("No results found")).toBeInTheDocument();
  });

  it("shows the cards and count when results load", () => {
    setList({ data: { pages: [{ items: [{ id: "exp-1", title: "Lekki Kayak Trail" }], total: 1 }] } });
    renderWithProviders(<SearchContent />);

    expect(screen.getByText("Lekki Kayak Trail")).toBeInTheDocument();
    expect(screen.getByText("(1 result)")).toBeInTheDocument();
  });

  it("keeps loaded results and their count if a refetch fails", () => {
    setList({ isError: true, data: { pages: [{ items: [{ id: "exp-1", title: "Lekki Kayak Trail" }], total: 1 }] } });
    renderWithProviders(<SearchContent />);

    expect(screen.getByText("Lekki Kayak Trail")).toBeInTheDocument();
    expect(screen.getByText("(1 result)")).toBeInTheDocument();
    expect(screen.queryByText("(Failed to load)")).not.toBeInTheDocument();
  });
});
