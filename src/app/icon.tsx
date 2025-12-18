import { ImageResponse } from 'next/og'

export const runtime = 'edge'

export function generateImageMetadata () {
  return [
    {
      id: '32',
      size: { width: 32, height: 32 },
      contentType: 'image/png'
    },
    {
      id: '64',
      size: { width: 64, height: 64 },
      contentType: 'image/png'
    }
  ]
}

export default async function Icon (props: { id: Promise<string | number> }) {
  const id = await props.id
  const size = Number(id)

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
          fontSize: size >= 64 ? 34 : 18,
          letterSpacing: '-0.08em',
          borderRadius: size >= 64 ? 14 : 8
        }}
      >
        OR
      </div>
    ),
    {
      width: size,
      height: size
    }
  )
}
