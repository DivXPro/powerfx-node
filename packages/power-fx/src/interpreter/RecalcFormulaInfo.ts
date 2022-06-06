import { TexlBinding } from '../binding'
import { FormulaType } from '../public/types/FormulaType'
import { FormulaValue } from '../public/values'

declare type OnUpdateType = (name: string, value: FormulaValue) => void
export class RecalcFormulaInfo {
  depensOn: Set<string> = new Set()
  usedBy: Set<string> = new Set()
  type: FormulaType
  onUpdate: OnUpdateType
  binding: TexlBinding
  value: FormulaValue
  constructor(
    type: FormulaType,
    value: FormulaValue,
    depensOn?: Set<string>,
    usedBy?: Set<string>,
    onUpdate?: OnUpdateType,
    binding?: TexlBinding,
  ) {
    this.type = type
    this.value = value
    this.depensOn = depensOn ?? this.depensOn
    this.usedBy = usedBy ?? this.usedBy
    this.onUpdate = onUpdate
    this.binding = binding
  }
}
