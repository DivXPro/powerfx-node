import { TextDocumentUri } from '../languageServerProtocol/protocol/TextDocumentUri'
import { CheckResult } from '../public/CheckResult'
import { IPowerFxScope } from '../public/IPowerFxScope'
import { FormulaType } from '../public/types/FormulaType'
import { FormulaValue } from '../public/values'
import { IIntellisenseResult } from '../texl/intellisense/IIntellisenseResult'
import { RecalcEngine } from './RecalcEngine'

export class RecalcEngineScope implements IPowerFxScope {
  private readonly _engine: RecalcEngine

  private readonly _contextType: FormulaType

  constructor(engine: RecalcEngine, contextType: FormulaType) {
    this._engine = engine
    this._contextType = contextType
  }

  public static FromRecord(engine: RecalcEngine, type: FormulaType): RecalcEngineScope {
    return new RecalcEngineScope(engine, type)
  }

  public static FromUri(engine: RecalcEngine, uri: TextDocumentUri): RecalcEngineScope {
    // var uriObj = new Uri(uri);
    // var contextJson = HttpUtility.ParseQueryString(uriObj.Query).Get("context");
    let contextJson = uri.context
    if (contextJson == null) {
      contextJson = '{}'
    }

    return RecalcEngineScope.FromJson(engine, uri.context)
  }

  public static FromJson(engine: RecalcEngine, json: string): RecalcEngineScope {
    const context = FormulaValue.FromJsonString(json)
    return RecalcEngineScope.FromRecord(engine, context.type)
  }

  public check(expression: string): CheckResult {
    return this._engine.check(expression, this._contextType)
  }

  Suggest(expression: string, cursorPosition: number): IIntellisenseResult {
    return this._engine.Suggest(expression, this._contextType, cursorPosition)
  }
}
