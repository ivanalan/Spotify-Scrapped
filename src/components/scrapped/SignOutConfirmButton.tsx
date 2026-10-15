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
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type Props = {
  className?: string;
  /** Gate mock uses a text link; deck chrome keeps the close icon. */
  appearance?: "icon" | "text";
};

export function SignOutConfirmButton({
  className,
  appearance = "icon",
}: Props) {
  return (
    <AlertDialog>
      <AlertDialogTrigger
        className={
          appearance === "text"
            ? cn(
                "font-sans text-sm text-[var(--wrapped-muted)] transition-opacity hover:opacity-70",
                className,
              )
            : cn(
                buttonVariants({ size: "icon", variant: "default" }),
                "size-8 rounded-full bg-[#1c1c1c] text-[#f4f4f2] hover:bg-[#1c1c1c] hover:opacity-90",
                className,
              )
        }
        aria-label="Sign out of Spotify"
      >
        {appearance === "text" ? (
          "Sign out"
        ) : (
          <Icon icon={closeOutline} className="size-4" />
        )}
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
        <AlertDialogFooter className="mx-0 mb-0 flex-row justify-end gap-2 rounded-none border-0 bg-transparent p-0">
          <AlertDialogCancel
            variant="ghost"
            className="rounded-xl !text-[#1c1c1c] hover:!bg-[#1c1c1c]/8 hover:!text-[#1c1c1c]"
          >
            Cancel
          </AlertDialogCancel>
          <form action="/api/spotify/logout" method="post">
            <AlertDialogAction
              type="submit"
              className="rounded-xl bg-[#1c1c1c] text-[#f4f4f2] hover:bg-[#1c1c1c] hover:opacity-90"
            >
              Sign out
            </AlertDialogAction>
          </form>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
