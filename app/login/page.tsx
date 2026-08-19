import type { Metadata } from "next";

import { LoginContent } from "./content";

export const metadata: Metadata = {
  title: "Login — MyJourny",
};

export default function LoginPage() {
  return <LoginContent />;
}
