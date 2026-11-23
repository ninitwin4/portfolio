import Image from 'next/image'
import type { MoodBoard as MoodBoardData, MoodBoardSlot } from '@/app/data'

// Rough rendered widths per slot, for next/image `sizes`.
const SIZES: Record<MoodBoardSlot, string> = {
  hero: '(min-width: 640px) 480px, 100vw',
  side: '(min-width: 640px) 240px, 50vw',
  a: '(min-width: 640px) 240px, 50vw',
  b: '(min-width: 640px) 240px, 50vw',
  c: '(min-width: 640px) 240px, 50vw',
  d: '(min-width: 640px) 360px, 100vw',
  e: '(min-width: 640px) 360px, 100vw',
  f: '(min-width: 640px) 240px, 100vw',
  g: '(min-width: 640px) 480px, 100vw',
  logo: '(min-width: 640px) 240px, 100vw',
}

const label = 'font-mono text-[11px] uppercase tracking-widest'

/**
 * Editorial mood board on black: image tiles in named slots (positions in
 * globals.css under .mood-board), a palette strip, an info block, and an
 * optional stat bubble on the hero tile.
 */
export function MoodBoard({ board }: { board: MoodBoardData }) {
  return (
    <figure className="space-y-3">
      <div className="mood-board border-border rounded-2xl border bg-black p-3 sm:p-4">
        <div className="mb-3 flex justify-end">
          <span aria-hidden="true" className="mood-board-dots" />
        </div>

        <div className="mood-board-grid">
          {board.tiles.map((tile) => (
            <div
              key={tile.slot}
              data-slot={tile.slot}
              className={tile.slot === 'logo' ? 'bg-white' : 'bg-neutral-900'}
            >
              <Image
                src={tile.src}
                alt={tile.alt}
                fill
                sizes={SIZES[tile.slot]}
                className={
                  tile.slot === 'logo'
                    ? 'object-contain p-[8%]'
                    : 'object-cover'
                }
                style={{ objectPosition: tile.position ?? 'center' }}
              />
              {tile.slot === 'hero' && board.stat && (
                <div className="mood-board-stat">
                  <span className="text-[1.05em] leading-none font-semibold">
                    {board.stat.value}
                  </span>
                  <span className="mt-[0.35em] text-[0.42em] leading-tight">
                    {board.stat.label}
                  </span>
                  {board.stat.note && (
                    <span className="mt-[0.2em] text-[0.34em] leading-tight opacity-80">
                      {board.stat.note}
                    </span>
                  )}
                </div>
              )}
            </div>
          ))}

          <div
            data-slot="palette"
            className="flex flex-col justify-between gap-3"
          >
            <span className={`${label} text-white/60`}>Palette</span>
            <ul className="grid max-w-72 grid-cols-3 gap-2">
              {board.palette.map((swatch) => (
                <li key={swatch.hex} className="space-y-1.5">
                  <span
                    className="block aspect-square w-full rounded-md border border-white/20"
                    style={{ backgroundColor: swatch.hex }}
                  />
                  <span className="block text-xs text-white">
                    {swatch.name}
                  </span>
                  <span className={`${label} block text-white/50`}>
                    {swatch.hex}
                  </span>
                </li>
              ))}
            </ul>
          </div>

          <dl
            data-slot="info"
            className="grid grid-cols-2 content-center gap-x-4 gap-y-3"
          >
            {board.details.map((row) => (
              <div key={row.label} className="space-y-0.5">
                <dt className={`${label} text-[#EB0028]`}>{row.label}</dt>
                <dd className="text-sm leading-snug text-white">{row.value}</dd>
              </div>
            ))}
          </dl>
        </div>
      </div>
      {board.caption && (
        <figcaption className="text-muted text-sm text-pretty">
          {board.caption}
        </figcaption>
      )}
    </figure>
  )
}
