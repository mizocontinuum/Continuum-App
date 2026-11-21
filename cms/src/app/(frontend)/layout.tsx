import React from 'react'

import './styles.css'

export const metadata = {
  title: 'Continuum Control',
  description: 'Admin control panel for Continuum Academy.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
