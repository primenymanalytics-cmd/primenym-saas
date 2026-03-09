import { NextResponse } from 'next/server';

export async function GET(req: Request) {
    const { searchParams, origin } = new URL(req.url);
    const queryString = searchParams.toString();

    // Redirect the user to the frontend authorization interface
    return NextResponse.redirect(`${origin}/oauth/authorize?${queryString}`);
}
