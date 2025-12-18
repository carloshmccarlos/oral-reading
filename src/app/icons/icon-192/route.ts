import { ImageResponse } from 'next/og'
import { createElement } from 'react'

export const runtime = 'edge'

export async function GET () {
  return new ImageResponse(
    createElement(
      'div',
      {
        style: {
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: '#111111',
          color: '#D6E865',
          fontWeight: 900,
          fontSize: 100,
          letterSpacing: '-0.08em',
          borderRadius: 42
        }
      },
      'OR'
    ),
    {
      width: 192,
      height: 192
    }
  )
}
