import { Inter } from "next/font/google"
import DigitalWall from "@/components/ui/digital-wall"

const inter = Inter({ subsets: ["latin"] })

export default function Home() {
  return (
    <main className={`min-h-screen p-4 md:p-8 ${inter.className}`}>
      <DigitalWall />
    </main>
  )
}
