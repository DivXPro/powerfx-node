/// <summary>
/// PowerFx Language server implementation
///
/// LanguageServer can receive request/notification payload from client, it can also send request/notification to client.
///
/// LanguageServer is hosted inside WebSocket or HTTP/HTTPS service
///   * For WebSocket, OnDataReceived() is for incoming traffic, SendToClient() is for outgoing traffic
///   * For HTTP/HTTPS, OnDataReceived() is for HTTP/HTTPS request, SendToClient() is queued up in next HTTP/HTTPS response
/// </summary>

import { DocumentErrorSeverity } from '../../errors/DocumentErrorSeverity'
import { CheckResult } from '../../public/CheckResult'
import { ExpressionError } from '../../public/ExpressionError'
import { GetTokensFlags } from '../../public/GetTokensFlags'
import { IPowerFxScopeDisplayName } from '../../public/IPowerFxScopeDisplayName'
import { SuggestionKind } from '../../texl/intellisense/SuggestionKind'
import Dictionary from '../../utils/typescriptNet/Collections/Dictionaries/Dictionary'
import { CodeAction } from '../protocol/CodeAction'
import { CodeActionParams } from '../protocol/CodeActionParams'
import { CompletionItem } from '../protocol/CompletionItem'
import { CompletionItemKind } from '../protocol/CompletionItemKind'
import { CompletionParams } from '../protocol/CompletionParams'
import { CustomProtocolNames } from '../protocol/CustomProtocolNames'
import { Diagnostic } from '../protocol/Diagnostics'
import { DiagnosticSeverity } from '../protocol/DiagnosticSeverity'
import { DidChangeTextDocumentParams } from '../protocol/DidChangeTextDocumentParams'
import { DidOpenTextDocumentParams } from '../protocol/DidOpenTextDocumentParams'
import { InitialFixupParams } from '../protocol/InitialFixupParams'
import { Position } from '../protocol/Position'
import { PublishDiagnosticsParams } from '../protocol/PublishDiagnosticsParams'
import { PublishExpressionTypeParams } from '../protocol/PublishExpressionTypeParams'
import { PublishTokensParams } from '../protocol/PublishTokensParams'
import { range } from '../protocol/Range'
import { SignatureHelpParams } from '../protocol/SignatureHelpParams'
import { TextDocumentNames } from '../protocol/TextDocumentNames'
import { TextDocumentUri } from '../protocol/TextDocumentUri'
import { TextEdit } from '../protocol/TextEdit'
import { WorkspaceEdit } from '../protocol/WorkspaceEdit'
import { CodeActionKind } from './Constants'
import { IPowerFxScopeFactory } from './IPowerFxScopeFactory'
import { IPowerFxScopeQuickFix } from './IPowerFxScopeQuickFix'
import { LspRequest } from './LspRequest'

export declare type SendToClient = (data: string) => void

export enum ErrorCode {
  ParseError = -32700,
  InvalidRequest = -32600,
  MethodNotFound = -32601,
  InvalidParams = -32602,
  InternalError = -30603,
  ServerError = -32000,
}

export class LanguageServer {
  private EOL = '\n'

  // public delegate void SendToClient(string data);

  private readonly _sendToClient: SendToClient

  private readonly _scopeFactory: IPowerFxScopeFactory

  // public delegate void NotifyDidChange(DidChangeTextDocumentParams didChangeParams);

  // public event NotifyDidChange OnDidChange;

  //         private static readonly JsonSerializerOptions _jsonSerializerOptions = new JsonSerializerOptions()
  // {
  //   PropertyNameCaseInsensitive = true
  // };

  constructor(sendToClient: SendToClient, scopeFactory: IPowerFxScopeFactory) {
    // Contracts.AssertValue(sendToClient);
    // Contracts.AssertValue(scopeFactory);

    this._sendToClient = sendToClient
    this._scopeFactory = scopeFactory
  }

