import { ImageResponse } from 'next/og'

export const size = {
  width: 180,
  height: 180,
}

export const contentType = 'image/png'

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: '#0b0d12',
          borderRadius: 36,
        }}
      >
        <span
          style={{
            fontSize: 72,
            fontWeight: 700,
            color: '#8b5cf6',
            fontFamily: 'ui-monospace, monospace',
            letterSpacing: '-0.04em',
          }}
        >
          N
        </span>
      </div>
    ),
    { ...size },
  )
}
