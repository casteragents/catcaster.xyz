import { Inter } from 'next/font/google'
import ClientLayout from './ClientLayout'
const inter = Inter({ subsets: ['latin'] })
export const metadata = {
  title: 'Catcaster.xyz',
  icons: {
    icon: '/logo.jpg',
  },
}
export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <ClientLayout>{children}</ClientLayout>
      </body>
    </html>
  )
}