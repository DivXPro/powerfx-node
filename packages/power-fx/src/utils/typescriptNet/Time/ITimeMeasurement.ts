/**
 * This interface guarantees there will be a value property for all time units.
 */
export interface ITimeMeasurement {
  ticks: number
  milliseconds: number
  seconds: number
  minutes: number
  hours: number
  days: number
}

export default ITimeMeasurement
