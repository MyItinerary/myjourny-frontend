import { redirect } from "next/navigation";

export default function HostTermsRedirectPage() {
  redirect("/legal/hosts");
}
