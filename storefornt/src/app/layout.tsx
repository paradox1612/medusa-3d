import { getBaseURL } from "@lib/util/env"
import { Metadata } from "next"
import "styles/globals.css"
import ChatwootWidget from "@modules/chatwoot/components/ChatwootWidget"

export const metadata: Metadata = {
  metadataBase: new URL(getBaseURL()),
}

export default function RootLayout(props: { children: React.ReactNode }) {
  return (
    <html lang="en" data-mode="light">
      <body>
        {/* Chatwoot widget script */}
         <ChatwootWidget />  
        <main className="relative">{props.children}</main>
        
      </body>
    </html>
  )
}