  /// <summary>
  /// Received request/notification payload from client
  /// </summary>
  public OnDataReceived(jsonPayload: LspRequest): void {
    try {
      let id: string
      if (jsonPayload.id != undefined) {
        id = jsonPayload.id
      }
      if (jsonPayload.method == null || jsonPayload.method == undefined) {
        this._sendToClient(this.CreateErrorResult(id, ErrorCode.InvalidRequest))
        return
      }
      if (jsonPayload.params == null || jsonPayload.params == undefined) {
        this._sendToClient(this.CreateErrorResult(id, ErrorCode.InvalidRequest))
        return
      }

      let method = jsonPayload.method
      let paramsJson = jsonPayload.params
      switch (method) {
        case TextDocumentNames.DidOpen:
          this.HandleDidOpenNotification(<DidOpenTextDocumentParams>paramsJson)
          break
        case TextDocumentNames.DidChange:
          this.HandleDidChangeNotification(
            <DidChangeTextDocumentParams>paramsJson
          )
          break
        case TextDocumentNames.Completion:
          this.HandleCompletionRequest(id, <CompletionParams>paramsJson)
          break
        case TextDocumentNames.SignatureHelp:
          this.HandleSignatureHelpRequest(id, <SignatureHelpParams>paramsJson)
          break
        case CustomProtocolNames.InitialFixup:
          this.HandleInitialFixupRequest(id, <InitialFixupParams>paramsJson)
          break
        case TextDocumentNames.CodeAction:
          this.HandleCodeActionRequest(id, <CodeActionParams>paramsJson)
          break
        default:
          this._sendToClient(
            this.CreateErrorResult(id, ErrorCode.MethodNotFound)
          )
          break
      }
    } catch (error) {
      // console.log('----OnDataReceived error 正常拦截---:', error)
      this._sendToClient(this.CreateErrorResult(jsonPayload.id, error))
      return
    }
  }

  private HandleDidOpenNotification(
    paramsJson: DidOpenTextDocumentParams
  ): void {
    // Contracts.AssertValue(paramsJson);
    // if (!TryParseParams(paramsJson, out DidOpenTextDocumentParams didOpenParams)) {
    //   _sendToClient(this.CreateErrorResult(null, ErrorCode.ParseError));
    //   return;
    // }
    let didOpenParams = paramsJson //<DidOpenTextDocumentParams>paramsJson

    let documentUri = didOpenParams.textDocument.uri
    let scope = this._scopeFactory.GetOrCreateInstance(documentUri)

    let expression = didOpenParams.textDocument.text
    let result = scope.check(expression)

    this.PublishDiagnosticsNotification(documentUri, expression, result.errors)

    this.PublishTokens(documentUri, result)

    this.PublishExpressionType(documentUri, result)
  }

  private HandleDidChangeNotification(paramsJson: DidChangeTextDocumentParams) {
    // Contracts.AssertValue(paramsJson);

    // if (!TryParseParams(paramsJson, out DidChangeTextDocumentParams didChangeParams)) {
    //   _sendToClient(this.CreateErrorResult(null, ErrorCode.ParseError));
    //   return;
    // }

    let didChangeParams = paramsJson // <DidChangeTextDocumentParams>paramsJson

    if (didChangeParams.contentChanges.length != 1) {
      this._sendToClient(this.CreateErrorResult(null, ErrorCode.InvalidParams))
      return
    }

    // OnDidChange?.Invoke(didChangeParams);

    let documentUri = didChangeParams.textDocument.uri
    let scope = this._scopeFactory.GetOrCreateInstance(documentUri)

    let expression = didChangeParams.contentChanges[0].text
    let result = scope.check(expression)

    this.PublishDiagnosticsNotification(documentUri, expression, result.errors)

    this.PublishTokens(documentUri, result)

    this.PublishExpressionType(documentUri, result)
  }

  private HandleCompletionRequest(id: string, paramsJson: CompletionParams) {
    if (id == null) {
      this._sendToClient(this.CreateErrorResult(id, ErrorCode.InvalidRequest))
      return
    }

    // Contracts.AssertValue(id);
    // Contracts.AssertValue(paramsJson);

    // if (!TryParseParams(paramsJson, out CompletionParams completionParams)) {
    //   this._sendToClient(this.CreateErrorResult(id, ErrorCode.ParseError));
    //   return;
    // }
    let completionParams = paramsJson // <CompletionParams>paramsJson

    let documentUri = completionParams.textDocument.uri
    let scope = this._scopeFactory.GetOrCreateInstance(documentUri)
    let expression = documentUri.expression //  HttpUtility.ParseQueryString(uri.Query).Get("expression");
    if (expression == null) {
      this._sendToClient(this.CreateErrorResult(id, ErrorCode.InvalidParams))
      return
    }

    let cursorPosition = this.GetPosition(
      expression,
      completionParams.position.line,
      completionParams.position.character
    )

    let result = scope.Suggest(expression, cursorPosition)
    // console.log(result)
    let items: CompletionItem[] = [] // = new List<CompletionItem>();

    for (let item of result.Suggestions) {
      items.push(<CompletionItem>{
        label: item.DisplayText.text,
        detail: item.FunctionParameterDescription,
        documentation: item.Definition,
        kind: this.GetCompletionItemKind(item.Kind),
      })
    }

    this._sendToClient(
      this.CreateSuccessResult(id, {
        items,
        isIncomplete: false,
      })
    )
  }

