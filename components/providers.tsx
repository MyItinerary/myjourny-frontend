'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { GoogleOAuthProvider } from '@react-oauth/google';
import { TooltipProvider } from '@/components/ui/tooltip';
import { Toaster } from '@/components/ui/sonner';
import { useState } from 'react';
import { LayoutGroup } from 'motion/react';
import { WishlistSaveProvider } from '@/components/wishlists/wishlist-save-provider';
import { SignInLoaderView, useSignInLoaderViewModel } from '@/features/sign-in-loader';

const GOOGLE_CLIENT_ID = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || '';

// Covers the screen from signing in until the next page has loaded.
function SignInLoader() {
  const vm = useSignInLoaderViewModel();
  return <SignInLoaderView {...vm} />;
}

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: { retry: 1, staleTime: 30_000 },
        },
      })
  );

  return (
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <LayoutGroup id="myjourny-global-layout">
            <WishlistSaveProvider>{children}</WishlistSaveProvider>
            <Toaster richColors position="top-right" />
            <SignInLoader />
          </LayoutGroup>
        </TooltipProvider>
      </QueryClientProvider>
    </GoogleOAuthProvider>
  );
}
