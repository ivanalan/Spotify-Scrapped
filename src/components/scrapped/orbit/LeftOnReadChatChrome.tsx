"use client";

type Props = {
  /**
   * Entity: compact TL typing pin (mid clear for artwork).
   * Quiet / frame: edge chat bubbles for list beats (D-015).
   */
  mode?: "pin" | "hero" | "quiet" | "frame";
  freeze?: boolean;
  replayKey?: number;
};

/**
 * Left-on-read chrome: typing pin on the entity beat, edge bubbles on the list.
 * Bubbles reuse the ocean bloom fill (D-049); pin is the one→many accent.
 * Field / bloom / frame opacity: D-049. Pin/frame geometry: D-019.
 */
export function LeftOnReadChatChrome({
  mode = "pin",
  freeze = false,
  replayKey = 0,
}: Props) {
  const animate = freeze ? "0" : "1";
  /** Legacy `hero` maps to the promoted typing pin. */
  const visualMode = mode === "hero" ? "pin" : mode;

  // Key on replay only: quiet→frame must not remount or bubble enter plays twice.
  return (
    <div
      key={`chat-${replayKey}`}
      className="scrapped-middeck mm-chat"
      data-mode={visualMode}
      data-animate={animate}
      aria-hidden
    >
      <div className="mm-chat-field" />
      {visualMode === "pin" ? (
        <div className="mm-chat-typing">
          <span className="mm-chat-typing-dot" />
          <span className="mm-chat-typing-dot" />
          <span className="mm-chat-typing-dot" />
        </div>
      ) : (
        <>
          <div className="mm-chat-col">
            <div className="mm-chat-bubble" />
            <div className="mm-chat-bubble" />
            <div className="mm-chat-bubble" />
            <div className="mm-chat-bubble" />
          </div>
          <div className="mm-chat-mirror">
            <div className="mm-chat-bubble" />
            <div className="mm-chat-bubble" />
          </div>
        </>
      )}
    </div>
  );
}
