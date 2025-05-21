import type { Locale } from "date-fns"
import { format as formatFn } from "date-fns/format"
import { getDay as _getDay } from "date-fns/getDay"
import { enIN, enUS } from "date-fns/locale"
import { startOfWeek as _startOfWeek } from "date-fns/startOfWeek"

import { DateLocalizer } from "./localizer"

// let dateRangeFormat = (
//   { start, end }: DateRange,
//   locale: string,
//   localizer: DateLocalizerSpec
// ) =>
//   `${localizer.format(start, "P", locale)} – ${localizer.format(end, "P", locale)}`

// let timeRangeFormat = ({ start, end }, locale, localizer) =>
//   `${localizer.format(start, "p", locale)} – ${localizer.format(end, "p", locale)}`

// let timeRangeStartFormat = ({ start }, locale, localizer) =>
//   `${localizer.format(start, "h:mma", locale)} – `

// let timeRangeEndFormat = ({ end }, locale, localizer) =>
//   ` – ${localizer.format(end, "h:mma", locale)}`

// let weekRangeFormat = ({ start, end }, locale, localizer) =>
//   `${localizer.format(start, "MMMM dd", locale)} – ${localizer.format(
//     end,
//     dates.eq(start, end, "month") ? "dd" : "MMMM dd",
//     locale
//   )}`

export let formats = {
  dateFormat: "dd",
  dayFormat: "dd eee",
  weekdayFormat: "ccc",

  // selectRangeFormat: timeRangeFormat,
  // eventTimeRangeFormat: timeRangeFormat,
  // eventTimeRangeStartFormat: timeRangeStartFormat,
  // eventTimeRangeEndFormat: timeRangeEndFormat,

  timeGutterFormat: "p",

  monthHeaderFormat: "MMMM yyyy",
  dayHeaderFormat: "cccc MMM dd",
  // dayRangeHeaderFormat: weekRangeFormat,
  // agendaHeaderFormat: dateRangeFormat,

  agendaDateFormat: "ccc MMM dd",
  agendaTimeFormat: "p",
  // agendaTimeRangeFormat: timeRangeFormat,
}
// TODO: remove initialization of arguments , it should be handled by the caller
const dateFnsLocalizer = function ({
  startOfWeek = _startOfWeek,
  getDay = _getDay,
  format: _format = formatFn,
  locales = { "en-US": enUS, "en-IN": enIN },
}: {
  startOfWeek?: typeof _startOfWeek
  getDay?: typeof _getDay
  format?: typeof formatFn
  locales?: Record<string, Locale>
}) {
  return new DateLocalizer({
    formats,
    firstOfWeek(locale) {
      return getDay(startOfWeek(new Date(), { locale: locales[locale || ""] }))
    },

    format(value, formatString, locale) {
      return _format(new Date(value), formatString, {
        locale: locales[locale],
      })
    },
  })
}

export default dateFnsLocalizer
