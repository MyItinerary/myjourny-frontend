import type { PlaceResult } from "./listing-draft.types";

// Places hosts pick most, offered as chips on the location step so they can
// select one without searching. Pins sit at the middle of each area.
export const POPULAR_LOCATIONS: PlaceResult[] = [
  { name: "Lekki Phase 1", area: "Lekki, Lagos", lat: 6.4478, lng: 3.4723, city: "Lagos", district: "Lekki Phase 1" },
  { name: "Victoria Island", area: "Lagos", lat: 6.4281, lng: 3.4219, city: "Lagos", district: "Victoria Island" },
  { name: "Ikoyi", area: "Lagos", lat: 6.4549, lng: 3.4366, city: "Lagos", district: "Ikoyi" },
  { name: "Lagos Island", area: "Lagos", lat: 6.455, lng: 3.3941, city: "Lagos", district: "Lagos Island" },
  { name: "Yaba", area: "Lagos", lat: 6.5095, lng: 3.3711, city: "Lagos", district: "Yaba" },
  { name: "Ikeja", area: "Lagos", lat: 6.6018, lng: 3.3515, city: "Lagos", district: "Ikeja" },
  { name: "Abuja", area: "FCT", lat: 9.0765, lng: 7.3986, city: "Abuja" },
  { name: "Abeokuta", area: "Ogun", lat: 7.1475, lng: 3.3619, city: "Abeokuta" },
  { name: "Ibadan", area: "Oyo", lat: 7.3775, lng: 3.947, city: "Ibadan" },
  { name: "Calabar", area: "Cross River", lat: 4.9757, lng: 8.3417, city: "Calabar" },
  { name: "Port Harcourt", area: "Rivers", lat: 4.8156, lng: 7.0498, city: "Port Harcourt" },
  { name: "Jos", area: "Plateau", lat: 9.8965, lng: 8.8583, city: "Jos" },
];
