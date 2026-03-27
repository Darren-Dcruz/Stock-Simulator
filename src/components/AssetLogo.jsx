import { useState } from 'react'

/**
 * Renders a company/asset logo image, falling back to the emoji icon
 * if the image URL is missing or fails to load.
 *
 * Props:
 *   logo      – URL string (or null/undefined for emoji-only assets)
 *   icon      – emoji fallback string
 *   name      – alt text for the image
 *   className – size + any extra Tailwind classes (e.g. "w-9 h-9 text-base")
 */
export default function AssetLogo({ logo, icon, name, className = '' }) {
  const [err, setErr] = useState(false)

  if (logo && !err) {
    return (
      <img
        src={logo}
        alt={name}
        className={`rounded-full object-contain bg-white p-0.5 flex-shrink-0 ${className}`}
        onError={() => setErr(true)}
      />
    )
  }

  return (
    <span className={`flex items-center justify-center rounded-full bg-muted flex-shrink-0 ${className}`}>
      {icon}
    </span>
  )
}
