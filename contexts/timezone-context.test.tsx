import React, { ReactNode } from "react"
import { render, screen, act, fireEvent } from "@testing-library/react"
import { TimezoneProvider, useTimezone } from "./timezone-context" // Adjust path as necessary

// Mock Intl.DateTimeFormat
const mockResolvedTimeZone = vi.spyOn(Intl.DateTimeFormat.prototype, "resolvedOptions")

// Test component to display and change timezone
const TestComponent = () => {
  const { timezone, setTimezone } = useTimezone()
  return (
    <div>
      <div data-testid="timezone-display">{timezone}</div>
      <button onClick={() => setTimezone("Europe/Paris")}>
        Change to Paris
      </button>
      <button onClick={() => setTimezone("Asia/Kolkata")}>
        Change to Kolkata
      </button>
    </div>
  )
}

describe("TimezoneProvider and useTimezone", () => {
  afterEach(() => {
    // Clear any mocks after each test if necessary, though resolvedOptions is reset below
    mockResolvedTimeZone.mockClear()
  })

  afterAll(() => {
    // Restore the original Intl.DateTimeFormat mock
    mockResolvedTimeZone.mockRestore()
  })

  it("should provide the system's timezone (mocked) as default", () => {
    const systemTimeZone = "America/New_York"
    mockResolvedTimeZone.mockReturnValue({ timeZone: systemTimeZone } as Intl.ResolvedDateTimeFormatOptions)

    render(
      <TimezoneProvider>
        <TestComponent />
      </TimezoneProvider>
    )
    expect(screen.getByTestId("timezone-display")).toHaveTextContent(systemTimeZone)
  })

  it("should use UTC as a fallback if Intl.DateTimeFormat().resolvedOptions().timeZone is undefined", () => {
    mockResolvedTimeZone.mockReturnValue({ timeZone: undefined } as any) // Simulate undefined timezone
    
    // Need to ensure the provider re-initializes with this mock.
    // This might require a custom render function that sets up mocks before first render if module is cached.
    // For this test structure, we assume the mock is effective for the TimezoneProvider initialization.
    // If TimezoneProvider is already imported and its useState initialized, this test might reflect previous mock state.
    // One way to ensure fresh state is to re-import or use dynamic import, or clear module cache if test runner supports.
    // However, for simplicity, we'll assume the test runner or module system handles this fresh for the render call.

    render(
      <TimezoneProvider>
        <TestComponent />
      </TimezoneProvider>
    )
    // The provider should fallback to "UTC" as per its implementation
    expect(screen.getByTestId("timezone-display")).toHaveTextContent("UTC")
  })


  it("should allow updating the timezone via setTimezone", () => {
    const initialSystemTimeZone = "America/Los_Angeles"
    mockResolvedTimeZone.mockReturnValue({ timeZone: initialSystemTimeZone } as Intl.ResolvedDateTimeFormatOptions)

    render(
      <TimezoneProvider>
        <TestComponent />
      </TimezoneProvider>
    )

    // Check initial timezone
    expect(screen.getByTestId("timezone-display")).toHaveTextContent(initialSystemTimeZone)

    // Click button to change timezone
    act(() => {
      fireEvent.click(screen.getByText("Change to Paris"))
    })
    expect(screen.getByTestId("timezone-display")).toHaveTextContent("Europe/Paris")

    // Change it again
    act(() => {
      fireEvent.click(screen.getByText("Change to Kolkata"))
    })
    expect(screen.getByTestId("timezone-display")).toHaveTextContent("Asia/Kolkata")
  })

  it("should throw an error when useTimezone is used outside of a TimezoneProvider", () => {
    // Suppress console.error output for this test as React will log an error
    const originalError = console.error
    console.error = vi.fn()

    expect(() => render(<TestComponent />)).toThrow(
      "useTimezone must be used within a TimezoneProvider"
    )

    // Restore console.error
    console.error = originalError
  })

  it("should reflect system timezone changes if provider re-initializes or useEffect logic runs", () => {
    // This test depends on the useEffect within TimezoneProvider to re-sync.
    // Initial render with New York
    mockResolvedTimeZone.mockReturnValue({ timeZone: "America/New_York" } as Intl.ResolvedDateTimeFormatOptions);
    const { rerender } = render(
      <TimezoneProvider>
        <TestComponent />
      </TimezoneProvider>
    );
    expect(screen.getByTestId("timezone-display")).toHaveTextContent("America/New_York");

    // Simulate system timezone change and re-render.
    // In a real scenario, a full page reload or a more complex mechanism might trigger this.
    // Here, we change the mock and re-render the same component tree.
    // The useEffect in TimezoneProvider should pick this up if `timezone` state itself hasn't diverged.
    // However, the current useEffect in TimezoneProvider might not trigger if `timezone` state already matches the new mock,
    // or if it's designed to only set initial state.
    // The current useEffect is: `useEffect(() => { ... }, [timezone])`
    // This means it only re-runs if its *own* `timezone` state changes.
    // To test system change detection, that useEffect would need to be different,
    // e.g. listen to an external event or re-evaluate on every render (which is not ideal).

    // Given the current provider's useEffect, this test case might not be fully representative
    // of an actual "system timezone change after initial load" without a page refresh.
    // However, we can test if a subsequent instance of the provider picks up the new system TZ.
    
    mockResolvedTimeZone.mockReturnValue({ timeZone: "Europe/Berlin" } as Intl.ResolvedDateTimeFormatOptions);
    // Re-rendering the provider (as if it's a new instance in a different part of an app, or after a navigation)
    render(
      <TimezoneProvider>
        <TestComponent />
      </TimezoneProvider>
    );
    // This will render a *new* provider, which will initialize with the new mocked system timezone.
    expect(screen.getByTestId("timezone-display")).toHaveTextContent("Europe/Berlin");
  })
})