  private HandleSignatureHelpRequest(
    id: string,
    paramsJson: SignatureHelpParams
  ) {
    if (id == null) {
      this._sendToClient(this.CreateErrorResult(id, ErrorCode.InvalidRequest))
      return
    }

    // Contracts.AssertValue(id);
    // Contracts.AssertValue(paramsJson);

    // if (!TryParseParams(paramsJson, out SignatureHelpParams signatureHelpParams)) {
    //   _sendToClient(this.CreateErrorResult(id, ErrorCode.ParseError));
    //   return;
    // }

    let signatureHelpParams = paramsJson // <SignatureHelpParams>paramsJson

    let documentUri = signatureHelpParams.textDocument.uri
    let scope = this._scopeFactory.GetOrCreateInstance(documentUri)

    // let uri = new Uri(documentUri);
    let expression = documentUri.expression //  HttpUtility.ParseQueryString(uri.Query).Get("expression");
    if (expression == null) {
      this._sendToClient(this.CreateErrorResult(id, ErrorCode.InvalidParams))
      return
    }

    let cursorPosition = this.GetPosition(
      expression,
      signatureHelpParams.position.line,
      signatureHelpParams.position.character
    )
    let result = scope.Suggest(expression, cursorPosition)

    this._sendToClient(this.CreateSuccessResult(id, result.SignatureHelp))
  }

  private HandleInitialFixupRequest(
    id: string,
    paramsJson: InitialFixupParams
  ) {
    if (id == null) {
      this._sendToClient(this.CreateErrorResult(id, ErrorCode.InvalidRequest))
      return
    }

    // Contracts.AssertValue(id);
    // Contracts.AssertValue(paramsJson);

    // if (!TryParseParams(paramsJson, out InitialFixupParams initialFixupParams)) {
    //   this._sendToClient(this.CreateErrorResult(id, ErrorCode.ParseError));
    //   return;
    // }

    let initialFixupParams = paramsJson // <InitialFixupParams>paramsJson

    let documentUri = initialFixupParams.textDocument.uri
    let scope = this._scopeFactory.GetOrCreateInstance(documentUri)

    let expression = initialFixupParams.textDocument.text
    let scopeDisplayName = scope as unknown as IPowerFxScopeDisplayName
    if (scopeDisplayName != null) {
      expression = scopeDisplayName.TranslateToDisplayName(expression)
    }

    this._sendToClient(
      this.CreateSuccessResult(id, {
        Uri: documentUri,
        Text: expression,
      })
    )
  }

  private HandleCodeActionRequest(id: string, paramsJson: CodeActionParams) {
    if (id == null) {
      this._sendToClient(this.CreateErrorResult(id, ErrorCode.InvalidRequest))
      return
    }

    // Contracts.AssertValue(id);
    // Contracts.AssertValue(paramsJson);

    // if (!TryParseParams(paramsJson, out CodeActionParams codeActionParams)) {
    //   this._sendToClient(this.CreateErrorResult(id, ErrorCode.ParseError));
    //   return;
    // }

    let codeActionParams = paramsJson // <CodeActionParams>paramsJson
    let documentUri = codeActionParams.textDocument.uri

    // let uri = new Uri(documentUri);
    let expression = documentUri.expression // HttpUtility.ParseQueryString(uri.Query).Get("expression");
    if (expression == null) {
      this._sendToClient(this.CreateErrorResult(id, ErrorCode.InvalidParams))
      return
    }

    let codeActions = new Dictionary<string, CodeAction[]>()
    for (let codeActionKind of codeActionParams.context.only) {
      switch (codeActionKind) {
        case CodeActionKind.QuickFix:
          let scope = this._scopeFactory.GetOrCreateInstance(documentUri)
          let scopeQuickFix = scope as unknown as IPowerFxScopeQuickFix

          if (scopeQuickFix != null) {
            let result = scopeQuickFix.Suggest(expression)

            let items: CodeAction[] = [] // = new List<CodeAction>();

            for (let item of result) {
              let range = item.Range ?? codeActionParams.range
              let changesDic: Dictionary<string, TextEdit[]> = new Dictionary<
                string,
                TextEdit[]
              >()
              changesDic.addByKeyValue(JSON.stringify(documentUri), [
                <TextEdit>{ Range: range, NewText: item.Text },
              ])
              // new Dictionary < string, TextEdit[]> { { documentUri, new[] { new TextEdit { Range = range, NewText = item.Text } }
              let edit: WorkspaceEdit = {
                Changes: changesDic,
              }
              items.push(<CodeAction>{
                Title: item.Title,
                Kind: codeActionKind,
                Edit: edit,
              })
            }

            codeActions.addByKeyValue(codeActionKind, items) //.ToArray());
          }
          break
        default:
          // No action.
          return
      }
    }

    this._sendToClient(this.CreateSuccessResult(id, codeActions))
  }

