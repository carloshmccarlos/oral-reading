import { ImageResponse } from 'next/og'

export const runtime = 'edge'

export const alt = 'OR — Oral Reading'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

export default function OpenGraphImage () {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          background: '#F7F7F5',
          padding: 64
        }}
      >
        <div
          style={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            border: '8px solid #111111',
            background: '#FFFFFF',
            padding: 64
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'baseline',
              gap: 24
            }}
          >
            <div
              style={{
                fontSize: 120,
                fontWeight: 800,
                letterSpacing: '-0.08em',
                color: '#111111'
              }}
            >
              OR
            </div>
            <div
              style={{
                fontSize: 48,
                fontWeight: 600,
                color: '#2C2C2C'
              }}
            >
              Oral Reading
            </div>
          </div>

          <div
            style={{
              marginTop: 28,
              fontSize: 36,
              color: '#666666',
              lineHeight: 1.3
            }}
          >
            Steal the context. Practice spoken English with realistic short stories.
          </div>

          <div
            style={{
              marginTop: 40,
              display: 'flex',
              gap: 12,
              flexWrap: 'wrap'
            }}
          >
            {['Daily scenarios', 'Phrases in context', 'Optional audio'].map((label) => (
              <div
                key={label}
                style={{
                  padding: '10px 16px',
                  borderRadius: 999,
                  background: '#D6E865',
                  color: '#111111',
                  fontSize: 24,
                  fontWeight: 600
                }}
              >
                {label}
              </div>
            ))}
          </div>
        </div>
      </div>
    ),
    size
  )
}
