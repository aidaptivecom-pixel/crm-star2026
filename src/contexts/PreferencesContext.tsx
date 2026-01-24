import { createContext, useContext, useState, useEffect, ReactNode } from 'react'

type FontSize = 'small' | 'normal' | 'large'

interface PreferencesContextType {
  fontSize: FontSize
  setFontSize: (size: FontSize) => void
}

const PreferencesContext = createContext<PreferencesContextType | undefined>(undefined)

export const usePreferences = () => {
  const context = useContext(PreferencesContext)
  if (!context) {
    throw new Error('usePreferences must be used within a PreferencesProvider')
  }
  return context
}

interface PreferencesProviderProps {
  children: ReactNode
}

export const PreferencesProvider = ({ children }: PreferencesProviderProps) => {
  const [fontSize, setFontSizeState] = useState<FontSize>(() => {
    const saved = localStorage.getItem('star-crm-font-size')
    return (saved as FontSize) || 'normal'
  })

  // Apply font size class to document
  useEffect(() => {
    const root = document.documentElement
    
    // Remove all font size classes
    root.classList.remove('text-size-small', 'text-size-normal', 'text-size-large')
    
    // Add current font size class
    root.classList.add(`text-size-${fontSize}`)
    
    // Save to localStorage
    localStorage.setItem('star-crm-font-size', fontSize)
  }, [fontSize])

  const setFontSize = (size: FontSize) => {
    setFontSizeState(size)
  }

  return (
    <PreferencesContext.Provider value={{ fontSize, setFontSize }}>
      {children}
    </PreferencesContext.Provider>
  )
}