  private GetCompletionItemKind(kind: SuggestionKind): CompletionItemKind {
    switch (kind) {
      case SuggestionKind.Function:
        return CompletionItemKind.Method
      case SuggestionKind.KeyWord:
        return CompletionItemKind.Keyword
      case SuggestionKind.Global:
        return CompletionItemKind.Variable
      case SuggestionKind.Field:
        return CompletionItemKind.Field
      case SuggestionKind.Alias:
        return CompletionItemKind.Variable
      case SuggestionKind.Enum:
        return CompletionItemKind.Enum
      case SuggestionKind.BinaryOperator:
        return CompletionItemKind.Operator
      case SuggestionKind.Local:
        return CompletionItemKind.Variable
      case SuggestionKind.ServiceFunctionOption:
        return CompletionItemKind.Method
      case SuggestionKind.Service:
        return CompletionItemKind.Module
      case SuggestionKind.ScopeVariable:
        return CompletionItemKind.Variable
      default:
        return CompletionItemKind.Text
    }
  }

  /// <summary>
  /// PowerFx classifies diagnostics by <see cref="DocumentErrorSeverity"/>, LSP classifies them by
  /// <see cref="DiagnosticSeverity"/>. This method maps the former to the latter.
  /// </summary>
  /// <param name="severity">
  /// <see cref="DocumentErrorSeverity"/> which will be mapped to the LSP eequivalent.
  /// </param>
  /// <returns>
  /// <see cref="DiagnosticSeverity"/> equivalent to <see cref="DocumentErrorSeverity"/>
  /// </returns>
  private DocumentSeverityToDiagnosticSeverityMap(
    severity: DocumentErrorSeverity
  ): DiagnosticSeverity {
    switch (severity) {
      case DocumentErrorSeverity.Critical:
        return DiagnosticSeverity.Error
      case DocumentErrorSeverity.Severe:
        return DiagnosticSeverity.Error
      case DocumentErrorSeverity.Moderate:
        return DiagnosticSeverity.Error
      case DocumentErrorSeverity.Warning:
        return DiagnosticSeverity.Warning
      case DocumentErrorSeverity.Suggestion:
        return DiagnosticSeverity.Hint
      case DocumentErrorSeverity.Verbose:
        return DiagnosticSeverity.Information
      default:
        return DiagnosticSeverity.Information
    }
  }

  private PublishDiagnosticsNotification(
    uri: TextDocumentUri,
    expression: string,
    errors: ExpressionError[]
  ): void {
    // Contracts.AssertNonEmpty(uri);
    // Contracts.AssertValue(expression);

    let diagnostics: Diagnostic[] = [] // = new List<Diagnostic>();
    if (errors != null) {
      for (let item of errors) {
        let span = item.span
        let startCode = expression.substr(0, span.min)
        let code = expression.substr(span.min, span.lim - span.min)
        let startLine = startCode.split(this.EOL).length
        let startChar = this.GetCharPosition(expression, span.min)
        let endLine = startLine + code.split(this.EOL).length - 1
        let endChar = this.GetCharPosition(expression, span.lim) - 1
        let protoRange: range = {
          start: <Position>{
            character: startChar,
            line: startLine,
          },
          end: <Position>{
            character: endChar,
            line: endLine,
          },
        }
        let diagnostic: Diagnostic = {
          range: protoRange,
          message: item.message,
          severity: null,
        }
        diagnostics.push(diagnostic)
        //     diagnostics.push(
        //       new Diagnostic()
        //       {
        //         Range = new Protocol.Range()
        //                 {
        //                       Start = new Position()
        //                                       {
        //                       Character = startChar,
        //                       Line = startLine
        //                     },
        //                     End = new Position()
        //                                       {
        //                       Character = endChar,
        //                       Line = endLine
        //                     }
        //                 },
        //         Message = item.Message
        // }
        // );
      }
    }

    // Send PublishDiagnostics notification
    this._sendToClient(
      this.CreateNotification(TextDocumentNames.PublishDiagnostics, <
        PublishDiagnosticsParams
      >(<unknown>{
        uri: uri,
        diagnostics: diagnostics,
      }))
    )
  }

