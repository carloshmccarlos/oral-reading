import { ImageResponse } from 'next/og'

export const runtime = 'edge'

export const alt = 'OR — Oral Reading'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

export default function TwitterImage () {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          background: '#111111',
          padding: 64
        }}
      >
        <div
          style={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            borderRadius: 48,
            background: '#111111',
            border: '6px solid #D6E865',
            padding: 64
          }}
        >
          <div
            style={{
              fontSize: 128,
              fontWeight: 900,
              letterSpacing: '-0.08em',
              color: '#D6E865'
            }}
          >
            OR
          </div>
          <div
            style={{
              marginTop: 16,
              fontSize: 52,
              fontWeight: 700,
              color: '#F7F7F5'
            }}
          >
            Oral Reading
          </div>
          <div
            style={{
              marginTop: 28,
              fontSize: 34,
              color: 'rgba(247, 247, 245, 0.78)',
              lineHeight: 1.3
            }}
          >
            Context-based stories for spoken English.
          </div>
        </div>
      </div>
    ),
    size
  )
}
