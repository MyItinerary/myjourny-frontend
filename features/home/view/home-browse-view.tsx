import Image from "next/image";
import Link from "next/link";

const TILES = [
  {
    href: "/experiences",
    title: "Experiences",
    subtitle: "Everything you can do, any day",
    image: "/images/home/browse/experiences.jpg",
  },
  {
    href: "/events",
    title: "Events",
    subtitle: "Everything on, by date",
    image: "/images/home/browse/events.jpg",
  },
];

// Figma "Browse everything" (698:29803): two 340px-tall tiles into the discovery pages.
export function HomeBrowseView() {
  return (
    <section className="w-full bg-[#fcfcfc]">
      <div className="mx-auto w-full max-w-[1512px] px-6 py-10 lg:px-32 lg:py-[53px]">
        <h2 className="pb-6 font-sans text-[28px] font-extrabold leading-normal text-[#333134]">
          Browse everything
        </h2>
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          {TILES.map((tile) => (
            <Link
              key={tile.href}
              href={tile.href}
              className="group relative flex h-[240px] flex-col justify-end overflow-hidden rounded-2xl p-7 text-white lg:h-[340px]"
            >
              <Image
                src={tile.image}
                alt=""
                fill
                sizes="(min-width: 1024px) 628px, 100vw"
                className="object-cover transition-transform duration-300 group-hover:scale-105"
              />
              <div aria-hidden className="absolute inset-0 bg-black/[0.29]" />
              <span className="relative font-sans text-[32px] font-extrabold leading-normal lg:text-[40px]">
                {tile.title}
              </span>
              <span className="relative font-sans text-lg leading-normal">{tile.subtitle}</span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
