export type ResponsivePhoto = {
  src: string
  srcSet?: string
  sizes?: string
  width?: number
  height?: number
}

const localPhotos: Record<string, { name: string; width: number; height: number; variants: number[] }> = {
  '/fresh-produce.jpg': { name: 'fresh-produce', width: 1200, height: 900, variants: [480, 960, 1200] },
  '/tanzania-landscape.jpg': { name: 'tanzania-landscape', width: 1800, height: 1353, variants: [480, 960, 1600] },
}

export function getResponsivePhoto(src: string): ResponsivePhoto {
  const optimizedPath = src.match(/^\/images\/(fresh-produce|tanzania-landscape)-\d+\.webp$/)
  const sourcePath = optimizedPath ? `/${optimizedPath[1]}.jpg` : src
  const photo = localPhotos[sourcePath]
  if (!photo) return { src }

  return {
    src: `/images/${photo.name}-960.webp`,
    srcSet: photo.variants
      .map((width) => `/images/${photo.name}-${width}.webp ${width}w`)
      .join(', '),
    sizes: '(max-width: 700px) 100vw, (max-width: 1200px) 50vw, 600px',
    width: photo.width,
    height: photo.height,
  }
}
