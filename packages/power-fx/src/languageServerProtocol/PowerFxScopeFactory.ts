import { RecalcEngine } from '../interpreter/RecalcEngine'
import { RecalcEngineScope } from '../interpreter/RecalcEngineScope'
import { IPowerFxScope } from '../public/IPowerFxScope'
import { IPowerFxScopeFactory } from './languageServer/IPowerFxScopeFactory'
import { TextDocumentUri } from './protocol/TextDocumentUri'

export class PowerFxScopeFactory implements IPowerFxScopeFactory {
  // Ensure that we're getting the same engine used by intellisense (LSP) and evaluation.
  public GetEngine(): RecalcEngine {
    // If the engine requires additional symbols to load, server
    // should find a way to safely cache it.
    var engine = new RecalcEngine()

    return engine
  }

  // A scope wraps the engine and provides parameters used for intellisense.
  public GetScope(contextJson: string): RecalcEngineScope {
    var engine = this.GetEngine()

    return RecalcEngineScope.FromJson(engine, contextJson)
  }

  // Uri is passed in from the front-end and specifies which formula bar.
  // Returns an object that provides intellisense support.
  public GetOrCreateInstance(documentUri: TextDocumentUri): IPowerFxScope {
    // The host could pass in additional information in the Uri here to help
    // initialize a formula bar or distinguish between multiple formula bars.

    // The context is additional symbols passed by the host.
    // var uriObj = new Uri(documentUri);
    // var contextJson = HttpUtility.ParseQueryString(uriObj.Query).Get("context");
    // if (contextJson == null) {
    //   contextJson = "{}";
    // }
    let contextJson = documentUri.context // JSON.parse(documentUri).context;
    var scope = this.GetScope(contextJson)
    return scope
  }
}
