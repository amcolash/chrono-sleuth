/// <reference types="vite/client" />

declare const __BUILD_TIME__: string;

// generate-maze types
declare module 'generate-maze' {
  type Cell = {
    /** Horizontal position, integer */
    x: number;
    /** Vertical position, integer */
    y: number;
    /** Top/Up has a wall/blocked if true, boolean */
    top: boolean;
    /** Left has a wall/blocked if true, boolean */
    bottom: boolean;
    /** Bottom/Down has a wall/blocked if true, boolean */
    left: boolean;
    /** Right has a wall/blocked if true, boolean */
    right: boolean;
    /** Set # used to generate maze, can be ignored */
    set: number;
  };

  export default function generate(width?: number, height?: number, closed?: boolean, seed?: number): Cell[][];
}
