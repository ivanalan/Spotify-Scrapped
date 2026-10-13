import type { CSSProperties, HTMLAttributes } from "react";

declare global {
  namespace React {
    namespace JSX {
      interface IntrinsicElements {
        "ion-icon": HTMLAttributes<HTMLElement> & {
          icon?: string;
          name?: string;
          src?: string;
          size?: string;
          lazy?: boolean;
          className?: string;
          style?: CSSProperties;
        };
      };
    }
  }
}

export {};
