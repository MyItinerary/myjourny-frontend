import { CarouselNext, CarouselPrevious } from "@/components/ui/carousel";

// The rail heading with its grey/red arrows. Must sit inside a <Carousel>.
export function RailHeaderView({ heading }: { heading: string }) {
  return (
    <div className="flex items-center justify-between gap-4">
      <h2 className="font-sans text-[28px] font-extrabold leading-[120%] text-[#333134]">{heading}</h2>
      <div className="flex shrink-0 items-center gap-1">
        <CarouselPrevious className="static size-10 translate-y-0 border-0 bg-[#fafafa] text-foreground hover:bg-muted" />
        <CarouselNext className="static size-10 translate-y-0 border-0 bg-brand text-white hover:bg-brand/90" />
      </div>
    </div>
  );
}
