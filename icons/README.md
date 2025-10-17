Icon guidance for PWA and iOS

Recommended icons (store in `docs/icons/`):

- `icon-192.png` (192x192)
- `icon-512.png` (512x512)
- `icon-152.png`, `icon-167.png`, `icon-180.png` (iOS touch icons)
- `apple-splash-1125x2436.png`, `apple-splash-1242x2688.png`, `apple-splash-828x1792.png` (optional iOS splash images)

Generate locally using ImageMagick:

```bash
convert icon-source.png -resize 192x192 docs/icons/icon-192.png
convert icon-source.png -resize 512x512 docs/icons/icon-512.png
```

If ImageMagick isn't available, use a Node script with Jimp or an online tool to produce the sizes.
