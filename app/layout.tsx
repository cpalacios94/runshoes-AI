import type { Metadata } from 'next'
import { Inter } from 'next/font/google' // O la fuente que prefieras
import './globals.css'
import { Providers } from './providers'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'AI Running Shoe Check',
  description: 'Analiza el desgaste de tus zapatillas con IA'
}

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="es" className="dark">
      <body className={inter.className}>
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}
