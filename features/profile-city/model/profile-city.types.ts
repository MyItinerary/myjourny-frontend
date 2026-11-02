/** A city as itin's /geo endpoints return it. */
export type CityOption = {
  name: string;
  region: string | null;
  country: string | null;
  country_code: string | null;
  latitude: number;
  longitude: number;
};

/** A city as a row in the picker. */
export type CityChoice = {
  /** Stable React key; two cities can share a name. */
  key: string;
  name: string;
  /** "Lagos, Nigeria": what tells same-named cities apart. */
  detail: string;
};

export type LocationPermission = "granted" | "prompt" | "denied" | "unknown";

export type Coordinates = { latitude: number; longitude: number };
