import { NextResponse } from "next/server";
import { fetchAndStoreScrappedApiLab } from "@/lib/load-scrapped-api-lab";

const ALLOWED_NEXT = new Set(["/scrapped/api", "/scrapped/lab"]);

export async function POST(request: Request) {
  const form = await request.formData();
  const raw = String(form.get("next") ?? "/scrapped/lab");
  const next = ALLOWED_NEXT.has(raw) ? raw : "/scrapped/lab";

  await fetchAndStoreScrappedApiLab();

  const base = (process.env.AUTH_URL ?? "http://127.0.0.1:3000").replace(
    /\/$/,
    "",
  );
  return NextResponse.redirect(`${base}${next}`, { status: 303 });
}
