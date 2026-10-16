import { redirect } from "next/navigation";

/** Old story-motion lab URL → list enter presets. */
export default function StoryMotionLabRedirectPage() {
  redirect("/scrapped/art/list");
}
