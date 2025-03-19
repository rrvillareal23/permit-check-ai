# EV Permit Lookup API

This Next.js project provides an API to fetch location details (city, township, county) from a given address using Google Maps API and retrieves permit information for EV charger installations via OpenAI API.

## Features
- **Address Autofill**: Uses Google Maps API to ensure accurate address entry.
- **Location Parsing**: Extracts city, township, and county from the address.
- **Permit Information Retrieval**: Uses OpenAI to check if a permit is required and fetch relevant details.
- **Frontend UI**: User-friendly form to input information and display results.

## Installation

### Prerequisites
- Node.js (v18+ recommended)
- A Google Maps API Key (with Geocoding and Places enabled)
- An OpenAI API Key

### Setup
1. Clone the repository:
   ```sh
   git clone https://github.com/your-repo/ev-permit-lookup.git
   cd ev-permit-lookup
   ```
2. Install dependencies:
   ```sh
   npm install
   ```
3. Create a `.env.local` file and add:
   ```sh
   NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your-google-maps-api-key
   OPENAI_API_KEY=your-openai-api-key
   ```

## API Endpoints

### `POST /api/get-location`
**Description:** Retrieves city, township, and county from a given address.

#### Request Body:
```json
{
  "address": "123 Main St, Springfield, USA"
}
```

#### Response:
```json
{
  "city": "Springfield",
  "township": "",
  "county": "Hampden"
}
```

### `POST /api/get-permit-info`
**Description:** Uses OpenAI to determine if a permit is required and fetch relevant details.

#### Request Body:
```json
{
  "city": "Springfield",
  "county": "Hampden",
  "township": ""
}
```

#### Response:
```json
{
  "permitInfo": "Yes, a permit is required. The fee is $50.",
}
```

## How It Works
1. The user enters their name, email, and address.
2. The Google Maps API autofills the address, ensuring accuracy.
3. The backend extracts the city, township, and county from the address.
4. OpenAI searches for permit requirements based on the location.
5. The result is displayed, including whether a permit is needed and any associated fees.

## Running the Project
To start the development server:
```sh
npm run dev
```
The application will be available at `http://localhost:3000`.

## Deployment
This project can be deployed on Vercel:
```sh
npm install -g vercel
vercel
```

## License
This project is licensed under the MIT License.
