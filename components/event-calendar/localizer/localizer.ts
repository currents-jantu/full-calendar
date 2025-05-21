import invariant from "invariant"

import {
  add,
  ceil,
  diff,
  duration,
  endOf,
  eq,
  firstVisibleDay,
  gt,
  gte,
  inRange,
  isJustDate,
  lastVisibleDay,
  lt,
  lte,
  max,
  merge,
  min,
  minutes,
  neq,
  range,
  startOf,
  visibleDays,
} from "../utils/dates"

export interface Event {
  start: Date
  end: Date
  allDay?: boolean
}

export interface EventSortParams {
  evtA: Event
  evtB: Event
}
export interface DateRange {
  start: Date
  end: Date
}

export interface EventRangeParams {
  event: Event
  range: DateRange
}

export interface DateLocalizerSpec {
  format: (value: Date, format: string, locale: string) => string
  firstOfWeek: (locale: string | undefined) => number
  propType?: any
  formats?: Record<string, any>
  merge?: typeof merge
  inRange?: typeof inRange
  lt?: typeof lt
  lte?: typeof lte
  gt?: typeof gt
  gte?: typeof gte
  eq?: typeof eq
  neq?: typeof neq
  startOf?: typeof startOf
  endOf?: typeof endOf
  add?: typeof add
  range?: typeof range
  diff?: typeof diff
  ceil?: typeof ceil
  min?: typeof min
  max?: typeof max
  minutes?: typeof minutes
  daySpan?: typeof daySpan
  firstVisibleDay?: typeof firstVisibleDay
  lastVisibleDay?: typeof lastVisibleDay
  visibleDays?: typeof visibleDays
  getSlotDate?: typeof getSlotDate
  getTimezoneOffset?: (value: Date) => number
  getDstOffset?: typeof getDstOffset
  getTotalMin?: typeof getTotalMin
  getMinutesFromMidnight?: typeof getMinutesFromMidnight
  continuesPrior?: typeof continuesPrior
  continuesAfter?: typeof continuesAfter
  sortEvents?: typeof sortEvents
  inEventRange?: typeof inEventRange
  isSameDate?: typeof isSameDate
  startAndEndAreDateOnly?: typeof startAndEndAreDateOnly
  browserTZOffset?: () => number
}

// Define the merge defaults interface
interface MergeDefaultsParams {
  formats: Record<string, string>
  messages: Record<string, string>
  startOfWeek: () => number
  format: (value: Date, format: string) => string
}

function _format(
  localizer: DateLocalizer,
  formatter: (value: Date, format: string, locale: string) => string,
  value: Date,
  format:
    | string
    | ((value: Date, locale: string, localizer: DateLocalizer) => string),
  locale: string
): string | null | undefined {
  let result =
    typeof format === "function"
      ? format(value, locale, localizer)
      : formatter.call(localizer, value, format, locale)

  invariant(
    result == null || typeof result === "string",
    "`localizer format(..)` must return a string, null, or undefined"
  )

  return result
}

/**
 * This date conversion was moved out of TimeSlots.js, to
 * allow for localizer override
 * @param {Date} dt - The date to start from
 * @param {Number} minutesFromMidnight
 * @param {Number} offset
 * @returns {Date}
 */
function getSlotDate(
  dt: Date,
  minutesFromMidnight: number,
  offset: number
): Date {
  return new Date(
    dt.getFullYear(),
    dt.getMonth(),
    dt.getDate(),
    0,
    minutesFromMidnight + offset,
    0,
    0
  )
}

function getDstOffset(start: Date, end: Date): number {
  return start.getTimezoneOffset() - end.getTimezoneOffset()
}

// if the start is on a DST-changing day but *after* the moment of DST
// transition we need to add those extra minutes to our minutesFromMidnight
function getTotalMin(start: Date, end: Date): number {
  return diff(start, end, "minutes") + getDstOffset(start, end)
}

function getMinutesFromMidnight(start: Date): number {
  const daystart = startOf(start, "day")
  return diff(daystart, start, "minutes") + getDstOffset(daystart, start)
}

// These two are used by DateSlotMetrics
function continuesPrior(start: Date, first: Date): boolean {
  return lt(start, first, "day")
}

function continuesAfter(start: Date, end: Date, last: Date): boolean {
  const singleDayDuration = eq(start, end, "minutes")
  return singleDayDuration
    ? gte(end, last, "minutes")
    : gt(end, last, "minutes")
}

function daySpan(start: Date, end: Date): number {
  return duration(start, end, "day")
}

// These two are used by eventLevels
function sortEvents({
  evtA: { start: aStart, end: aEnd, allDay: aAllDay },
  evtB: { start: bStart, end: bEnd, allDay: bAllDay },
}: EventSortParams): number {
  let startSort = +startOf(aStart, "day") - +startOf(bStart, "day")

  let durA = daySpan(aStart, aEnd)

  let durB = daySpan(bStart, bEnd)

  return (
    startSort || // sort by start Day first
    durB - durA || // events spanning multiple days go first
    Number(!!bAllDay) - Number(!!aAllDay) || // then allDay single day events
    +aStart - +bStart || // then sort by start time
    +aEnd - +bEnd // then sort by end time
  )
}

