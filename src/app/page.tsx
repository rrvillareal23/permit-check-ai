"use client";

import { useRef, useState } from "react";
import { useJsApiLoader, StandaloneSearchBox } from "@react-google-maps/api";

export default function Home() {
  const inputRef = useRef<google.maps.places.SearchBox | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    address: "",
  });
  const [permitInfo, setPermitInfo] = useState<{
    city: string;
    township: string;
    county: string;
    permitWebsite: string;
    permitInfo: string;
  } | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const { isLoaded } = useJsApiLoader({
    id: "google-map-script",
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY as string,
    libraries: ["places"],
  });

  const handleOnPlacesChanged = () => {
    if (!inputRef.current) {
      console.error("SearchBox ref is not set yet.");
      return;
    }

    const places = inputRef.current.getPlaces();
    if (places && places.length > 0) {
      const address = places[0].formatted_address || "";
      setFormData((prev) => ({ ...prev, address }));
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };
  const fetchPermitInfo = async (
    city: string,
    county: string,
    township: string
  ) => {
    try {
      const response = await fetch("/api/get-permit-info", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ city, county, township }),
      });

      if (!response.body) {
        throw new Error("Failed to get response body.");
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let result = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });

        const messages = chunk
          .split("data: ")
          .filter((line) => line.trim() !== "" && line.trim() !== "[DONE]")
          .map((line) => JSON.parse(line))
          .map((json) => json.choices?.[0]?.delta?.content || "")
          .join("");

        result += messages;

        setPermitInfo((prev) => ({
          ...(prev || {
            city,
            township,
            county,
            permitWebsite: "",
            permitInfo: "",
          }),
          permitInfo: result,
        }));
      }
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleLocationFetch = async () => {
    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/get-location", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ address: formData.address }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Something went wrong");
      }

      setPermitInfo(data);
      fetchPermitInfo(data.city, data.county, data.township);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    handleLocationFetch();
  };

  return (
    <main className="flex justify-center items-center min-h-screen bg-gray-100">
      <div className="bg-white p-6 rounded-lg shadow-md w-full max-w-md">
        <h1 className="text-2xl font-bold text-center mb-4">
          Enter Your Information
        </h1>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Full Name
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="John Doe"
              className="w-full p-3 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Email Address
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="johndoe@example.com"
              className="w-full p-3 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Address
            </label>
            {isLoaded && (
              <StandaloneSearchBox
                onLoad={(ref) => (inputRef.current = ref)}
                onPlacesChanged={handleOnPlacesChanged}
              >
                <input
                  type="text"
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  placeholder="Start typing your address"
                  className="w-full p-3 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                  required
                />
              </StandaloneSearchBox>
            )}
          </div>

          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-3 rounded-md font-semibold hover:bg-blue-700 transition"
            disabled={loading}
          >
            {loading ? "Fetching Info..." : "Submit"}
          </button>
        </form>

        {error && <p className="text-red-500 mt-4 text-center">{error}</p>}
        {permitInfo && (
          <div className="mt-4 p-3 bg-gray-100 border rounded-md">
            <h2 className="font-semibold">Location Details</h2>
            <p>
              <strong>City:</strong> {permitInfo.city}
            </p>
            <p>
              <strong>Township:</strong> {permitInfo.township}
            </p>
            <p>
              <strong>County:</strong> {permitInfo.county}
            </p>
            <h2 className="font-semibold mt-3">Permit Information</h2>
            <p>
              <strong>OpenAI Response:</strong>{" "}
              <a
                href={permitInfo.permitWebsite}
                target="_blank"
                className="text-blue-500"
              >
                {permitInfo.permitWebsite}
              </a>
            </p>
            <p>{permitInfo.permitInfo}</p>
          </div>
        )}
      </div>
    </main>
  );
}
