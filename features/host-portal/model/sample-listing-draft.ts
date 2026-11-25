import { blankDraft } from "./listing-draft";
import type { ListingDraft } from "./listing-draft.types";

// The design's sample experience, filled in from start to finish, for the
// builder's "Filled" preview while the design is reviewed. Never saved.
const LONG_DESCRIPTION = [
  "We meet at the yellow gate beside Freedom Park an hour before sunset, when the light on Lagos Island turns warm and soft. You don't need a camera. Your phone is enough, and if you'd rather not hold anything at all, I'll shoot for you. You don't need to know how to pose either. Most people who come on this walk say they hate having their picture taken. By the end, they're asking for one more on the next corner.",
  "The walk covers six streets I photograph every week. I know where the light falls at each hour, which walls glow orange, which doorways frame a face, and which street sellers are happy to wave at a camera and which would rather not. We start on Broad Street, cut through the old Brazilian quarter with its carved balconies and faded shutters, and end near the Marina as the sun drops behind the water.",
  "At each stop I show you where to stand and what to do with your hands, which is the part nobody tells you about. Small things change a picture completely: turning your shoulder a little, looking past the lens instead of into it, walking towards the camera instead of standing still. I'll take portraits of each of you along the way, and I'll show you a few on the back of the camera so you can see the difference for yourself.",
  "Groups are small, never more than eight people, so everyone gets time in front of the lens and nobody waits around. Some people come alone and leave with new friends. Some come as couples, some as a group of colleagues on a day out. Families are welcome too, as long as the youngest can manage two hours on foot.",
  "We stop halfway for a cold drink at a kiosk I've been going to for years. It's a good moment to ask questions, swap phones and take pictures of each other. If you want to learn how to get better photos of your own friends and family, this is where I'll show you the settings I use on a phone and why they work.",
  "The streets are busy, so wear comfortable shoes and clothes you like being photographed in. Bright colours look wonderful against the old walls, but wear what makes you feel like yourself. Bring water if you get thirsty easily. If it rains, we walk anyway under the covered arcades, and the wet streets make some of the best photos of the year. If the weather is dangerous, I'll move the date and tell you the day before.",
  "Within two days of the walk, you'll get ten edited photos of yourself in your inbox, ready to post or print. Many guests use them as profile pictures, send them to family abroad, or print one for the wall. You'll also leave knowing how to take better pictures of the people you love, which lasts a lot longer than one afternoon.",
  "This walk isn't for anyone who wants a technical photography class with talk of apertures and lenses. It's for people who want to see Lagos Island properly, slow down for two hours, and come home with pictures they're proud of.",
].join("\n\n");

export const SAMPLE_DRAFT: ListingDraft = {
  ...blankDraft(),
  title: "Lagos Island photowalk at golden hour",
  hook: "Walk six streets on Lagos Island with a photographer who shows you where to stand. You leave with ten edited photos you'll actually post.",
  desc: LONG_DESCRIPTION,
  cats: ["Art & creativity"],
  subs: ["Photography walk"],
  tags: ["Photography", "Walking", "Golden hour", "Small group"],
  city: "Lagos",
  area: "Lagos Island",
  locations: [
    { name: "Freedom Park", lat: 6.4503, lng: 3.3958 },
    { name: "Tinubu Square", lat: 6.4541, lng: 3.3893 },
  ],
  cue: "The yellow gate on Hospital Road. I'll be wearing a red cap.",
  meetPhoto: "/images/home/cities/lagos.jpg",
  whenType: "recurring",
  days: ["Sat", "Sun"],
  every: 1,
  slots: ["16:00"],
  dur: "2",
  minG: "2",
  maxG: "8",
  price: "10000",
  refund: "full_refund_until",
  refundHours: "24",
  inc: ["Ten edited photos each, sent within two days", "A cold drink halfway"],
  exc: ["Transport to the meeting point"],
  bring: ["Water"],
  wear: ["Comfortable shoes"],
  fitness: "easy",
  agePolicy: "adult_required_under",
  ageMin: "12",
  access: "partly_accessible",
  photos: ["/images/home/cities/lagos.jpg", "/images/home/cities/abuja.jpg", "/images/home/cities/calabar.jpg", "/images/home/cities/ibadan.jpg"],
  cover: 0,
  quote: "See you at the yellow gate.",
};
