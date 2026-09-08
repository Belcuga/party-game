import type { CSSProperties } from 'react';

type GlowStyle = CSSProperties & {
  '--glow-outer'?: string;
  '--glow-strong'?: string;
  '--glow-soft'?: string;
};

/** Style + a matching Tailwind class pair for a neon icon-circle glow that scales sanely
 *  at any size. A single fixed blur radius (the old approach) looks right on a large
 *  portrait icon but turns into a muddy blob once the same icon shrinks for landscape -
 *  this exposes the color via CSS vars so `GLOW_CLASSES` can give landscape a tighter,
 *  layered halo instead of just scaling the same soft blur down. */
export function glowStyle(color: string, borderColor: string = color): GlowStyle {
  return {
    borderColor,
    '--glow-outer': `${color}55`,
    '--glow-strong': `${color}99`,
    '--glow-soft': `${color}cc`,
  };
}

export const GLOW_CLASSES = 'shadow-[0_0_28px_var(--glow-outer)] max-lg:landscape:shadow-[0_0_10px_var(--glow-strong),0_0_3px_var(--glow-soft)]';
