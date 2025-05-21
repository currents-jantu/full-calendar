import React, { ReactNode } from "react"
import { render, screen, fireEvent, act, waitFor } from "@testing-library/react"
import { EventCalendar } from "./event-calendar" // Adjust path as necessary
import { TimezoneProvider, useTimezone } from "../../contexts/timezone-context" // Adjust path
import { listTimeZones } from "date-fns-tz/listTimeZones"

// Mock date-fns-tz/listTimeZones
vi.mock("date-fns-tz/listTimeZones", () => ({
  listTimeZones: vi.fn(),
}))

// Mock Intl.DateTimeFormat
const mockResolvedTimeZone = vi.spyOn(Intl.DateTimeFormat.prototype, "resolvedOptions")

// Mock ResizeObserver, common issue in tests with components that use it
global.ResizeObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}))

// Custom render function to wrap components with TimezoneProvider
interface CustomRenderOptions {
  initialTimezone?: string
  ui: React.ReactElement
}

const renderWithTimezoneProvider = ({initialTimezone: providerInitialTimezone, ui}: CustomRenderOptions) => {
  // If an initialTimezone is provided for the test, set the mock accordingly
  // so the provider initializes with that value.
  if (providerInitialTimezone) {
    mockResolvedTimeZone.mockReturnValue({ timeZone: providerInitialTimezone } as Intl.ResolvedDateTimeFormatOptions)
  }

  return render(
    <TimezoneProvider>
      {ui}
    </TimezoneProvider>
  )
}


describe("EventCalendar Timezone Dropdown with Context", () => {
  const mockTimezones = ["UTC", "America/New_York", "Europe/London", "Asia/Tokyo"]
  const defaultTestTimezone = "Asia/Jerusalem" // A distinct default for tests

  beforeEach(() => {
    // Reset mocks for each test
    (listTimeZones as vi.Mock).mockReturnValue(mockTimezones)
    // Default mock for Intl, can be overridden by renderWithTimezoneProvider
    mockResolvedTimeZone.mockReturnValue({ timeZone: defaultTestTimezone } as Intl.ResolvedDateTimeFormatOptions)
  })

  afterAll(() => {
    mockResolvedTimeZone.mockRestore()
    vi.restoreAllMocks() // Restores all vi mocks
  })

  it("should display the initial timezone from TimezoneProvider in the dropdown trigger", () => {
    renderWithTimezoneProvider({initialTimezone: "Europe/Madrid", ui: <EventCalendar events={[]} />})
    expect(screen.getByRole("button", { name: /timezone/i })).toHaveTextContent("Europe/Madrid")
  })

  it("should open a dropdown with timezone options when clicked", async () => {
    renderWithTimezoneProvider({ui: <EventCalendar events={[]} />})
    const timezoneButton = screen.getByRole("button", { name: /timezone/i })
    fireEvent.click(timezoneButton)

    for (const tz of mockTimezones) {
      expect(await screen.findByText(tz)).toBeInTheDocument()
    }
  })

  it("should update displayed timezone when a new timezone is selected from the dropdown", async () => {
    renderWithTimezoneProvider({initialTimezone: "America/Chicago", ui: <EventCalendar events={[]} />})
    const timezoneButton = screen.getByRole("button", { name: /timezone/i })
    
    // Check initial display
    expect(timezoneButton).toHaveTextContent("America/Chicago")

    // Click to open the dropdown
    fireEvent.click(timezoneButton)

    const newTimezoneToSelect = "America/New_York"
    const timezoneOption = await screen.findByText(newTimezoneToSelect)
    fireEvent.click(timezoneOption)
    
    // Verify the button text updates.
    // The context update should trigger a re-render of EventCalendar,
    // which then gets the new timezone from useTimezone().
    await waitFor(() => {
      expect(timezoneButton).toHaveTextContent(newTimezoneToSelect)
    })
  })

   it("should display timezones correctly from the mocked listTimeZones", async () => {
    renderWithTimezoneProvider({ui: <EventCalendar events={[]} />})
    fireEvent.click(screen.getByRole("button", { name: /timezone/i }))
    for (const tz of mockTimezones) {
      expect(await screen.findByText(tz)).toBeInTheDocument()
    }
  })

  // Test component to verify context value changes (optional, as above test implies it)
  const TimezoneDisplay = () => {
    const { timezone } = useTimezone();
    return <div data-testid="context-value">{timezone}</div>;
  };

  it("context value should update when timezone is selected in EventCalendar", async () => {
    render(
      <TimezoneProvider>
        <EventCalendar events={[]} />
        <TimezoneDisplay />
      </TimezoneProvider>
    );

    const timezoneButton = screen.getByRole("button", { name: /Timezone/i });
    fireEvent.click(timezoneButton);

    const newTimezoneToSelect = "Europe/London";
    const timezoneOption = await screen.findByText(newTimezoneToSelect);
    fireEvent.click(timezoneOption);

    await waitFor(() => {
      expect(screen.getByTestId("context-value")).toHaveTextContent(newTimezoneToSelect);
    });
  });
})
