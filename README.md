# Event Calendar React Component (Fork)

<p align="center">
  <strong>⚠️ This is a fork of the original Event Calendar React Component. ⚠️</strong>
</p>

This fork aims to modularize, enhance, and extend the capabilities of the excellent [Event Calendar React Component](https://github.com/origin-space/event-calendar). The goal is to improve its maintainability, testability, and flexibility, potentially for publishing as an independent package or contributing enhancements back to the original project.

The original component provides multiple view modes, drag-and-drop event management, and a clean, responsive interface. This fork will build upon that foundation.

## Fork Development Roadmap & Ongoing Tasks

We are actively working on the following enhancements and refactorings. Contributions in these areas are highly welcome!

*   **🧩 Decouple UI Components:**
    *   **Goal:** Isolate internal UI elements like form modals, toast notifications, and general notification systems from the core calendar logic.
    *   **Tasks:**
        *   Refactor event creation/editing modals into a separate, reusable `EventForm` component.
        *   Integrate or develop a system for toast notifications (e.g., for successful event updates).
        *   Establish a general notification pattern for errors or other alerts.
*   **🧬 Generic Event Properties:**
    *   **Goal:** Allow the `CalendarEvent` object to accept and manage arbitrary custom properties beyond the predefined ones.
    *   **Tasks:**
        *   Modify the `CalendarEvent` type to support additional generic key-value pairs (e.g., `[key: string]: any;` or a more typed generic approach).
        *   Ensure custom properties are preserved during event operations (add, update, drag-and-drop).
        *   Provide a way for developers to access and potentially render these custom properties.
*   **📦 Create Independent React Module for Publishing:**
    *   **Goal:** Structure the component as a standalone, publishable NPM package.
    *   **Tasks:**
        *   Set up a build process (e.g., using Rollup, esbuild, or tsc).
        *   Define clear entry points and exports.
        *   Manage dependencies appropriately for a library.
        *   Add necessary `package.json` configurations for publishing.
*   **✨ Enhancements & Refinements:**
    *   Address items from the "Limitations and Known Issues" section of the original component (see below).
    *   Improve test coverage.
    *   Enhance documentation specific to the forked version's changes.

---

## Original Component Features (Foundation)

*(The following describes the features inherited from the original component)*

- 📅 Multiple view modes: Month, Week, Day, and Agenda
- 🔄 Drag-and-drop event management
- 🎨 Event color customization
- 📱 Responsive design for all screen sizes
- 🌓 Dark mode support
- 🗓️ All-day events support
- 📍 Location support for events
- 🔄 Easy navigation between time periods

## Original Usage

```jsx
import { EventCalendar, type CalendarEvent } from "@/components/event-calendar"; // Path might change post-refactor

function App() {
  const [events, setEvents] = useState([]);

  const handleEventAdd = (event) => {
    // Logic to add event, potentially involving an API call
    // For the decoupled form, this might be triggered by the form's submission
    setEvents([...events, event]);
  };

  const handleEventUpdate = (updatedEvent) => {
    // Logic to update event
    setEvents(events.map((event) => (event.id === updatedEvent.id ? updatedEvent : event)));
  };

  const handleEventDelete = (eventId) => {
    // Logic to delete event
    setEvents(events.filter((event) => event.id !== eventId));
  };

  return (
    <EventCalendar
      events={events}
      onEventAdd={handleEventAdd} // This might change to onEventClickToAdd or similar, with a separate form handling actual addition
      onEventUpdate={handleEventUpdate}
      onEventDelete={handleEventDelete}
      initialView="month"
    />
  );
}
```

## Original Props

| Prop            | Type                                     | Default   | Description                                                                  |
| --------------- | ---------------------------------------- | --------- | ---------------------------------------------------------------------------- |
| `events`        | `CalendarEvent[]`                        | `[]`      | Array of events to display in the calendar                                   |
| `onEventAdd`    | `(event: CalendarEvent) => void`         | -         | Callback function when an event is added (may be revised with form decoupling) |
| `onEventUpdate` | `(event: CalendarEvent) => void`         | -         | Callback function when an event is updated                                   |
| `onEventDelete` | `(eventId: string) => void`              | -         | Callback function when an event is deleted                                   |
| `className`     | `string`                                 | -         | Additional CSS class for styling                                             |
| `initialView`   | `"month" \| "week" \| "day" \| "agenda"` | `"month"` | Initial view mode of the calendar                                            |

## Original Event Object Structure

```typescript
interface CalendarEvent {
  id: string
  title: string
  description?: string
  start: Date
  end: Date
  allDay?: boolean
  color?: "sky" | "amber" | "violet" | "rose" | "emerald" | "orange"
  location?: string
  // Planned: Support for additional generic properties
  // [key: string]: any; // Example for generic properties
}
```

## Original View Modes

### Month View
Displays a traditional month calendar with events. Events that span multiple days are properly displayed across the days they span.

### Week View
Shows a detailed week view with hour slots. Events are positioned according to their time and can span multiple days.

### Day View
Provides a detailed view of a single day with hour slots. Perfect for seeing all events scheduled for a specific day.

### Agenda View
Lists all events in a chronological list format, making it easy to see upcoming events at a glance.

## Original Limitations and Known Issues (To Be Addressed)

This calendar component is in early alpha stage and is not recommended for production use. There are several limitations and issues that need to be addressed (many of which are targets for improvement in this fork):

### Drag and Drop Limitations
- In month view, only the first day of multi-day events is draggable
- In week and day views, multi-day events are placed in an "All day" section at the top of the view and are not draggable
- Some drag and drop operations may not update the event data correctly in certain edge cases

### Visual and UX Issues
- Limited responsiveness on very small screens
- Event overlapping is not handled optimally in some views
- Limited keyboard navigation support
- Accessibility features are incomplete

### Technical Limitations
- Limited testing across different browsers and devices
- Performance may degrade with a large number of events
- Time zone support is limited
- No recurring event support
- No integration with external calendars (Google, Outlook, etc.)

### Other Considerations
- The component has not undergone extensive testing
- Error handling is minimal
- Documentation is still evolving

We are actively working on improving these aspects and welcome contributions to address these limitations, especially those aligned with the fork's roadmap.

## Contributing to this Fork

Contributions are welcome! Please feel free to submit a Pull Request, particularly for tasks outlined in the **Fork Development Roadmap**.

1.  Fork this repository.
2.  Create your feature branch (`git checkout -b feature/AmazingFeature`).
3.  Commit your changes (`git commit -m 'Add some AmazingFeature'`).
4.  Push to the branch (`git push origin feature/AmazingFeature`).
5.  Open a Pull Request.

Please ensure your code adheres to any existing linting and formatting guidelines.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE.md) file for details.
