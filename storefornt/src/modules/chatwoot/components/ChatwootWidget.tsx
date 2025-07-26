"use client"
import { useEffect } from "react"

/* ------------------------------------------------------------------ */
/* 1.  Window interface augmentation                                  */
/* ------------------------------------------------------------------ */
export {} // makes this file a module so `declare global` works

declare global {
  interface Window {
    chatwootSettings?: {
      hideMessageBubble?: boolean
      position?: "left" | "right"
      locale?: string
      type?: "standard" | "expanded_bubble"
    }
    chatwootSDK?: {
      run: (opts: { websiteToken: string; baseUrl: string }) => void
    }
  }
}

/* ------------------------------------------------------------------ */
/* 2.  Chatwoot widget component                                      */
/* ------------------------------------------------------------------ */
export default function ChatwootWidget() {
  useEffect(() => {
    // 2-A. Settings Chatwoot reads before the script loads
    window.chatwootSettings = {
      hideMessageBubble: false,
      position: "right",
      locale: "en",
      type: "standard",
    }

    // 2-B. Dynamically inject the SDK script
    ;(function (d, t) {
      const BASE_URL = process.env.NEXT_PUBLIC_CHATWOOT_BASE_URL || "https://chat.minimica.com"

      // Cast so TypeScript knows we’re dealing with <script> element
      const g = d.createElement(t) as HTMLScriptElement
      const s = d.getElementsByTagName(t)[0]

      g.src = `${BASE_URL}/packs/js/sdk.js`
      g.async = true
      g.defer = true

      // Safe guard: ensure s & parentNode exist
      if (s && s.parentNode) {
        s.parentNode.insertBefore(g, s)
      }

      g.onload = () => {
        window.chatwootSDK?.run({
          websiteToken: process.env.NEXT_PUBLIC_CHATWOOT_WEBSITE_TOKEN || "SLCQSguxdzsnr6jeHfkho7Ew",
          baseUrl: BASE_URL,
        })
      }
    })(document, "script")
  }, [])

  return null // Nothing rendered to the DOM
}
