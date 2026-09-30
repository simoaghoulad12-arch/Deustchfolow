import Image from 'next/image';
import { MASTER_MARK, WORLDS, type LogoAsset, type WorldId } from '@/lib/brand';
import { cn } from '@/lib/cn';

interface MarkProps {
  /** Which world's official mark. Omit for the master NATYSIMO mark. */
  world?: WorldId;
  variant?: 'mark' | 'lockup';
  className?: string;
  priority?: boolean;
  sizes?: string;
  alt?: string;
}

/**
 * Renders an official NATYSIMO logo file exactly as supplied.
 *
 * The files are crops of the official logo sheet with only the black ground
 * knocked out to transparency (alpha = luminance above the ground level,
 * colour un-premultiplied). Composited on black they reproduce the source
 * pixels exactly; the marks are designed for — and should stay on — dark
 * surfaces.
 */
export function Mark({ world, variant = 'mark', className, priority, sizes = '160px', alt }: MarkProps) {
  const asset: LogoAsset = world ? WORLDS[world][variant] : MASTER_MARK;
  const label = alt ?? (world ? `NATYSIMO ${WORLDS[world].name}` : 'NATYSIMO');
  return (
    <Image
      src={asset.src}
      width={asset.width}
      height={asset.height}
      alt={label}
      priority={priority}
      sizes={sizes}
      className={cn('h-auto w-full select-none', className)}
      draggable={false}
    />
  );
}
