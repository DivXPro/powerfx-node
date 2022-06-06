/*!
 *
 *
 * Based upon: https://msdn.microsoft.com/en-us/library/System.Exception%28v=vs.110%29.aspx
 */

import { SystemException, Error } from './SystemException'

const NAME: string = 'InvalidOperationException'

export { Error }

export class InvalidOperationException extends SystemException {
  protected getName(): string {
    return NAME
  }
}

export default InvalidOperationException
