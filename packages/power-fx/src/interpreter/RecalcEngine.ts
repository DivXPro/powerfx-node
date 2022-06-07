import { TexlBinding } from '../binding'
import { DataSourceToQueryOptionsMap } from '../entities/queryOptions/DataSourceToQueryOptionsMap'
import { Glue2DocumentBinderGlue } from '../glue/Glue'
import { IRContext } from '../ir/IRContext'
import { IRTranslator } from '../ir/IRTranslator'
import TexlLexer from '../lexer/TexlLexer'
import { Span } from '../localization'
import { TexlParserFlags } from '../parser'
import { CheckResult } from '../public/CheckResult'
import { PowerFxConfig } from '../public/config/PowerFxConfig'
import { FormulaWithParameters } from '../public/FormulaWithParameters'
import { IPowerFxEngine } from '../public/IPowerFxEngine'
import { FormulaType, RecordType } from '../public/types'
import { FormulaValue, NumberValue, RecordValue } from '../public/values'
import { Formula } from '../syntax/Formula'
import { DKind } from '../types/DKind'
import { Dictionary } from '../utils/Dictionary'
import { DependencyFinder } from './DependencyFinder'
import { Library } from './functions/Library'
import { IScope } from './IScope'
import { ParsedExpression } from './ParsedExpression'
import { RecalcEngineResolver } from './RecalcEngineResolver'
import { RecalcEngineWorker } from './RecalcEngineWorker'
import { RecalcFormulaInfo } from './RecalcFormulaInfo'
import { BuiltinFunctionsCore } from '../texl/BuiltinFunctionsCore'
import { PowerFxConfigExtensions } from './environment/PowerFxConfigExtensions'
import { ExpandPath } from '../types'
import { RecalcEngineDocument } from './external/RecalcEngineDocument'
import { RecalcGlue } from './environment/RecalcGlue'
import { IntellisenseContext } from '../texl/intellisense/IntellisenseContext'
import { IntellisenseProvider } from '../texl/intellisense/IntellisenseProvider'
import { IIntellisenseResult } from '../texl/intellisense/IIntellisenseResult'

// noinspection SpellCheckingInspection
export class RecalcEngine implements IScope, IPowerFxEngine {
  // private readonly _extraFunctions: Record<string, TexlFunction> = {}
  private readonly _formulas: Record<string, RecalcFormulaInfo> = {}
  private readonly _document: RecalcEngineDocument
  public get formulas() {
    return this._formulas
  }
  private readonly _powerFxConfig: PowerFxConfig

  constructor(powerFxConfig?: PowerFxConfig, document?: RecalcEngineDocument) {
    powerFxConfig = powerFxConfig ?? new PowerFxConfigExtensions()
    this.addInterpreterFunctions(powerFxConfig)
    this._powerFxConfig = powerFxConfig
    this._document = document
  }

  // Add Builtin functions that aren't yet in the shared library.
  private addInterpreterFunctions(powerFxConfig: PowerFxConfig) {
    powerFxConfig.addFunction(BuiltinFunctionsCore.Index_UO)
    powerFxConfig.addFunction(BuiltinFunctionsCore.ParseJson)
    powerFxConfig.addFunction(BuiltinFunctionsCore.Table_UO)
    powerFxConfig.addFunction(BuiltinFunctionsCore.Text_UO)
    powerFxConfig.addFunction(BuiltinFunctionsCore.Value_UO)
    powerFxConfig.addFunction(BuiltinFunctionsCore.Boolean)
    powerFxConfig.addFunction(BuiltinFunctionsCore.Boolean_UO)
  }

  public getAllFunctionNames() {
    return [
      ...this._powerFxConfig.extraFunctions.keys(),
      ...Library.FunctionList.map((fn) => fn.name),
    ]
  }

  // This handles lookups in the global scope.
  resolve(name: string): FormulaValue {
    if (this.formulas[name] != null) {
      return this.formulas[name].value
    }

    // Binder should have caught.
    throw new Error(`Can't resolve '${name}'`)
  }

