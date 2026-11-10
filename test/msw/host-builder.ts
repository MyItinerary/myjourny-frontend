import { http, HttpResponse } from "msw";

import { apiUrl } from "./handlers";

export const CLOUDINARY = "https://res.cloudinary.com/demo/";

/** The meeting point the place search knows. */
export const FREEDOM_PARK = { name: "Freedom Park", lat: 6.4509, lng: 3.3936 };


/** Everything the listing builder reaches for: categories (none, so it uses
 * its own list), the place search, and photo uploads that come back as
 * Cloudinary links. `server.use(...builderHandlers())` in a test. */
export const builderHandlers = () => [
  http.get(apiUrl("/categories"), () => HttpResponse.json([])),
  http.get("https://nominatim.openstreetmap.org/search", ({ request }) => {
    const q = new URL(request.url).searchParams.get("q") ?? "";
    return HttpResponse.json(
      q.toLowerCase().includes("freedom")
        ? [{ name: FREEDOM_PARK.name, display_name: "Freedom Park, Old Broad Street, Lagos Island, Lagos, Nigeria", lat: String(FREEDOM_PARK.lat), lon: String(FREEDOM_PARK.lng) }]
        : [],
    );
  }),
  http.get(apiUrl("/guide/uploads/cloudinary-signature"), () =>
    HttpResponse.json({ signature: "sig", timestamp: 1, api_key: "key", cloud_name: "demo", folder: "experiences" }),
  ),
  // Each upload comes back named after what's in the file: a file holding
  // "a.jpg" becomes .../demo/a.jpg. (File names don't survive the form.)
  http.post("https://api.cloudinary.com/v1_1/demo/image/upload", async ({ request }) => {
    const file = (await request.formData()).get("file") as File;
    return HttpResponse.json({ secure_url: `${CLOUDINARY}${await file.text()}` });
  }),
];
