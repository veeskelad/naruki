export const SITE_NAME = 'На руки'

export function getSiteUrl(): string {
  const configured =
    typeof process !== 'undefined'
      ? process.env.VITE_PUBLIC_SITE_URL ??
        process.env.VERCEL_PROJECT_PRODUCTION_URL ??
        process.env.VERCEL_URL
      : undefined

  if (!configured) return 'https://naruki.space'
  return configured.startsWith('http') ? configured : `https://${configured}`
}

export function absoluteUrl(path = '/'): string {
  return new URL(path, `${getSiteUrl()}/`).toString()
}

