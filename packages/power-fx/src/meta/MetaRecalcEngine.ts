import { Form } from '@formily/core'
import { IObjectMeta } from '@toy-box/meta-schema'
import { Path } from '@formily/path'
import {
  BuiltinFunctionsCore,
  IScope,
  Library,
  PowerFxConfig,
  PowerFxConfigExtensions,
  FormulaValue,
  FormulaType,
  RecordType,
  RecordValue,
  RecalcGlue,
  TexlParserFlags,
  DKind,
  IRTranslator,
  ParsedExpression,
} from '../index'
import { TexlBinding } from '../binding'
import { DataSourceToQueryOptionsMap } from '../entities/queryOptions/DataSourceToQueryOptionsMap'
import { Glue2DocumentBinderGlue } from '../glue/Glue'
import { TexlLexer } from '../lexer'
import { Span } from '../localization'
import { CheckResult, IPowerFxEngine } from '../public'
import { Formula } from '../syntax/Formula'
import { MetaResolver } from './MetaResolver'
import { getMetasIn } from './metaType'
import { makeFormulaValue } from './metaValue'
import { MetaEngineDocument } from './MetaEngineDocument'
import { DPath } from '../utils'
import { makeDPath } from './metaType'
import { MetaEntityScope } from './MetaEntityScope'

export class MetaRecalcEngine implements IScope, IPowerFxEngine {
  private readonly _powerFxConfig: PowerFxConfig
  private readonly _document: MetaEngineDocument
  private readonly _form: Form
  private readonly _metaSchema: IObjectMeta

  constructor(form: Form, metaSchema: IObjectMeta, powerFxConfig?: PowerFxConfig, document?: MetaEngineDocument) {
    this._metaSchema = metaSchema
    this._form = form
    this._powerFxConfig = powerFxConfig ?? new PowerFxConfigExtensions()
    this._document =
      document ??
      new MetaEngineDocument(
        new MetaEntityScope({
          form,
          metaSchema,
        }),
      )
    this.addInterpreterFunctions(this._powerFxConfig)
  }

  public get form() {
    return this._form
  }

  public get metaSchema() {
    return this._metaSchema
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
    return [...this._powerFxConfig.extraFunctions.keys(), ...Library.FunctionList.map((fn) => fn.name)]
  }

  // This handles lookups in the global scope.
  public resolve(name: string): FormulaValue {
    return makeFormulaValue(getMetasIn(name, this.metaSchema), this.form.getValuesIn(name))
  }

  public check(expressionText: string, parameterType?: FormulaType, path?: DPath): CheckResult {
    return this.checkInternal(expressionText, parameterType, path, false)
  }

  private checkInternal(
    expressionText: string,
    parameterType?: FormulaType,
    path?: DPath,
    intellisense: boolean = false,
  ) {
    if (parameterType == null) {
      parameterType = new RecordType()
    }
    const formula = new Formula(expressionText)
    formula.ensureParsed(TexlParserFlags.All)
    // Ok to continue with binding even if there are parse errors.
    // We can still use that for intellisense.

    const resolver = new MetaResolver(this, this._powerFxConfig, this._document, path)

    const binding = TexlBinding.Run({
      glue: new RecalcGlue(),
      queryOptionsMap: new DataSourceToQueryOptionsMap(),
      node: formula.parseTree,
      resolver,
      ruleScope: parameterType._type,
    })
    const errors = formula.hasParseErrors ? formula.getParseErrors() : binding.errorContainer.getErrors()

    const result = new CheckResult()
    result._binding = binding
    result._formula = formula

    if (errors != null && errors.length > 0) {
      result.setErrors(errors)
      result.expression = undefined
    } else {
      // result.topLevelIdentifiers = DependencyFinder.FindDependencies(binding.top, binding);

      // TODO: Fix FormulaType.Build to not throw exceptions for Enum types then remove this check
      if (binding.resultType.kind !== DKind.Enum) {
        result.returnType = FormulaType.Build(binding.resultType)
      }
      const { topNode: irnode, ruleScopeSymbol } = IRTranslator.Translate(result._binding)
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
  public eval(expressionText: string, pathStr?: string, parameters?: RecordValue): Promise<FormulaValue> {
    if (parameters == null) {
      parameters = RecordValue.Empty()
    }
    const check = this.check(expressionText, parameters.irContext.resultType, makeDPath(new Path(pathStr)))
    check.throwOnErrors()
    return check.expression.eval(parameters)
  }

  public getInvariantExpression(expressionText: string, parameters: RecordType): string {
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
  public getDisplayExpression(expressionText: string, parameters: RecordType): string {
    return this.convertExpression(expressionText, parameters, true)
  }

  private convertExpression(expressionText: string, parameters: RecordType, toDisplayNames: boolean): string {
    const formula = new Formula(expressionText)
    formula.ensureParsed(TexlParserFlags.None)

    const resolver = new MetaResolver(this, this._powerFxConfig)
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

    const worklist = new Map<Span, string>()
    for (const token of binding.nodesToReplace) {
      worklist.set(token.key.Span, TexlLexer.EscapeName(token.value))
    }
    return Span.ReplaceSpans(
      expressionText,
      Array.from(worklist.entries()).map((v) => ({ key: v[0], value: v[1] })),
    )
  }
}
