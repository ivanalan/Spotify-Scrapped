"use client";

import { closeOutline } from "ionicons/icons";
import { Icon } from "@/components/Icon";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type Props = {
  className?: string;
  /** Gate uses outline Button; deck chrome keeps the close icon. */
  appearance?: "icon" | "text";
};

/**
 * Paper tones use hex — AlertDialog portals outside `.wrapped-story`, so
 * `--wrapped-*` vars do not resolve (transparent panel + wrong text).
 * Global shadcn tokens are dark-theme; force ink contrast (D-003).
 *
 * `!` overrides matter: outline’s `aria-expanded:text-foreground` (near-white)
 * + `dark:bg-input/30` (near-transparent) made the gate label vanish on open.
 */
const paperOutlineTone =
  "cursor-pointer border-[#1c1c1c]/20 !bg-transparent !text-[#1c1c1c] hover:!border-[#1c1c1c]/45 hover:!bg-[#1c1c1c]/15 hover:!text-[#1c1c1c] aria-expanded:!border-[#1c1c1c]/20 aria-expanded:!bg-transparent aria-expanded:!text-[#1c1c1c] dark:!border-[#1c1c1c]/20 dark:!bg-transparent dark:!text-[#1c1c1c] dark:hover:!bg-[#1c1c1c]/15 dark:aria-expanded:!bg-transparent dark:aria-expanded:!text-[#1c1c1c]";

const paperSolidTone =
  "cursor-pointer !bg-[#1c1c1c] !text-[#f4f4f2] hover:!bg-[#1c1c1c] hover:!opacity-90 aria-expanded:!bg-[#1c1c1c] aria-expanded:!text-[#f4f4f2]";

export function SignOutConfirmButton({
  className,
  appearance = "icon",
}: Props) {
  const isText = appearance === "text";

  return (
    <AlertDialog>
      <AlertDialogTrigger
        aria-label="Sign out of Spotify"
        className={className}
        render={
          isText ? (
            <Button
              variant="outline"
              size="lg"
              className={paperOutlineTone}
            />
          ) : (
            <Button
              variant="default"
              size="icon"
              className={cn("rounded-full", paperSolidTone)}
            />
          )
        }
      >
        {isText ? "Sign out" : <Icon icon={closeOutline} className="size-4" />}
      </AlertDialogTrigger>
      <AlertDialogContent
        size="default"
        overlayClassName="bg-black/45 supports-backdrop-filter:backdrop-blur-[2px]"
        className="max-w-sm gap-5 rounded-2xl bg-[#f4f4f2] p-5 text-[#1c1c1c] ring-[#1c1c1c]/12"
      >
        <AlertDialogHeader className="place-items-start gap-2 p-0 text-left">
          <AlertDialogTitle className="font-sans text-lg font-semibold tracking-tight text-[#1c1c1c]">
            Sign out of Spotify?
          </AlertDialogTitle>
          <AlertDialogDescription className="text-sm leading-relaxed text-[#1c1c1c]/60">
            This disconnects Spotify and resets Scrapped. You&rsquo;ll need to
            connect again to restart the experience.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="mx-0 mb-0 flex-row items-center justify-end gap-2 rounded-none border-0 bg-transparent p-0">
          <AlertDialogCancel variant="outline" size="default" className={paperOutlineTone}>
            Cancel
          </AlertDialogCancel>
          <form
            action="/api/spotify/logout"
            method="post"
            className="inline-flex items-center"
          >
            <AlertDialogAction
              type="submit"
              size="default"
              className={paperSolidTone}
            >
              Sign out
            </AlertDialogAction>
          </form>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
