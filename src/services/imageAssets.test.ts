import { describe, expect, it } from 'vitest'
import { getResponsivePhoto } from './imageAssets'

describe('responsive local photos', () => {
  it('uses the available widths for the smaller produce source without upscaling', () => {
    expect(getResponsivePhoto('/fresh-produce.jpg')).toEqual({
      src: '/images/fresh-produce-960.webp',
      srcSet: '/images/fresh-produce-480.webp 480w, /images/fresh-produce-960.webp 960w, /images/fresh-produce-1200.webp 1200w',
      sizes: '(max-width: 700px) 100vw, (max-width: 1200px) 50vw, 600px',
      width: 1200,
      height: 900,
    })
  })

  it('maps optimized landscape variants back to their responsive source set', () => {
    expect(getResponsivePhoto('/images/tanzania-landscape-1600.webp')).toMatchObject({
      src: '/images/tanzania-landscape-960.webp',
      srcSet: '/images/tanzania-landscape-480.webp 480w, /images/tanzania-landscape-960.webp 960w, /images/tanzania-landscape-1600.webp 1600w',
      width: 1800,
      height: 1353,
    })
  })

  it('leaves user uploads and illustrations unchanged', () => {
    expect(getResponsivePhoto('data:image/png;base64,abc')).toEqual({ src: 'data:image/png;base64,abc' })
    expect(getResponsivePhoto('/kijiji-product-art.svg')).toEqual({ src: '/kijiji-product-art.svg' })
  })
})
