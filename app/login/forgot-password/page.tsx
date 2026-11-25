import type { Metadata } from "next";

import { ForgotPasswordContent } from "./content";

export const metadata: Metadata = {
  title: "Forgot password | Myjourny",
};

export default function ForgotPasswordPage() {
  return <ForgotPasswordContent />;
}
