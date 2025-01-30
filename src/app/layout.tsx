import '@/app/globals.css'
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import { headers } from "next/headers"
import { Toaster } from "@/components/ui/toaster"
import { ConsentBanner } from '@/components/gdpr/consent-banner'
import { getServerAuthSession } from '@/server/auth'
import { Providers } from './providers' // Import Providers instead of TRPCProvider

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'RBAC Starter - Role-Based Access Control System',
  description: 'A scalable and type-safe RBAC system built with modern web technologies',
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await getServerAuthSession();
  const headersList = await headers();
  const cookieHeader = headersList.get("cookie") ?? "";

  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className} suppressHydrationWarning>
        <Providers session={session} cookieHeader={cookieHeader}>
          {children}
          <ConsentBanner />
          <Toaster />
        </Providers>
      </body>
    </html>
  )
}