// itin has no per-experience itinerary field in the DTO at all — and the
// steps in the reference screenshots ("hotel pickup", "park gate",
// "wildlife") don't match the kayaking/city-experience content shown
// alongside them, a clear sign this is placeholder content in the design
// itself, not real per-experience data. Rendered here as static content
// so the page's visual structure is complete; wire to a real field once
// itin has one.
const STEPS = [
  { title: "Await hotel pickup", description: "Get picked up at your hotel at 6:00 am" },
  { title: "Drive to park gate", description: "Arrive at the entrance to the park by sunrise. Purchase the park entrance ticket with a credit card" },
  { title: "Spot wildlife", description: "See animals in natural habitats" },
  { title: "Enjoy park scenery", description: "Observe the Maasai wilderness" },
  { title: "Return to hotel", description: "Get dropped off at your hotel" },
];

export function ExperienceItinerary() {
  return (
    <div className="flex flex-col gap-5">
      {STEPS.map((step, index) => (
        <div key={step.title} className="flex items-start gap-3">
          <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-muted text-sm font-medium text-foreground">
            {index + 1}
          </div>
          <div className="flex flex-col gap-0.5 pt-0.5">
            <span className="text-base font-medium text-foreground">{step.title}</span>
            <span className="text-sm text-muted-foreground">{step.description}</span>
          </div>
        </div>
      ))}
      <p className="text-xs text-muted-foreground">ⓘ Please note itinerary is subject to change</p>
    </div>
  );
}
