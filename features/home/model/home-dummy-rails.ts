// TODO(backend): these two rails are placeholders until the API has them.
//  - "Popular events you should check out" needs a popular-events listing endpoint.
//  - "Local food & drinks experiences" needs a category-filtered experiences
//    endpoint (the existing filter listing takes no category slug yet).
//  - "Unforgettable travel experiences" needs an endpoint that returns only
//    experiences in another city or country than the visitor's.
// Items carry no id/href and aren't saveable, so the cards render but don't link.

/** A placeholder card; assignable to the experience card's props. */
export type PlaceholderCard = {
  imageSrc: string;
  imageAlt: string;
  category: string;
  title: string;
  duration: string;
  rating: number;
  reviewCount: number;
  priceFrom: number | null;
  id?: string;
  href?: string;
  saveable: boolean;
};

const IMAGE = "/images/home/experiences/kayaking.jpg";

function placeholder(title: string, category: string, priceFrom: number): PlaceholderCard {
  return {
    imageSrc: IMAGE,
    imageAlt: title,
    category,
    title,
    duration: "1 hour",
    rating: 4,
    reviewCount: 0,
    priceFrom,
    saveable: false,
  };
}

export const DUMMY_POPULAR_EVENTS: PlaceholderCard[] = [
  placeholder("Kayaking in Victoria island, Paint and Sip & Two meals", "BEACH", 10000),
  placeholder("Sunset rooftop mixer with live music", "NIGHTLIFE", 15000),
  placeholder("Lagos street food festival", "FOOD", 5000),
  placeholder("Open-air art market and live painting", "ART", 7500),
  placeholder("Afrobeats beach party", "MUSIC", 12000),
];

export const DUMMY_LOCAL_FOOD_AND_DRINKS: PlaceholderCard[] = [
  placeholder("Street food crawl through Lagos Island", "FOOD", 10000),
  placeholder("Palm wine and suya tasting night", "DRINKS", 8000),
  placeholder("Cook jollof with a local chef", "FOOD", 20000),
  placeholder("Market tour and breakfast with a host", "FOOD", 9000),
  placeholder("Craft cocktails with a Lagos mixologist", "DRINKS", 18000),
];

// Always somewhere other than home: the category line is the city and country.
export const DUMMY_UNFORGETTABLE_TRAVEL: PlaceholderCard[] = [
  placeholder("Sunrise canopy walk in Kakum National Park", "CAPE COAST, GHANA", 45000),
  placeholder("Old Accra heritage and street food tour", "ACCRA, GHANA", 25000),
  placeholder("Sunset camel ride in the Sahara dunes", "MARRAKECH, MOROCCO", 120000),
  placeholder("Safari day in the Maasai Mara", "NAIROBI, KENYA", 280000),
  placeholder("Cape Winelands tasting by bike", "CAPE TOWN, SOUTH AFRICA", 95000),
];