  private PublishTokens(
    documentUri: TextDocumentUri,
    result: CheckResult
  ): void {
    // let uri = new Uri(documentUri);
    // let nameValueCollection = HttpUtility.ParseQueryString(uri.Query);
    // if (!uint.TryParse(nameValueCollection.Get("getTokensFlags"), out uint flags)) {
    //   return;
    // }
    if (documentUri.getTokensFlags == undefined) return
    let flags = documentUri.getTokensFlags

    let tokens = result.getTokens(<GetTokensFlags>flags)
    if (tokens == null || Object.keys(tokens).length == 0) {
      return
    }

    // Send PublishTokens notification
    this._sendToClient(
      this.CreateNotification(CustomProtocolNames.PublishTokens, <
        PublishTokensParams
      >(<unknown>{
        uri: documentUri,
        tokens: tokens,
      }))
    )
  }

  private PublishExpressionType(
    documentUri: TextDocumentUri,
    result: CheckResult
  ) {
    // let uri = new Uri(documentUri);
    // let nameValueCollection = HttpUtility.ParseQueryString(uri.Query);
    // if (!boolean.TryParse(nameValueCollection.Get("getExpressionType"), out let enabled) || !enabled)
    // {
    //   return;
    // }
    if (documentUri.getExpressionType == undefined) return
    let flags = documentUri.getExpressionType
    if (!flags) {
      return
    }

    this._sendToClient(
      this.CreateNotification(CustomProtocolNames.PublishExpressionType, <
        PublishExpressionTypeParams
      >(<unknown>{
        uri: documentUri,
        type: result.returnType,
      }))
    )
  }

  //   private TryParseParams<T>(json: string): [boolean, T] {
  //     // Contracts.AssertNonEmpty(json);
  //     let result: T
  //     try {
  //       result = JsonSerializer.Deserialize<T>(json, _jsonSerializerOptions);
  //       return true;
  //     }
  //     catch
  //     {
  //       result = default;
  //     return false;
  //   }
  // }

  /// <summary>
  /// Get the charactor position (starts with 1) from its line.
  /// e.g. "123\n1{2}3" ==> 2 ({x} is the input char at position)
  ///      "12{\n}123" ==> 3 ('\n' belongs to the previous line "12\n", the last char is '2' with index of 3)
  /// </summary>
  /// <param name="expression">The expression content</param>
  /// <param name="position">The charactor position (starts with 0)</param>
  /// <returns>The charactor position (starts with 1) from its line</returns>
  protected GetCharPosition(expression: string, position: number): number {
    // Contracts.AssertValue(expression);
    // Contracts.Assert(position >= 0);

    let column: number =
      position < expression.length && expression[position] == this.EOL ? 0 : 1
    position--
    while (position >= 0 && expression[position] != this.EOL) {
      column++
      position--
    }

    return column
  }

  /// <summary>
  /// Get the position offset (starts with 0) in Expression from line/character (starts with 0)
  /// e.g. "123", line:0, char:1 => 1
  /// </summary>
  protected GetPosition(
    expression: string,
    line: number,
    character: number
  ): number {
    // Contracts.AssertValue(expression);
    // Contracts.Assert(line >= 0);
    // Contracts.Assert(character >= 0);

    let position: number = 0
    let currentLine: number = 0
    let currentCharacter: number = 0
    while (position < expression.length) {
      if (line == currentLine && character == currentCharacter) {
        return position
      }

      if (expression[position] == this.EOL) {
        currentLine++
        currentCharacter = 0
      } else {
        currentCharacter++
      }

      position++
    }

    return position
  }

  private CreateErrorResult(id: string, error: any) {
    return JSON.stringify({
      // jsonrpc = "2.0",
      id,
      error,
    })
  }

  private CreateSuccessResult(id: string, result: any) {
    return JSON.stringify({
      // jsonrpc = "2.0",
      id,
      result,
    })
  }

  private CreateNotification(
    method: string,
    params:
      | PublishDiagnosticsParams
      | PublishTokensParams
      | PublishExpressionTypeParams
  ) {
    return JSON.stringify({
      // jsonrpc = "2.0",
      method,
      params,
    })
  }
}
