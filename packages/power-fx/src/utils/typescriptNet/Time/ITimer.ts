export default interface ITimer {
  isRunning: boolean
  start(): void
  stop(): void
  reset(): void
}
