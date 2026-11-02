/** A city with bookable experiences (itin's GET /experiences/cities). */
export type ExperienceCity = {
  slug: string;
  name: string;
  country?: string | null;
  count: number;
  /** The cover of the city's best-rated experience, when it has one. */
  image_url?: string | null;
};

/** A "Discover by cities" tile. */
export type CityTile = {
  /** The slug: links to /cities/<id>. */
  id: string;
  name: string;
  country: string;
  imageSrc: string;
};

/** A search-bar "Where" suggestion. */
export type CityDestination = {
  id: string;
  city: string;
  description: string;
};
