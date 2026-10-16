import { notFound } from "next/navigation";

const SECTIONS: Record<string, string> = {
  profile: "Your profile",
  help: "Help and resources",
};

// Placeholders so every rail item has somewhere to go until each section is built.
export default async function HostSectionPage({ params }: { params: Promise<{ section: string }> }) {
  const { section } = await params;
  const title = SECTIONS[section];
  if (!title) notFound();

  return (
    <div className="flex-1 overflow-y-auto p-10">
      <h1 className="font-heading text-[32px] font-extrabold text-[#333134]">{title}</h1>
      <p className="mt-2 text-base text-[#6F6B72]">This section is coming next.</p>
    </div>
  );
}
