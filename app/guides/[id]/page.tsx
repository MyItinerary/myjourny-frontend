import type { Metadata } from "next";
import { GuideProfileContent } from "./content";

export async function generateMetadata(): Promise<Metadata> {
  return { title: "Guide Profile | MyJourny" };
}

export default async function GuideProfilePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <GuideProfileContent id={id} />;
}