  /// <summary>
  /// Create or update a named variable to a value.
  /// </summary>
  /// <param name="name">variable name. This can be used in other formulas.</param>
  /// <param name="value">constant value.</param>
  public updateVariable(
    name: string,
    value: FormulaValue | number,
    ignoreTypeCheck = false
  ) {
    const x =
      value instanceof FormulaValue
        ? value
        : new NumberValue(IRContext.NotInSource(FormulaType.Number), value)
    const fi = this.formulas[name]
    if (fi != null) {
      // Type should match?
      if (!ignoreTypeCheck && !fi.type.equals(x.type)) {
        throw new Error(
          `Can't change ${name}'s type from ${DKind[fi.type._type.kind]} to ${
            DKind[x.type._type.kind]
          }.`
        )
      }
      fi.value = x
      // Be sure to preserve used-by set.
    } else {
      this.formulas[name] = new RecalcFormulaInfo(x.irContext.resultType, x)
    }
    // Could trigger recalcs?
    this.recalc(name)
  }

  // public updateValue(path: FormulaPath, value: FormulaValue | number, ignoreTypeCheck = false) {
  //   const x =
  //     value instanceof FormulaValue ? value : new NumberValue(IRContext.NotInSource(FormulaType.Number), value)
  //   const name = path.top
  //   this.formulas[name]
  // }

  /// <summary>
  /// Type check a formula without executing it.
  /// </summary>
  /// <param name="expressionText"></param>
  /// <param name="parameters"></param>
  /// <returns></returns>
  public check(
    expressionText: string,
    parameterType?: FormulaType,
    path?: ExpandPath
  ): CheckResult {
    return this.checkInternal(expressionText, parameterType, path, false)
  }

  private checkInternal(
    expressionText: string,
    parameterType?: FormulaType,
    path?: ExpandPath,
    intellisense = false
  ) {
    if (parameterType == null) {
      parameterType = new RecordType()
    }
    const formula = new Formula(expressionText)
    // formula.ensureParsed(TexlParserFlags.All)
    formula.ensureParsed(TexlParserFlags.None)
    // Ok to continue with binding even if there are parse errors.
    // We can still use that for intellisense.

    const resolver = new RecalcEngineResolver(
      this,
      this._powerFxConfig,
      parameterType as RecordType,
      this._document,
      path
    )

    const binding = TexlBinding.Run({
      // glue: new RecalcGlue(),
      glue: new Glue2DocumentBinderGlue(),
      queryOptionsMap: new DataSourceToQueryOptionsMap(),
      node: formula.parseTree,
      resolver,
      // ruleScope: parameterType._type,
      ruleScope: intellisense ? parameterType._type : null,
      useThisRecordForRuleScope: false,
    })

    const errors = formula.hasParseErrors
      ? formula.getParseErrors()
      : binding.errorContainer.getErrors()

    const result = new CheckResult()
    result._binding = binding
    result._formula = formula

    if (errors != null && errors.length > 0) {
      result.setErrors(errors)
      result.expression = undefined
    } else {
      result.topLevelIdentifiers = DependencyFinder.FindDependencies(
        binding.top,
        binding
      )

      // TODO: Fix FormulaType.Build to not throw exceptions for Enum types then remove this check
      if (binding.resultType.kind != DKind.Enum) {
        result.returnType = FormulaType.Build(binding.resultType)
      }
      const { topNode: irnode, ruleScopeSymbol } = IRTranslator.Translate(
        result._binding
      )
      result.expression = new ParsedExpression(irnode, ruleScopeSymbol)
    }
    return result
  }

  /// <summary>
  /// Evaluate an expression as text and return the result.
  /// </summary>
  /// <param name="expressionText">textual representation of the formula.</param>
  /// <param name="parameters">parameters for formula. The fields in the parameter record can
  /// be acecssed as top-level identifiers in the formula.</param>
  /// <returns>The formula's result.</returns>
  public eval(
    expressionText: string,
    parameters?: RecordValue,
    path?: ExpandPath
  ): Promise<FormulaValue> {
    if (parameters == null) {
      parameters = RecordValue.Empty()
    }

    const check = this.check(
      expressionText,
      parameters.irContext.resultType,
      path
    )
    check.throwOnErrors()

    return check.expression.eval(parameters)
  }

  /// <summary>
  /// Convert references in an expression to the invariant form.
  /// </summary>
  /// <param name="expressionText">textual representation of the formula.</param>
  /// <param name="parameters">Type of parameters for formula. The fields in the parameter record can
  /// be acecssed as top-level identifiers in the formula. If DisplayNames are used, make sure to have that mapping
  /// as part of the RecordType.
  /// <returns>The formula, with all identifiers converted to invariant form</returns>
  public getInvariantExpression(
    expressionText: string,
    parameters: RecordType
  ): string {
    return this.convertExpression(expressionText, parameters, false)
  }

