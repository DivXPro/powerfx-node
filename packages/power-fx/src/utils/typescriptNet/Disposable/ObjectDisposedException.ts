/*!
 *
 *
 * Based upon: https://msdn.microsoft.com/en-us/library/System.Exception%28v=vs.110%29.aspx
 */

import { Error, InvalidOperationException } from '../Exceptions/InvalidOperationException'
import IDisposableAware from './IDisposableAware'

const NAME: string = 'ObjectDisposedException'

export { Error }

export class ObjectDisposedException extends InvalidOperationException {
  //@ts-ignore
  readonly objectName: string

  // For simplicity and consistency, lets stick with 1 signature.
  constructor(objectName: string, message?: string, innerException?: Error) {
    super(message || '', innerException, (_) => {
      ;(<any>_).objectName = objectName
    })
  }

  protected getName(): string {
    return NAME
  }

  toString(): string {
    const _ = this
    let oName = _.objectName
    oName = oName ? '{' + oName + '} ' : ''

    return '[' + _.name + ': ' + oName + _.message + ']'
  }

  static throwIfDisposed(disposable: IDisposableAware, objectName: string, message?: string): true | never {
    if (disposable.wasDisposed) throw new ObjectDisposedException(objectName, message)
    return true
  }
}

export default ObjectDisposedException
