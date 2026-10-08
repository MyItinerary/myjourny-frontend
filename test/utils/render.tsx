import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, renderHook, type RenderOptions } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { ReactElement, ReactNode } from "react";

// Mirrors components/providers.tsx, minus anything that needs a browser
// runtime (Google OAuth, motion). Retries are off so failures surface at once.
export function createTestQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: { retry: false, staleTime: Infinity, gcTime: Infinity },
      mutations: { retry: false },
    },
  });
}

function createWrapper(queryClient: QueryClient) {
  return function Wrapper({ children }: { children: ReactNode }) {
    return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
  };
}

/** Render a view/component with app providers. Returns RTL utils + a userEvent instance. */
export function renderWithProviders(
  ui: ReactElement,
  { queryClient = createTestQueryClient(), ...options }: RenderOptions & { queryClient?: QueryClient } = {},
) {
  return {
    user: userEvent.setup(),
    queryClient,
    ...render(ui, { wrapper: createWrapper(queryClient), ...options }),
  };
}

/** Render a model or view-model hook with app providers. */
export function renderHookWithProviders<Result, Props>(
  hook: (props: Props) => Result,
  { queryClient = createTestQueryClient(), initialProps }: { queryClient?: QueryClient; initialProps?: Props } = {},
) {
  return {
    queryClient,
    ...renderHook(hook, { wrapper: createWrapper(queryClient), initialProps }),
  };
}
