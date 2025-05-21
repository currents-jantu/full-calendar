import React from "react"
import { render, screen, act } from "@testing-library/react"
import { DayView } from "./day-view" // Adjust path as necessary
import { TimezoneProvider, useTimezone } from "../../contexts/timezone-context" // Adjust path
import { CalendarEvent } from "./types" // Adjust path as necessary
import { formatInTimeZone } from "date-fns-tz"

// Mock ResizeObserver
global.ResizeObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}))

// Mock Intl.DateTimeFormat to ensure consistent behavior
const mockResolvedTimeZone = vi.spyOn(Intl.DateTimeFormat.prototype, "resolvedOptions")

// Helper to format time for expectation, mirroring EventItem's logic
const formatExpectedTimeRange = (start: Date, end: Date, timezone: string, allDay?: boolean) => {
  if (allDay) return /all day/i
  const startTime = formatInTimeZone(start, timezone, "h:mma").toLowerCase()
  const endTime = formatInTimeZone(end, timezone, "h:mma").toLowerCase()
  return new RegExp(`${startTime.replace(":00", "")} - ${endTime.replace(":00", "")}`, "i")
}

// Test component to set timezone for DayView tests
const TimezoneSetter = ({ timezone, children }: { timezone: string, children: React.ReactNode }) => {
  const { setTimezone } = useTimezone()
  React.useEffect(() => {
    act(() => { // Ensure state update is wrapped in act
      setTimezone(timezone)
    })
  }, [setTimezone, timezone])
  return <>{children}</>
}


describe("DayView Timezone Conversion and Display with Context", () => {
  const defaultTestTimezone = "UTC" // Default for tests if not overridden by provider/setter

  afterAll(() => {
    mockResolvedTimeZone.mockRestore()
    vi.restoreAllMocks()
  })

  const renderDayViewInProvider = (
    events: CalendarEvent[],
    currentDate: Date,
    testTimezone: string
  ) => {
    // Mock what the TimezoneProvider would get from Intl.DateTimeFormat
    // This ensures the provider initializes with the testTimezone,
    // or DayView can use useTimezone() to get this value.
    mockResolvedTimeZone.mockReturnValue({ timeZone: testTimezone } as Intl.ResolvedDateTimeFormatOptions)

    return render(
      <TimezoneProvider>
        {/* Optionally use TimezoneSetter if direct control over context AFTER initial render is needed
            but for DayView, it should react to the timezone from useTimezone() directly */}
        <DayView events={events} currentDate={currentDate} onEventSelect={() => {}} onEventCreate={() => {}} />
      </TimezoneProvider>
    )
  }

  it("should display event times correctly for America/New_York (EDT, UTC-4)", () => {
    const events: CalendarEvent[] = [
      { id: "1", title: "Event 1 EDT", start: new Date("2023-10-27T14:00:00Z"), end: new Date("2023-10-27T15:00:00Z") },
    ]
    const currentDate = new Date("2023-10-27T00:00:00Z")
    const timezone = "America/New_York"
    
    renderDayViewInProvider(events, currentDate, timezone)

    const expectedTime = formatExpectedTimeRange(events[0].start, events[0].end, timezone)
    expect(screen.getByText("Event 1 EDT")).toBeInTheDocument()
    expect(screen.getByText(expectedTime)).toBeInTheDocument()
  })

  it("should display event times correctly for Europe/London (BST, UTC+1 in summer)", () => {
    const events: CalendarEvent[] = [
      { id: "1", title: "Event 1 BST", start: new Date("2023-07-15T10:00:00Z"), end: new Date("2023-07-15T11:30:00Z") },
    ]
    const currentDate = new Date("2023-07-15T00:00:00Z")
    const timezone = "Europe/London"

    renderDayViewInProvider(events, currentDate, timezone)

    const expectedTime = formatExpectedTimeRange(events[0].start, events[0].end, timezone)
    expect(screen.getByText("Event 1 BST")).toBeInTheDocument()
    expect(screen.getByText(expectedTime)).toBeInTheDocument()
  })

  it("should display event times correctly for Asia/Tokyo (JST, UTC+9)", () => {
    const events: CalendarEvent[] = [
      { id: "1", title: "Event 1 JST", start: new Date("2024-01-01T00:00:00Z"), end: new Date("2024-01-01T02:00:00Z") },
    ]
    const currentDate = new Date("2024-01-01T00:00:00Z")
    const timezone = "Asia/Tokyo"

    renderDayViewInProvider(events, currentDate, timezone)
    
    const expectedTime = formatExpectedTimeRange(events[0].start, events[0].end, timezone)
    expect(screen.getByText("Event 1 JST")).toBeInTheDocument()
    expect(screen.getByText(expectedTime)).toBeInTheDocument()
  })

  it("should display all-day events without specific times", () => {
    const events: CalendarEvent[] = [
      { id: "1", title: "All Day Event Context", start: new Date("2023-10-27T00:00:00Z"), end: new Date("2023-10-27T23:59:59Z"), allDay: true },
    ]
    const currentDate = new Date("2023-10-27T00:00:00Z")
    const timezone = "America/New_York"

    renderDayViewInProvider(events, currentDate, timezone)

    expect(screen.getByText("All Day Event Context")).toBeInTheDocument()
    const timeRegExp = /\d{1,2}:\d{2}\s*(am|pm)/i
    // Check within the rendered output for the event, ensuring time is not displayed.
    // This requires careful DOM traversal or specific test-ids on event item contents.
    // For simplicity, we check the absence of time in the whole screen for this specific event title.
    // This might be fragile if other elements have times. A better way is to scope the check.
    const eventItemContainer = screen.getByText("All Day Event Context").closest("button") // Assuming EventItem renders a button
    if (eventItemContainer) {
      expect(timeRegExp.test(eventItemContainer.textContent || "")).toBe(false)
    } else {
      // Fallback if structure is different, less reliable
      expect(screen.queryByText(timeRegExp)).toBeNull()
    }
    // If EventItem explicitly renders "All day" text for such events (which it seems to):
    // We want to find the "All day" text associated with "All Day Event Context"
    // The formatExpectedTimeRange will return /all day/i
     const allDayTextMatcher = formatExpectedTimeRange(events[0].start, events[0].end, timezone, true);
     // We expect "All day" to be present for this event.
     // The precise query depends on how EventItem renders this.
     // If "All day" is part of the same text block as title for allDay events in DayView:
     // This is complex because EventItem for DayView might not explicitly show "All day" text,
     // but rather omits the time. The test above for absence of time is more direct.
     // If EventItem is structured to show "All day" string:
     // expect(screen.getByText(allDayTextMatcher)).toBeInTheDocument();
     // For now, absence of time is the key check.
  })
})
