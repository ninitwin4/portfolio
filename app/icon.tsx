import { ImageResponse } from 'next/og'

export const size = {
  width: 32,
  height: 32,
}

export const contentType = 'image/png'

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: '#000000',
          borderRadius: 6,
        }}
      >
        <span
          style={{
            fontSize: 20,
            fontWeight: 700,
            color: '#8b5cf6',
            fontFamily: 'ui-monospace, monospace',
            letterSpacing: '-0.05em',
          }}
        >
          N
        </span>
      </div>
    ),
    { ...size },
  )
}
