"use client"

import React, {
  createContext,
  useState,
  useContext,
  ReactNode,
  useEffect,
} from "react"

interface TimezoneContextType {
  timezone: string
  setTimezone: (newTimezone: string) => void
}

const TimezoneContext = createContext<TimezoneContextType | undefined>(
  undefined
)

interface TimezoneProviderProps {
  children: ReactNode
}

export function TimezoneProvider({ children }: TimezoneProviderProps) {
  const [timezone, setTimezoneState] = useState<string>(() => {
    // Initialize with system's timezone if available, otherwise default
    if (typeof Intl !== "undefined") {
      return Intl.DateTimeFormat().resolvedOptions().timeZone
    }
    return "UTC" // Fallback timezone
  })

  // Effect to update timezone if Intl becomes available later or system timezone changes
  // This might be overkill for many apps but ensures robustness
  useEffect(() => {
    if (typeof Intl !== "undefined") {
      const systemTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone
      if (systemTimezone !== timezone) {
        setTimezoneState(systemTimezone)
      }
    }
  }, [timezone]) // Rerun if our state changes, to re-check against system

  const setTimezone = (newTimezone: string) => {
    setTimezoneState(newTimezone)
  }

  return (
    <TimezoneContext.Provider value={{ timezone, setTimezone }}>
      {children}
    </TimezoneContext.Provider>
  )
}

export function useTimezone(): TimezoneContextType {
  const context = useContext(TimezoneContext)
  if (context === undefined) {
    throw new Error("useTimezone must be used within a TimezoneProvider")
  }
  return context
}
