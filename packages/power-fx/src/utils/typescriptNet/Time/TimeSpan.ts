import dayjs from 'dayjs'
import duration from 'dayjs/plugin/duration'
import Type from '../Types'
import TimeUnit from './TimeUnit'
import ClockTime from './ClockTime'
import TimeQuantity from './TimeQuantity'
import { Milliseconds, Ticks } from './HowMany'
import ITimeMeasurement from './ITimeMeasurement'
import ITimeQuantity from './ITimeQuantity'
import Lazy from '../Lazy'

dayjs.extend(duration)

/*!
 *
 * Originally based upon .NET source but with many additions and improvements.
 *
 */

// ASP.NET json date format regex
const aspNetRegex = /^(-|\+)?(?:(\d*)[. ])?(\d+):(\d+)(?::(\d+)(\.\d*)?)?$/
// from http://docs.closure-library.googlecode.com/git/closure_goog_date_date.js.source.html
// somewhat more in line with 4.4.3.2 2004 spec, but allows decimal anywhere
// and further modified to allow for strings containing both week and day
const isoRegex =
  /^(-|\+)?P(?:([-+]?[0-9,.]*)Y)?(?:([-+]?[0-9,.]*)M)?(?:([-+]?[0-9,.]*)W)?(?:([-+]?[0-9,.]*)D)?(?:T(?:([-+]?[0-9,.]*)H)?(?:([-+]?[0-9,.]*)M)?(?:([-+]?[0-9,.]*)S)?)?$/

/**
 * TimeSpan expands on TimeQuantity to provide an class that is similar to .NET's TimeSpan including many useful static methods.
 */
export class TimeSpan extends TimeQuantity implements ITimeMeasurement {
  /**
   * The total number of ticks that represent this amount of time.
   */
  readonly ticks: number

  /**
   * The total number of ticks that milliseconds this amount of time.
   */
  get totalMilliseconds() {
    return this._quantity
  }

  get milliseconds() {
    return this.totalMilliseconds % Milliseconds.Per.Second
  }

  /**
   * The total number of ticks that seconds this amount of time.
   */

  get seconds() {
    // return this._quantity % Milliseconds.Per.Minute
    return Math.floor(
      (this._quantity % Milliseconds.Per.Minute) / Milliseconds.Per.Second
    )
  }

  get totalSeconds() {
    return this._quantity / Milliseconds.Per.Second
  }

  /**
   * The total number of ticks that minutes this amount of time.
   */
  get minutes() {
    return Math.floor(
      (this._quantity % Milliseconds.Per.Hour) / Milliseconds.Per.Minute
    )
  }

  get totalMinutes() {
    return this._quantity / Milliseconds.Per.Minute
  }

  /**
   * The total number of ticks that hours this amount of time.
   */
  get hours() {
    return Math.floor(
      (this._quantity % Milliseconds.Per.Day) / Milliseconds.Per.Hour
    )
  }

  get totalHours() {
    return this._quantity / Milliseconds.Per.Hour
  }

  /**
   * The total number of ticks that days this amount of time.
   */
  get days() {
    return Math.floor(this._quantity / Milliseconds.Per.Day)
  }

  get totalDays() {
    return this._quantity / Milliseconds.Per.Day
  }

  /**
   * The total number of ticks that days this amount of time.
   */

  // In .NET the default type is Ticks, but for JavaScript, we will use Milliseconds.
  constructor(value: number, units: TimeUnit = TimeUnit.Milliseconds) {
    if (isNaN(value)) throw Error('Cannot construct a TimeSpan from NaN value.')
    const ms = TimeUnit.toMilliseconds(value, units)
    super(ms)

    this.ticks = ms * Ticks.Per.Millisecond
    // this.milliseconds = ms
    // this.seconds = ms / Milliseconds.Per.Second
    // this.minutes = ms / Milliseconds.Per.Minute
    // this.hours = ms / Milliseconds.Per.Hour
    // this.days = ms / Milliseconds.Per.Day

    this._time = Lazy.create(() => new ClockTime(this.getTotalMilliseconds()))

    Object.freeze(this)
  }

  /**
   * Provides an standard interface for acquiring the total time.
   * @returns {TimeSpan}
   */
  get total(): TimeSpan {
    return this
  }

  private _time: Lazy<ClockTime>
  // Instead of the confusing getTotal versus unit name, expose a 'ClockTime' value which reports the individual components.
  get time(): ClockTime {
    return this._time.value
  }

