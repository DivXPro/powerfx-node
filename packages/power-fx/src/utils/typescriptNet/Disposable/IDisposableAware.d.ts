import IDisposable from './IDisposable'

export default interface IDisposableAware extends IDisposable {
  wasDisposed: boolean
}
