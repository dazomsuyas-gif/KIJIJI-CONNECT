import { mkdir, readdir } from 'node:fs/promises'
import path from 'node:path'
import sharp from 'sharp'

const publicDirectory = path.resolve('public')
const outputDirectory = path.join(publicDirectory, 'images')
const approvedSources = new Set(['fresh-produce.jpg', 'tanzania-landscape.jpg'])
const widths = [480, 960, 1600]

await mkdir(outputDirectory, { recursive: true })
const files = (await readdir(publicDirectory)).filter((file) => approvedSources.has(file))

if (files.length === 0) {
  throw new Error('No approved local photo sources were found in public/. Check CREDITS.md and the approved source list.')
}

for (const file of files) {
  const source = path.join(publicDirectory, file)
  const metadata = await sharp(source).metadata()
  if (!metadata.width || !metadata.height) {
    throw new Error(`Could not read image dimensions for ${file}.`)
  }
  const name = path.parse(file).name
  const outputWidths = [...new Set([...widths.filter((width) => width < metadata.width), Math.min(metadata.width, Math.max(...widths))])]

  for (const outputWidth of outputWidths) {
    const output = path.join(outputDirectory, `${name}-${outputWidth}.webp`)
    await sharp(source)
      .resize({ width: outputWidth, fit: 'inside', withoutEnlargement: true })
      .webp({ quality: 82, effort: 5 })
      .toFile(output)
  }
  console.log(`${file}: ${metadata.width}x${metadata.height} -> ${outputWidths.map((width) => `${name}-${width}.webp`).join(', ')}`)
}