function inEventRange({
  event: { start, end },
  range: { start: rangeStart, end: rangeEnd },
}: EventRangeParams): boolean {
  let eStart = startOf(start, "day")

  let startsBeforeEnd = lte(eStart, rangeEnd, "day")
  // when the event is zero duration we need to handle a bit differently
  const sameMin = neq(eStart, end, "minutes")
  let endsAfterStart = sameMin
    ? gt(end, rangeStart, "minutes")
    : gte(end, rangeStart, "minutes")
  return startsBeforeEnd && endsAfterStart
}

// other localizers treats 'day' and 'date' equality very differently, so we
// abstract the change the 'localizer.eq(date1, date2, 'day') into this
// new method, where they can be treated correctly by the localizer overrides
function isSameDate(date1: Date, date2: Date): boolean {
  return eq(date1, date2, "day")
}

function startAndEndAreDateOnly(start: Date, end: Date): boolean {
  return isJustDate(start) && isJustDate(end)
}

export class DateLocalizer {
  propType: any
  formats: Record<string, string>
  format: (
    value: Date,
    format: string,
    locale?: string
  ) => string | null | undefined
  startOfWeek: (locale?: string) => number
  merge: typeof merge
  inRange: typeof inRange
  lt: typeof lt
  lte: typeof lte
  gt: typeof gt
  gte: typeof gte
  eq: typeof eq
  neq: typeof neq
  startOf: typeof startOf
  endOf: typeof endOf
  add: typeof add
  range: typeof range
  diff: typeof diff
  ceil: typeof ceil
  min: typeof min
  max: typeof max
  minutes: typeof minutes
  daySpan: typeof daySpan
  firstVisibleDay: typeof firstVisibleDay
  lastVisibleDay: typeof lastVisibleDay
  visibleDays: typeof visibleDays
  getSlotDate: typeof getSlotDate
  getTimezoneOffset: (value: Date) => number
  getDstOffset: typeof getDstOffset
  getTotalMin: typeof getTotalMin
  getMinutesFromMidnight: typeof getMinutesFromMidnight
  continuesPrior: typeof continuesPrior
  continuesAfter: typeof continuesAfter
  sortEvents: typeof sortEvents
  inEventRange: typeof inEventRange
  isSameDate: typeof isSameDate
  startAndEndAreDateOnly: typeof startAndEndAreDateOnly
  segmentOffset: number

  constructor(spec: DateLocalizerSpec) {
    invariant(
      typeof spec.format === "function",
      "date localizer `format(..)` must be a function"
    )
    invariant(
      typeof spec.firstOfWeek === "function",
      "date localizer `firstOfWeek(..)` must be a function"
    )

    this.formats = spec.formats || {}
    this.format = (...args: [Date, string, string?]) =>
      _format(this, spec.format, ...(args as [Date, string, string]))
    // These date arithmetic methods can be overriden by the localizer
    this.startOfWeek = spec.firstOfWeek
    this.merge = spec.merge || merge
    this.inRange = spec.inRange || inRange
    this.lt = spec.lt || lt
    this.lte = spec.lte || lte
    this.gt = spec.gt || gt
    this.gte = spec.gte || gte
    this.eq = spec.eq || eq
    this.neq = spec.neq || neq
    this.startOf = spec.startOf || startOf
    this.endOf = spec.endOf || endOf
    this.add = spec.add || add
    this.range = spec.range || range
    this.diff = spec.diff || diff
    this.ceil = spec.ceil || ceil
    this.min = spec.min || min
    this.max = spec.max || max
    this.minutes = spec.minutes || minutes
    this.daySpan = spec.daySpan || daySpan
    this.firstVisibleDay = spec.firstVisibleDay || firstVisibleDay
    this.lastVisibleDay = spec.lastVisibleDay || lastVisibleDay
    this.visibleDays = spec.visibleDays || visibleDays

    this.getSlotDate = spec.getSlotDate || getSlotDate
    this.getTimezoneOffset =
      spec.getTimezoneOffset || ((value: Date) => value.getTimezoneOffset())
    this.getDstOffset = spec.getDstOffset || getDstOffset
    this.getTotalMin = spec.getTotalMin || getTotalMin
    this.getMinutesFromMidnight =
      spec.getMinutesFromMidnight || getMinutesFromMidnight
    this.continuesPrior = spec.continuesPrior || continuesPrior
    this.continuesAfter = spec.continuesAfter || continuesAfter
    this.sortEvents = spec.sortEvents || sortEvents
    this.inEventRange = spec.inEventRange || inEventRange
    this.isSameDate = spec.isSameDate || isSameDate
    this.startAndEndAreDateOnly =
      spec.startAndEndAreDateOnly || startAndEndAreDateOnly
    this.segmentOffset = spec.browserTZOffset ? spec.browserTZOffset() : 0
  }
}

export function mergeWithDefaults(
  localizer: DateLocalizer,
  locale: string,
  formatOverrides: Record<string, string>,
  messages: Record<string, string>
): DateLocalizer & MergeDefaultsParams {
  const formats = {
    ...localizer.formats,
    ...formatOverrides,
  }

  return {
    ...localizer,
    messages,
    startOfWeek: () => localizer.startOfWeek(locale),
    format: (value: Date, format: string) =>
      localizer.format(value, formats[format] || format, locale) ?? "",
  }
}
