import { useState, useEffect } from 'react'

type Breakpoint = 'sm' | 'md' | 'lg' | 'xl' | '2xl'

interface ResponsiveSize {
  isSmall: boolean
  isMedium: boolean
  isLarge: boolean
  isXLarge: boolean
  is2XLarge: boolean
  breakpoint: Breakpoint | null
}

export function useResponsive(): ResponsiveSize {
  const [size, setSize] = useState<ResponsiveSize>({
    isSmall: false,
    isMedium: false,
    isLarge: false,
    isXLarge: false,
    is2XLarge: false,
    breakpoint: null,
  })

  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth
      setSize({
        isSmall: width >= 640,
        isMedium: width >= 768,
        isLarge: width >= 1024,
        isXLarge: width >= 1280,
        is2XLarge: width >= 1536,
        breakpoint:
          width >= 1536 ? '2xl' :
          width >= 1280 ? 'xl' :
          width >= 1024 ? 'lg' :
          width >= 768 ? 'md' :
          width >= 640 ? 'sm' :
          null,
      })
    }

    handleResize()
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  return size
}
