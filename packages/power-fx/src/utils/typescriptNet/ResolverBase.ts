import DisposableBase from './Disposable/DisposableBase'
import { Func } from './FunctionTypes'
import ArgumentNullException from './Exceptions/ArgumentNullException'

const NULL: any = null
const NAME: string = 'ResolverBase'

/**
 * The ResolverBase class handles resolving a factory method and detects recursion.
 * Since JS does not have a synchronization mechanism (lock or otherwise)
 * we have to prevent getValue from double triggering the value factory (optimistic concurrency)
 * or returning return a value that is intermediate between resolving and resolved.
 */
export default abstract class ResolverBase<T> extends DisposableBase {
  protected _isValueCreated: boolean | null // null = 'creating'
  protected _value: T | undefined

  protected constructor(
    protected _valueFactory: Func<T>,
    private readonly _trapExceptions: boolean,
    private readonly _allowReset: boolean = false,
  ) {
    super(NAME)
    if (!_valueFactory) throw new ArgumentNullException('valueFactory')
    this._isValueCreated = false
  }

  protected _error: any

  protected getError(): any {
    return this._error
  }

  get error(): any {
    return this.getError()
  }

  getValue(): T {
    const _ = this
    _.throwIfDisposed()

    if (_._isValueCreated === null) throw new Error('Recursion detected.')

    let c: Func<T> = _._valueFactory
    if (c && !_._isValueCreated) {
      _._isValueCreated = null // Mark this as 'resolving'.
      try {
        if (c) {
          if (!this._allowReset) _._valueFactory = NULL
          const v = c()
          _._value = v
          _._error = void 0
          return v
        }
      } catch (ex) {
        _._error = ex
        if (!_._trapExceptions) throw ex
      } finally {
        _._isValueCreated = true
      }
    }

    return _._value!
  }

  get canReset(): boolean {
    return this._allowReset && !!this._valueFactory
  }

  protected _onDispose(): void {
    this._valueFactory = NULL
    this._value = NULL
    this._isValueCreated = NULL
  }

  tryReset(): boolean {
    const _ = this

    if (!_._valueFactory) return false
    else {
      _._isValueCreated = false
      _._value = NULL
      _._error = void 0
      return true
    }
  }
}
