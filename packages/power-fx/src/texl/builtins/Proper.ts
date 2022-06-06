import { TexlBinding } from '../../binding'
import { OperationCapabilityMetadata } from '../../functions/delegation'
import { TexlStrings } from '../../localization'
import { CallNode } from '../../syntax'
import { FunctionCategories } from '../../types/FunctionCategories'
import { StringOneArgFunction, StringOneArgTableFunction } from './StringOneArgFunction'

export class ProperFunction extends StringOneArgFunction {
  public get hasPreciseErrors() {
    return true
  }
  public get supportsParamCoercion() {
    return true
  }

  constructor() {
    super('Proper', TexlStrings.AboutProper, FunctionCategories.Text)
  }

  public isRowScopedServerDelegatable(callNode: CallNode, binding: TexlBinding, metadata: OperationCapabilityMetadata) {
    return false
  }
}

// Proper(arg:*[s])
export class ProperTFunction extends StringOneArgTableFunction {
  public get hasPreciseErrors() {
    return true
  }

  constructor() {
    super('Proper', TexlStrings.AboutProperT, FunctionCategories.Table)
  }
}
