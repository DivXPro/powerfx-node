import { IRContext } from '../../ir/IRContext'
import { BooleanValue, FormulaValue } from '../../public/values'
import { EvalVisitor } from '../EvalVisitor'
import { SymbolContext } from '../SymbolContext'

export function Not(props: { irContext: IRContext; values: BooleanValue[] }): FormulaValue {
  const { irContext, values } = props
  return new BooleanValue(irContext, !values[0].value)
}

// Lazy evaluation
export async function And(props: {
  visitor: EvalVisitor
  symbolContext: SymbolContext
  irContext: IRContext
  values: FormulaValue[]
}): Promise<FormulaValue> {
  const { visitor, symbolContext, irContext, values } = props
  for (const arg of values) {
    const res = await visitor.evalArgAsync<BooleanValue>(arg, symbolContext, arg.irContext)

    if (res.isValue) {
      const val = res.value
      if (!val.value) {
        return new BooleanValue(irContext, false)
      }
    } else {
      return res.toFormulaValue()
    }
  }

  return new BooleanValue(irContext, true)
}

// Lazy evaluation
export async function Or(props: {
  visitor: EvalVisitor
  symbolContext: SymbolContext
  irContext: IRContext
  values: FormulaValue[]
}): Promise<FormulaValue> {
  const { visitor, symbolContext, irContext, values } = props
  for (const arg of values) {
    const res = await visitor.evalArgAsync<BooleanValue>(arg, symbolContext, arg.irContext)

    if (res.isValue) {
      const val = res.value
      if (val.value) {
        return new BooleanValue(irContext, true)
      }
    } else if (res.isError) {
      return res.error
    }
  }

  return new BooleanValue(irContext, false)
}
