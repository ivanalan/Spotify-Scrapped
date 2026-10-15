import { redirect } from "next/navigation";

/** Motion lab was removed — send old links to the metrics lab. */
export default function StoryMotionLabRedirectPage() {
  redirect("/scrapped/lab");
}
