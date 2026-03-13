// Note: TLS validation is disabled in development to support self-signed certificates
// on the local backend. Remove this block when the backend has a valid certificate.
if (process.env.NODE_ENV !== "production") {
  process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
}
import { NextResponse } from 'next/server';

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const postcode = searchParams.get("postcode");

  const apiUrl = process.env.API_HOST;
  if (!apiUrl) {
    return NextResponse.json({ error: 'API_HOST environment variable is not set' }, { status: 500 });
  }

  if (!postcode || postcode.trim() === "") {
    return NextResponse.json({ error: 'postcode query parameter is required' }, { status: 400 });
  }

  try {
    const res = await fetch(`${apiUrl}/CrimeByCategoryByPostcode?postcode=${encodeURIComponent(postcode)}`);
    if (!res.ok) {
      return NextResponse.json({ error: `Error fetching data: ${res.statusText}` }, { status: res.status });
    }
    const data = await res.json();
    return NextResponse.json(data);
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  const data = await req.json();
  return NextResponse.json({ received: data });
}
