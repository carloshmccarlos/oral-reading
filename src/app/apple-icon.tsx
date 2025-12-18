import { ImageResponse } from 'next/og'

export const runtime = 'edge'

export const size = { width: 180, height: 180 }
export const contentType = 'image/png'

export default function AppleIcon () {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: '#111111',
          color: '#D6E865',
          fontWeight: 800,
          fontSize: 92,
          letterSpacing: '-0.08em',
          borderRadius: 36
        }}
      >
        OR
      </div>
    ),
    size
  )
}
