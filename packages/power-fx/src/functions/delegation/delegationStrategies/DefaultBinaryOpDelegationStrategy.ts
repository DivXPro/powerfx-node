import { BinaryOp } from '../../../lexer/BinaryOp'
import { TexlFunction } from '../../TexlFunction'
import { BinaryOpDelegationStrategy } from './OpDelegationStrategy'

export class DefaultBinaryOpDelegationStrategy extends BinaryOpDelegationStrategy {
  constructor(op: BinaryOp, fn: TexlFunction) {
    super(op, fn)
  }
}
