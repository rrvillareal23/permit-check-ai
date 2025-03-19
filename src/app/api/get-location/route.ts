import { NextResponse } from "next/server";

const GEOCODE_URL = "https://maps.googleapis.com/maps/api/geocode/json";

export async function POST(req: Request) {
  try {
    const { address } = await req.json();
    if (!address) {
      return NextResponse.json(
        { error: "Address is required" },
        { status: 400 }
      );
    }

    const response = await fetch(
      `${GEOCODE_URL}?address=${encodeURIComponent(address)}&key=${
        process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY
      }`
    );
    const data = await response.json();

    if (data.status !== "OK" || !data.results.length) {
      return NextResponse.json(
        { error: "Invalid address or API error" },
        { status: 400 }
      );
    }

    let city = "",
      township = "",
      county = "";
    for (const component of data.results[0].address_components) {
      if (component.types.includes("locality")) city = component.long_name;
      if (component.types.includes("administrative_area_level_2"))
        county = component.long_name.replace(" County", "");
      if (
        component.types.includes("sublocality_level_1") ||
        component.types.includes("administrative_area_level_3")
      )
        township = component.long_name;
    }

    return NextResponse.json({ city, township, county }, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to retrieve location data" },
      { status: 500 }
    );
  }
}
