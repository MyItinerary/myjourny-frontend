import { redirect } from "next/navigation";

export default function LegalIndexRedirectPage() {
  redirect("/legal/terms");
}
