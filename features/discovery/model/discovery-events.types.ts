/** A portrait poster card ("Popular events happening today"). */
export type PosterEvent = {
  id: string;
  category: string;
  title: string;
  dateLabel: string;
  priceLabel: string;
  imageSrc: string;
};

/** A "Discover/Card" event: date chip, location and price under the photo. */
export type DiscoverEvent = {
  id: string;
  title: string;
  month: string;
  day: string;
  whenLabel: string;
  location: string;
  priceLabel: string;
  imageSrc: string;
};
