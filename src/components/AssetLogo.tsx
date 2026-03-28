import { useState } from 'react'

interface AssetLogoProps {
  logo?: string
  icon: string
  name: string
  className?: string
}

export default function AssetLogo({ logo, icon, name, className = '' }: AssetLogoProps) {
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
