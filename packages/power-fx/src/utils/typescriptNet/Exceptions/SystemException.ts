/*!
 *
 *
 * Based upon: https://msdn.microsoft.com/en-us/library/system.systemexception%28v=vs.110%29.aspx
 */

import Exception, { Error } from '../Exception'

const NAME: string = 'SystemException'

export { Error }

export class SystemException extends Exception {
  /*
		constructor(
			message:string = null,
			innerException:Error = null,
			beforeSealing?:(ex:any)=>void)
		{
			super(message, innerException, beforeSealing);
		}
	*/

  protected getName(): string {
    return NAME
  }
}

export default SystemException
