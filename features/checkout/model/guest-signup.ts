import { useMutation } from "@tanstack/react-query";

import { useSession } from "@/lib/auth/session-store";
import { useActivateUser, useCreateTempUser, useGoogleAuth } from "@/lib/queries/auth";

/** Gives a guest an account from just an email: itin makes a temporary user,
 * then activates it with the address. A retry reuses the temporary user a
 * failed attempt left behind. */
export function useGuestEmailSignup() {
  const { user } = useSession();
  const createTemp = useCreateTempUser();
  const activate = useActivateUser();

  return useMutation({
    mutationFn: async (email: string) => {
      const userId = user && !user.email && user.id ? user.id : (await createTemp.mutateAsync()).user_id;
      await activate.mutateAsync({ user_id: userId, email });
    },
  });
}

/** Signs in (or up) with a Google credential. */
export function useGuestGoogleSignup() {
  return useGoogleAuth();
}
