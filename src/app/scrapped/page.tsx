import { redirect } from "next/navigation";

/** Canonical Scrapped lives at `/`. Keep this path for old links. */
export default function ScrappedRedirectPage() {
  redirect("/");
}
