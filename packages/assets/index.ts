const imageModules = import.meta.glob('./images/*.{png,jpg,jpeg,svg,gif}', {
  eager: true,
})

export const LibImages: Record<string, string> = {}

for (const path in imageModules) {
  const fileName = path.split('/').pop()?.split('.')[0]

  if (fileName) {
    LibImages[fileName] = (imageModules[path] as any).default
  }
}

export const BANNER_URL = LibImages.banner
export const TIPS_BG_URL = LibImages['tips-bg']
