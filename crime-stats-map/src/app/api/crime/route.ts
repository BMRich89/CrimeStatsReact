
process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
// app/api/hello/route.ts
import { NextResponse } from 'next/server';

export async function GET(req:Request) {
      const { searchParams } = new URL(req.url);
  const postcode = searchParams.get("postcode");

  console.log("Received postcode:", postcode);

  const apiUrl = process.env.API_HOST;
  console.log("API URL:", apiUrl);
    if (!apiUrl) {
        return NextResponse.json({ error: 'API_HOST environment variable is not set' }, { status: 500 });
    }

    console.log("Fetching data from:", `${apiUrl}/CrimeByCategoryByPostcode?postcode=${postcode}`);
    const response = await fetch(`${apiUrl}/CrimeByCategoryByPostcode?postcode=${postcode}`).then(res => {
        if (!res.ok) {
            throw new Error(`Error fetching data: ${res.statusText}`);
        }
        return NextResponse.json(res.json());
    }); 
  return response;
}

export async function POST(req: Request) {
  const data = await req.json();
  return NextResponse.json({ received: data });
}
