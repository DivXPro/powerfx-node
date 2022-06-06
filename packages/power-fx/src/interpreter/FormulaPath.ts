import { DValue, FormulaValue, RecordValue, TableValue } from '../public'

export class FormulaPath {
  public static PathSeperator = '.'
  public static ArrayLeft = '['
  public static ArrayRight = ']'
  public pattern: Array<string | number>

  constructor(pathStr: string, base?: FormulaPath) {
    if (base != null) {
      this.pattern = base.pattern.concat(...this.parse(pathStr))
    }
    this.pattern = this.parse(pathStr)
  }

  parse(pathStr: string) {
    return pathStr.split(/\].?|\[|\./)
  }

  get top() {
    return this.pattern[0]
  }

  fetchFormulaValue(value: FormulaValue, pattern?: Array<string | number>): FormulaValue {
    if (pattern.length === 1) {
      return FormulaPath.FindValue(value, (pattern ?? this.pattern)[0])
    }
    if (pattern.length > 1) {
      const v = FormulaPath.FindValue(value, (pattern ?? this.pattern)[0])
      return this.fetchFormulaValue(v, pattern.slice(1))
    }
    return value
  }

  setFormulaValue(value: FormulaValue, target: FormulaValue) {}

  public static FindValue(value: FormulaValue, pattern: string | number): FormulaValue {
    const realValue = value instanceof DValue ? FormulaPath.GetRealValue(value) : value
    if (realValue instanceof TableValue && typeof pattern === 'number') {
      return realValue.rows[pattern].value
    }
    if (value instanceof RecordValue && typeof pattern === 'string') {
      return value.getField(pattern)
    }
  }

  public static GetRealValue(value: DValue<any>): FormulaValue {
    const realValue = value.toFormulaValue()
    return realValue instanceof DValue ? FormulaPath.GetRealValue(realValue) : realValue
  }
}
