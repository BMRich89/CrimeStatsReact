import { NextResponse } from 'next/server';
import { CrimeSearchResponse } from '@/app/types/crime';

// Disable TLS validation only in non-production environments (backend uses self-signed cert)
if (process.env.NODE_ENV !== 'production') {
  process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
}

// Lightweight server-side UK postcode regex — avoids bundling the full
// postcode-validator library (a client-side dependency) into the API route.
const POSTCODE_REGEX = /^[A-Z]{1,2}[0-9][0-9A-Z]?\s?[0-9][A-Z]{2}$/i;

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const postcode = searchParams.get('postcode');

  if (!postcode || postcode.trim() === '') {
    return NextResponse.json({ error: 'postcode query parameter is required' }, { status: 400 });
  }

  const cleanedPostcode = postcode.trim().replace(/\s+/g, '');
  if (!POSTCODE_REGEX.test(cleanedPostcode)) {
    return NextResponse.json({ error: 'Invalid UK postcode format' }, { status: 400 });
  }

  const apiUrl = process.env.API_HOST;
  if (!apiUrl) {
    return NextResponse.json({ error: 'API_HOST environment variable is not set' }, { status: 500 });
  }

  try {
    const res = await fetch(
      `${apiUrl}/CrimeByPostcode?postcode=${encodeURIComponent(cleanedPostcode)}`
    );
    if (!res.ok) {
      return NextResponse.json(
        { error: `Upstream error: ${res.statusText}` },
        { status: res.status }
      );
    }
    const data = await res.json();
    
    // Transform snake_case API response to camelCase for frontend
    const transformedData: CrimeSearchResponse = {
      crimes: data.crimes || [],
      searchRadiusMetres: data.search_radius_metres,
      searchCentreLat: data.search_center_lat,
      searchCentreLng: data.search_center_lng,
    };
    
    return NextResponse.json(transformedData);
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    return NextResponse.json({ error: `Failed to fetch crime data: ${message}` }, { status: 502 });
  }
}