  /// <summary>
  /// Convert references in an expression to the display form.
  /// </summary>
  /// <param name="expressionText">textual representation of the formula.</param>
  /// <param name="parameters">Type of parameters for formula. The fields in the parameter record can
  /// be acecssed as top-level identifiers in the formula. If DisplayNames are used, make sure to have that mapping
  /// as part of the RecordType.
  /// <returns>The formula, with all identifiers converted to display form</returns>
  public getDisplayExpression(
    expressionText: string,
    parameters: RecordType
  ): string {
    return this.convertExpression(expressionText, parameters, true)
  }

  private convertExpression(
    expressionText: string,
    parameters: RecordType,
    toDisplayNames: boolean
  ): string {
    const formula = new Formula(expressionText)
    formula.ensureParsed(TexlParserFlags.None)

    const resolver = new RecalcEngineResolver(
      this,
      this._powerFxConfig,
      parameters
    )
    const binding = TexlBinding.Run({
      glue: new Glue2DocumentBinderGlue(),
      queryOptionsMap: new DataSourceToQueryOptionsMap(),
      node: formula.parseTree,
      resolver,
      ruleScope: parameters._type,
      useThisRecordForRuleScope: false,
      updateDisplayNames: toDisplayNames,
      forceUpdateDisplayNames: toDisplayNames,
    })

    const worklist = new Dictionary<Span, string>()
    for (const token of binding.nodesToReplace) {
      worklist.set(token.key.Span, TexlLexer.EscapeName(token.value))
    }

    return Span.ReplaceSpans(expressionText, worklist.toKeyValuePairs())
  }

  /// <summary>
  /// Create a formula that will be recalculated when its dependent values change.
  /// </summary>
  /// <param name="name">name of formula. This can be used in other formulas.</param>
  /// <param name="expr">expression.</param>
  /// <param name="onUpdate">Callback to fire when this value is updated.</param>
  public setFormula(
    name: string,
    expr: FormulaWithParameters | string,
    onUpdate: (str: string, value: FormulaValue) => void,
    path?: ExpandPath
  ) {
    if (this.formulas[name] != null) {
      throw new Error(`Can't change existing formula: ${name}`)
    }
    const expression =
      expr instanceof FormulaWithParameters
        ? expr
        : new FormulaWithParameters(expr)
    const check = this.check(expression._expression, expression._schema, path)

    check.throwOnErrors()
    const binding = check._binding

    // We can't have cycles because:
    // - formulas can only refer to already-defined values
    // - formulas can't be redefined.
    const dependsOn = check.topLevelIdentifiers

    const type = FormulaType.Build(binding.resultType)
    this.formulas[name] = new RecalcFormulaInfo(
      type,
      undefined,
      dependsOn,
      undefined,
      onUpdate,
      binding
    )

    for (const x of dependsOn) {
      this.formulas[x].usedBy.add(name)
    }
    this.recalc(name)
  }

  /// <summary>
  /// Get intellisense from the formula.
  /// </summary>
  public Suggest(
    expression: string,
    parameterType: FormulaType,
    cursorPosition: number
  ): IIntellisenseResult {
    const result = this.checkInternal(expression, parameterType, null, true)
    const binding = result._binding
    const formula = result._formula
    const context = new IntellisenseContext(expression, cursorPosition)
    const intellisense = IntellisenseProvider.GetIntellisense(
      this._powerFxConfig.enumStore
    )
    const suggestions = intellisense.Suggest(context, binding, formula)
    return suggestions
  }

  // Trigger a recalc on name and anything that depends on it.
  // Invoke on Update callbacks.
  private recalc(name: string) {
    const r = new RecalcEngineWorker(this)
    r.recalc(name)
  }

  public deleteFormula(name: string) {
    throw new Error('NotImplementedException')
  }

  /// <summary>
  /// Get the current value of a formula.
  /// </summary>
  /// <param name="name"></param>
  /// <returns></returns>
  public getValue(name: string): FormulaValue {
    const fi = this.formulas[name]
    return fi.value
  }
}
