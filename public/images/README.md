# Local image assets

Images are served from this folder; the site does not hotlink photos. To create responsive WebP files from the credited local source photos, run `npm run optimize:images`. The script reads only the approved originals named in `scripts/optimize-images.mjs` and writes `*-480.webp`, `*-960.webp`, and `*-1600.webp` variants without upscaling.

## Available representative photos

| Asset | Use | Credit |
|---|---|---|
| `tanzania-landscape-{480,960,1600}.webp` | Homepage hero, generic story examples and a representative landscape | Unsplash source and license in `CREDITS.md`; not a verified photo of a named destination |
| `fresh-produce-{480,960,1200}.webp` | Representative produce listings | Unsplash source and license in `CREDITS.md`; not a verified seller or produce batch |

## Missing photos to add

Supply a licensed, locally stored original photo and verified photographer/source/license before adding each slot to `CREDITS.md` and the optimizer's approved source list. Use these exact original filenames; the script generates the three responsive widths.

| Slot | Original filename | Recommended source size | Suggested search |
|---|---|---:|---|
| Fresh produce category and individual product photography | `produce-market.jpg` | 1600 × 1200 | Tanzania market vegetables |
| Grains and cereals | `grains-market.jpg` | 1600 × 1200 | Tanzania maize rice beans market |
| Building materials | `building-materials.jpg` | 1600 × 1200 | Arusha building materials market |
| Electronics | `electronics-shop.jpg` | 1600 × 1200 | Arusha electronics shop |
| Household goods | `household-goods.jpg` | 1600 × 1200 | Tanzania household goods market |
| Kilombero Market and Arusha Central Market comparison cards | `arusha-markets.jpg` | 1600 × 1000 | Kilombero Market Arusha |
| Arusha / Mount Meru travel | `mount-meru-arusha.jpg` | 1600 × 1000 | Mount Meru Arusha |
| Serengeti travel | `serengeti.jpg` | 1600 × 1000 | Serengeti wildebeest |
| Ngorongoro travel | `ngorongoro.jpg` | 1600 × 1000 | Ngorongoro crater Tanzania |
| Kilimanjaro travel | `kilimanjaro.jpg` | 1600 × 1000 | Mount Kilimanjaro Tanzania |
| Zanzibar travel | `zanzibar.jpg` | 1600 × 1000 | Zanzibar beach Tanzania |
| Community and local stories | `arusha-community.jpg` | 1600 × 1000 | Maasai market Arusha |
| Habit Lab | `habit-learning.jpg` | 1600 × 1000 | Tanzania adult learning community |

Do not use a suggested search result until its exact source, photographer and applicable license have been verified.
