import dayjs from 'dayjs'

export class DateTimeExtensions {
  private static readonly JavaScriptEpoch = new Date(0)
  private static readonly OleAutomationEpoch = new Date(1899, 11, 30)
  private static readonly Default = new Date(1, 1, 1)

  // Convert a JavaScript date value to a DateTime object. 时间戳
  static FromJavaScriptDate(value: number) {
    return new Date(value)
  }

  public static ToJavaSciptDate(dt: Date) {
    return dayjs(dt).diff(DateTimeExtensions.JavaScriptEpoch)
  }

  // Convert an OLE Automation date (Excel date format) to a DateTime.
  public static TryFromOADate(value: number): [boolean, Date] {
    // From MSDN: double-precision floating-point number that represents a date as the number of days before or after the base date,
    // midnight, 30 December 1899. The sign and integral part of d encode the date as a positive or negative day displacement from
    // 30 December 1899, and the absolute value of the fractional part of d encodes the time of day as a fraction of a day displacement
    // from midnight. d must be a value between negative 657435.0 through positive 2958465.99999999.
    // Note that because of the way dates are encoded, there are two ways of representing any time of day on 30 December 1899.
    // For example, -0.5 and 0.5 both mean noon on 30 December 1899 because a day displacement of plus or minus zero days from the
    // base date is still the base date, and a half day displacement from midnight is noon.
    // See ToOADate and the MSDN Online Library at http://MSDN.Microsoft.com/library/default.asp for more information on OLE Automation.
    const days = parseInt(value.toString())
    const ms = Math.abs((value - days) * 8.64e7)
    const newDate = new Date(1899, 11, 30 + days, 0, 0, 0, ms)
    if (isNaN(newDate.getTime())) {
      return [false, DateTimeExtensions.Default]
    }
    return [true, newDate]
  }

  public static TryParse(value: string): [boolean, Date] {
    const newValue = dayjs(value)
    if (newValue.isValid()) {
      return [true, newValue.toDate()]
    }
    return [false, DateTimeExtensions.Default]
  }
}
