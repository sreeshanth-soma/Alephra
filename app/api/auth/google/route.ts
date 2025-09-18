import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";

// Verify Google ID token using tokeninfo endpoint (avoids extra deps)
async function verifyGoogleIdToken(idToken: string): Promise<{ sub: string; email?: string; name?: string; picture?: string; aud?: string } | null> {
  try {
    const res = await fetch(`https://oauth2.googleapis.com/tokeninfo?id_token=${encodeURIComponent(idToken)}`);
    if (!res.ok) return null;
    const data = await res.json();
    // Minimal fields
    return {
      sub: data.sub,
      email: data.email,
      name: data.name,
      picture: data.picture,
      aud: data.aud,
    };
  } catch {
    return null;
  }
}

export async function POST(req: NextRequest) {
  const { credential } = await req.json().catch(() => ({ credential: undefined }));
  if (!credential) {
    return NextResponse.json({ error: "Missing credential" }, { status: 400 });
  }

  const googlePayload = await verifyGoogleIdToken(credential);
  if (!googlePayload) {
    return NextResponse.json({ error: "Invalid Google token" }, { status: 401 });
  }

  const expectedAud = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
  if (!expectedAud) {
    return NextResponse.json({ error: "Server misconfigured: NEXT_PUBLIC_GOOGLE_CLIENT_ID is missing" }, { status: 500 });
  }
  if (googlePayload.aud !== expectedAud) {
    return NextResponse.json({ error: "Client ID mismatch: token audience does not match configured client" }, { status: 400 });
  }

  const secret = process.env.AUTH_SECRET;
  if (!secret) {
    return NextResponse.json({ error: "Server misconfigured: AUTH_SECRET is missing" }, { status: 500 });
  }

  const sessionJwt = jwt.sign(
    {
      userId: googlePayload.sub,
      email: googlePayload.email,
      name: googlePayload.name,
      picture: googlePayload.picture,
      provider: "google",
    },
    secret,
    { expiresIn: "7d" }
  );

  const res = NextResponse.json({ ok: true });
  // Secure, httpOnly cookie
  res.cookies.set("session", sessionJwt, {
    httpOnly: true,
    sameSite: "lax",
    // Use secure cookies only in production; on http://localhost this must be false
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });
  return res;
}


