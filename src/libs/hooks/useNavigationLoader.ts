'use client'

import { useRouter } from 'next/navigation'
import { useCallback } from 'react'

// Custom hook untuk navigasi dengan loader
export const useNavigationLoader = () => {
  const router = useRouter()

  const navigateWithLoader = useCallback((url: string, options?: { replace?: boolean }) => {
    // Dispatch custom event untuk trigger loader
    window.dispatchEvent(new CustomEvent('navigation-start', { detail: { url } }))
    
    if (options?.replace) {
      router.replace(url)
    } else {
      router.push(url)
    }
  }, [router])

  return { navigateWithLoader }
}

// Event types untuk TypeScript
declare global {
  interface WindowEventMap {
    'navigation-start': CustomEvent<{ url: string }>
  }
}