  add(other: ITimeQuantity): TimeSpan {
    if (Type.isNumber(other))
      throw new Error(
        'Use .addUnit(value:number,units:TimeUnit) to add a numerical value amount.  Default units are milliseconds.\n' +
          '.add only supports quantifiable time values (ITimeTotal).'
      )

    return new TimeSpan(this.getTotalMilliseconds() + other.total.milliseconds)
  }

  addUnit(value: number, units: TimeUnit = TimeUnit.Milliseconds): TimeSpan {
    return new TimeSpan(
      this.getTotalMilliseconds() + TimeUnit.toMilliseconds(value, units)
    )
  }

  subtract(ts: TimeSpan) {
    return new TimeSpan(this.getTotalMilliseconds() - ts.getTotalMilliseconds())
  }

  static from(value: number, units: TimeUnit) {
    return new TimeSpan(value, units)
  }

  static fromDays(value: number): TimeSpan {
    return new TimeSpan(value, TimeUnit.Days)
  }

  static fromHours(value: number): TimeSpan {
    return new TimeSpan(value, TimeUnit.Hours)
  }

  static fromMinutes(value: number): TimeSpan {
    return new TimeSpan(value, TimeUnit.Minutes)
  }

  static fromSeconds(value: number): TimeSpan {
    return new TimeSpan(value, TimeUnit.Seconds)
  }

  static fromMilliseconds(value: number): TimeSpan {
    return new TimeSpan(value, TimeUnit.Milliseconds)
  }

  static fromTicks(value: number): TimeSpan {
    return new TimeSpan(value, TimeUnit.Ticks)
  }

  static get zero(): TimeSpan {
    return timeSpanZero || (timeSpanZero = new TimeSpan(0))
  }

  static tryParse(str: string): [boolean, TimeSpan] {
    const YEAR = 0,
      MONTH = 1,
      DATE = 2,
      HOUR = 3,
      MINUTE = 4,
      SECOND = 5,
      MILLISECOND = 6,
      WEEK = 7,
      WEEKDAY = 8
    let match: RegExpExecArray
    if ((match = aspNetRegex.exec(str))) {
      const sign = match[1] === '-' ? -1 : 1
      const y = 0
      const d = toInt(match[DATE]) * sign
      const h = toInt(match[HOUR]) * sign
      const m = toInt(match[MINUTE]) * sign
      const s = toInt(match[SECOND]) * sign
      const ms = toInt(absRound(parseFloat(match[MILLISECOND]) * 1000)) * sign
      const milliseconds =
        d * Milliseconds.Per.Day +
        h * Milliseconds.Per.Hour +
        m * Milliseconds.Per.Minute +
        s * Milliseconds.Per.Second +
        ms
      const ts = new TimeSpan(milliseconds)
      return [true, ts]
    }
    return [false, undefined]
    // else if ((match = isoRegex.exec(str))) {
    //   const sign = match[1] === '-' ? -1 : 1
    //   const y = parseIso(match[2], sign)
    //   const M = parseIso(match[3], sign)
    //   const w = parseIso(match[4], sign)
    //   const d = parseIso(match[5], sign)
    //   const h = parseIso(match[6], sign)
    //   const m = parseIso(match[7], sign)
    //   const s = parseIso(match[8], sign)
    // }
  }

  toString(formatter: string) {
    return dayjs.duration(this._quantity).format(formatter)
  }
}

function absFloor(number: number) {
  if (number < 0) {
    // -0 -> 0
    return Math.ceil(number) || 0
  } else {
    return Math.floor(number)
  }
}

function toInt(argumentForCoercion: number | string) {
  let coercedNumber = +argumentForCoercion
  let value = 0

  if (coercedNumber !== 0 && isFinite(coercedNumber)) {
    value = absFloor(coercedNumber)
  }

  return value
}

function absRound(number: number) {
  if (number < 0) {
    return Math.round(-1 * number) * -1
  } else {
    return Math.round(number)
  }
}

function parseIso(inp: string, sign: 1 | -1) {
  // We'd normally use ~~inp for this, but unfortunately it also
  // converts floats to ints.
  // inp may be undefined, so careful calling replace on it.
  const res = inp && parseFloat(inp.replace(',', '.'))
  // apply sign while we're at it
  return (isNaN(res) ? 0 : res) * sign
}

let timeSpanZero: TimeSpan

export default TimeSpan
