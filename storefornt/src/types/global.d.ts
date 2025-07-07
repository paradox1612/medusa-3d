import React from 'react'

declare global {
  namespace JSX {
    interface IntrinsicElements {
      'model-viewer': {
        src?: string
        alt?: string
        'auto-rotate'?: boolean
        'camera-controls'?: boolean
        'interaction-policy'?: string
        loading?: string
        reveal?: string
        style?: React.CSSProperties
        onLoad?: () => void
        onError?: () => void
        className?: string
        id?: string
      } & React.HTMLAttributes<HTMLElement>
    }
  }
}

export {} 