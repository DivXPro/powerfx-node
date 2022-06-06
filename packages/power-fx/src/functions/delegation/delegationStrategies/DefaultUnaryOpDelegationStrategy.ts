import { UnaryOp } from '../../../lexer/UnaryOp'
import { TexlFunction } from '../../TexlFunction'
import { UnaryOpDelegationStrategy } from './UnaryOpDelegationStrategy'

export class DefaultUnaryOpDelegationStrategy extends UnaryOpDelegationStrategy {
  constructor(op: UnaryOp, fn: TexlFunction) {
    super(op, fn)
  }
}
