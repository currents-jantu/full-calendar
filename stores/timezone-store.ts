import { create } from "zustand"

interface TimezoneState {
  timezone: string
  setTimezone: (timezone: string) => void
}

const useTimezoneStore = create<TimezoneState>((set) => ({
  timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
  setTimezone: (newTimezone) => set({ timezone: newTimezone }),
}))

export default useTimezoneStore
