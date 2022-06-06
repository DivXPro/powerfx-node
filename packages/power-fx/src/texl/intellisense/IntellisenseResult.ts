import { TexlFunction } from '../../functions/TexlFunction'
import { LocalizationUtils, TexlLexer } from '../../lexer'
import Exception from '../../utils/typescriptNet/Exception'
import { StringBuilder } from '../../utils/typescriptNet/Text/StringBuilder'
import { IIntellisenseResult } from './IIntellisenseResult'
import { IIntellisenseSuggestion } from './IIntellisenseSuggestion'
import { IIntellisenseData } from './IntellisenseData/IIntellisenseData'
import { IntellisenseSuggestion } from './IntellisenseSuggestion'
import { ParameterInformation } from './SignatureHelp/ParameterInformation'
import { SignatureHelp } from './SignatureHelp/SignatureHelp'
import { SignatureInformation } from './SignatureHelp/SignatureInformation'
import { SuggestionIconKind } from './SuggestionIconKind'
import { SuggestionKind } from './SuggestionKind'
import { UIString } from './UIString'

export class IntellisenseResult implements IIntellisenseResult {
  /// <summary>
  /// List of suggestions associated with the result
  /// </summary>
  protected readonly _suggestions: IntellisenseSuggestion[]

  /// <summary>
  /// The script to which the result pertains
  /// </summary>
  protected readonly _script: string

  /// <summary>
  /// List of candidate signatures for the Intellisense, compliant with Language Server Protocol
  /// <see cref="SignatureHelp"/>
  /// </summary>
  private readonly _functionSignatures: SignatureInformation[]

  /// <summary>
  /// List of candidate signatures for the Intellisense, compliant with Document Server intellisense
  /// </summary>
  protected readonly _functionOverloads: IntellisenseSuggestion[]

  /// <summary>
  /// The index of the current argument.  0 if there are no arguments associated with the result, either
  /// because the function is parameterless or because intellisense was not called from within a valid
  /// function signature.
  /// </summary>
  private readonly _currentArgumentIndex: number

  constructor(data: IIntellisenseData, suggestions: IntellisenseSuggestion[], exception: Exception = null) {
    // Contracts.AssertValue(suggestions);

    this._script = data.Script
    // Contracts.CheckValue(_script, "script");
    this.ReplacementStartIndex = data.ReplacementStartIndex
    // Contracts.CheckParam(0 <= data.ReplacementStartIndex, "replacementStartIndex");

    this.ReplacementLength = data.ReplacementLength
    // Contracts.CheckParam(0 <= data.ReplacementLength, "replacementLength");

    let argIndex = data.ArgIndex
    let argCount = data.ArgCount
    // Contracts.CheckParam(0 <= argIndex, "argIndex");
    // Contracts.CheckParam(0 <= argCount, "argCount");
    // Contracts.Check(argIndex <= argCount, "argIndex out of bounds.");

    let func = data.CurFunc
    // Contracts.CheckValueOrNull(func);

    this._suggestions = suggestions
    this._functionSignatures = [] // new List<SignatureInformation>();
    this._functionOverloads = [] // new List<IntellisenseSuggestion>();

    this.CurrentFunctionOverloadIndex = -1
    this._currentArgumentIndex = argIndex
    exception = exception

    if (func == null) {
      this.IsFunctionScope = false
    } else {
      this.IsFunctionScope = true
      let highlightStart: number = -1
      let highlightEnd: number = -1
      let minMatchingArgCount: number = Number.MAX_VALUE
      for (let signature of func.getSignaturesAtArity(argCount)) {
        let signatureIndex: number = 0
        let argumentSeparator: string = ''
        let highlightedFuncParamDescription: string = ''
        let listSep: string = TexlLexer.LocalizedInstance.localizedPunctuatorListSeparator + ' '
        let funcDisplayString: StringBuilder = new StringBuilder(func.name)
        funcDisplayString.append('(')

        let parameters: ParameterInformation[] = [] // new List<ParameterInformation>();
        while (signatureIndex < signature.length) {
          // Contracts.AssertValue(signature[signatureIndex]);
          funcDisplayString.append(argumentSeparator)

          // We need to change the highlight information if the argument should be highlighted, but
          // otherwise we still want to collect parameter information
          let unalteredParamName = signature[signatureIndex]()
          let invariantParamName = signature[signatureIndex]('en-US')

          let {
            paramName: paramName,
            highlightStart: parameterHighlightStart,
            highlightEnd: parameterHighlightEnd,
            funcParamDescription: funcParamDescription,
          } = IntellisenseResult.GetParameterHighlightAndDescription(
            data,
            unalteredParamName,
            invariantParamName,
            funcDisplayString,
          )

          parameters.push({
            Documentation: funcParamDescription,
            Label: paramName,
          })

          if (this.ArgNeedsHighlight(func, argCount, argIndex, signature.length, signatureIndex)) {
            highlightStart = parameterHighlightStart
            highlightEnd = parameterHighlightEnd
            highlightedFuncParamDescription = funcParamDescription
            // (highlightStart, highlightEnd, highlightedFuncParamDescription)
            //   = (parameterHighlightStart, parameterHighlightEnd, funcParamDescription);
          }

          // For variadic function, we want to generate FuncName(arg1,arg1,...,arg1,...) as description.
          if (
            func.signatureConstraint != null &&
            argCount > func.signatureConstraint.repeatTopLength &&
            this.canParamOmit(func, argCount, argIndex, signature.length, signatureIndex)
          ) {
            funcDisplayString.append('...')
            signatureIndex += func.signatureConstraint.repeatSpan
          } else {
            funcDisplayString.append(signature[signatureIndex]())
            signatureIndex++
          }
          argumentSeparator = listSep
        }

        if (func.maxArity > func.minArity && func.maxArity > argCount)
          funcDisplayString.append(argumentSeparator + '...')

        funcDisplayString.append(')')
        let signatureInformation = new SignatureInformation()
        signatureInformation.Documentation = func.description
        signatureInformation.Label = this.CreateFunctionSignature(func.name, parameters)
        signatureInformation.Parameters = parameters
        // {
        //   Documentation = func.description,
        //   Label = this.CreateFunctionSignature(func.name, parameters),
        //   Parameters = parameters;//.ToArray()
        // };
        this._functionSignatures.push(signatureInformation)
        this._functionOverloads.push(
          IntellisenseSuggestion.newInstance(
            new UIString(funcDisplayString.toString(), highlightStart, highlightEnd),
            SuggestionKind.Function,
            SuggestionIconKind.Function,
            func.returnType,
            signatureIndex,
            func.description,
            func.name,
            highlightedFuncParamDescription,
          ),
        )

        if (
          (signatureIndex >= argCount ||
            (func.signatureConstraint != null && argCount > func.signatureConstraint.repeatTopLength)) &&
          minMatchingArgCount > signatureIndex
        ) {
          // _functionOverloads has at least one item at this point.
          this.CurrentFunctionOverloadIndex = this._functionOverloads.length - 1
          minMatchingArgCount = signatureIndex
        }
      }

      // Handling of case where the function does not take any arguments.
      if (this._functionOverloads.length == 0 && func.minArity == 0) {
        // var signatureInformation = new SignatureInformation()
        // {
        //   Documentation = func.description,
        //     Label = this.CreateFunctionSignature(func.name),
        //     Parameters = new ParameterInformation[0]
        // };
        let signatureInformation = new SignatureInformation()
        signatureInformation.Documentation = func.description
        ;(signatureInformation.Label = this.CreateFunctionSignature(func.name)), (signatureInformation.Parameters = [])

        this._functionSignatures.push(signatureInformation)
        this._functionOverloads.push(
          new IntellisenseSuggestion(
            new UIString(func.name + '()', 0, func.name.length + 1),
            SuggestionKind.Function,
            SuggestionIconKind.Function,
            func.returnType,
            '',
            0,
            func.description,
            func.name,
          ),
        )
        this.CurrentFunctionOverloadIndex = 0
      }
    }

    // Contracts.Assert(_functionSignatures.Count == _functionOverloads.Count);
  }

  /// <summary>
  /// Derives signature help information for Language Server Protocol compliance from extant signature
  /// info.
  /// </summary>
  public get SignatureHelp(): SignatureHelp {
    let instance = new SignatureHelp()
    instance.Signatures = this._functionSignatures //.ToArray(),
    instance.ActiveSignature = this.CurrentFunctionOverloadIndex > 0 ? this.CurrentFunctionOverloadIndex : 0
    instance.ActiveParameter = this._currentArgumentIndex
    return instance
  }

  /// <summary>
  /// Returns a string that represents the full call signature as defined by <see cref="function"/>,
  /// <see cref="parameters"/>, as well as <see cref="LocalizationUtils.CurrentLocaleListSeparator"/>
  /// </summary>
  /// <param name="functionName"></param>
  /// <param name="parameters">
  ///     List of parameters in the relevant signature for <see cref="function"/>
  /// </param>
  /// <returns>
  /// A label that represents the call signature; e.g. <code>Set(variable, lambda)</code>
  /// </returns>
  private CreateFunctionSignature(functionName: string, parameters: ParameterInformation[] = null): string {
    // Contracts.AssertValue(functionName);
    // Contracts.AssertValue(functionName);

    let parameterString: string
    if (parameters != null) {
      parameterString = parameters
        .map((parameter) => parameter.Label)
        .join(`${LocalizationUtils.CurrentLocaleListSeparator}`)
    } else {
      parameterString = ''
    }

    return `${functionName}(${parameterString})`
  }

  /// <summary>
  /// Gets the parameter description and corresponding highlight information for the provided
  /// function and index.  Provides special augmentation behavior via handlers.
  /// </summary>
  /// <param name="data">
  /// Data off of which the result is based
  /// </param>
  /// <param name="paramName"></param>
  /// <param name="invariantParamName1></param>
  /// <param name="funcDisplayString"></param>
  /// <returns></returns>
  private static GetParameterHighlightAndDescription(
    data: IIntellisenseData,
    paramName: string,
    invariantParamName: string,
    funcDisplayString: StringBuilder,
  ): {
    paramName: string
    highlightStart: number
    highlightEnd: number
    funcParamDescription: string
  } {
    // Contracts.AssertValue(data);
    // Contracts.AssertValue(paramName);
    // Contracts.AssertValue(invariantParamName);
    // Contracts.AssertValue(funcDisplayString);

    let highlightStart: number
    let highlightEnd: number
    let funcParamDescription: string
    let func = data.CurFunc
    let argIndex = data.ArgIndex

    // Highlight has to start from the next character and end at the last character which is "length -1"
    highlightStart = funcDisplayString.toString().length
    highlightEnd = highlightStart + paramName.length - 1

    // By calling this we provide the caller the ability to augment the highlight and parameter
    // details amidst the iteration
    let TryAugmentSignatureRes = data.TryAugmentSignature(func, argIndex, paramName, highlightStart)
    if (TryAugmentSignatureRes[0]) {
      highlightStart = TryAugmentSignatureRes[1]
      highlightEnd = TryAugmentSignatureRes[2]
      paramName = TryAugmentSignatureRes[3]
      invariantParamName = TryAugmentSignatureRes[4]
      //  (highlightStart, highlightEnd, paramName, invariantParamName) = (newHighlightStart, newHighlightEnd, newParamName, newInvariantParamName);
    }

    // MUST use the invariant parameter name here
    let tryGetParamDescriptionRes = func.tryGetParamDescription(invariantParamName)
    funcParamDescription = tryGetParamDescriptionRes[1]
    // func.tryGetParamDescription(invariantParamName, out funcParamDescription);

    // Apply optional suffix provided via argument
    funcParamDescription = funcParamDescription + data.GenerateParameterDescriptionSuffix(func, paramName)
    return {
      paramName: paramName,
      highlightStart: highlightStart,
      highlightEnd: highlightEnd,
      funcParamDescription: funcParamDescription,
    }
    // return (paramName, highlightStart, highlightEnd, funcParamDescription);
  }

  // GroupBy(source, column_name, column_name, ..., column_name, ..., group_name, ...)
  // AddColumns(source, column, expression, column, expression, ..., column, expression, ...)
  public canParamOmit(
    func: TexlFunction,
    argCount: number,
    argIndex: number,
    signatureCount: number,
    signatureIndex: number,
  ): boolean {
    // Contracts.AssertValue(func);
    // Contracts.Assert(func.MaxArity == number.MaxValue);
    // Contracts.Assert(func.SignatureConstraint != null && argCount > func.SignatureConstraint.RepeatTopLength && signatureCount >= func.SignatureConstraint.RepeatTopLength);

    if (func.signatureConstraint == null) return false

    return func.signatureConstraint.canParamOmit(argCount, argIndex, signatureCount, signatureIndex)
  }

  // 1. For a function with limited MaxArity, The first time the count becomes equal to the argIndex, that's the arg we want to highlight
  // 2. For variadic function with repeating params in the signature, we highlight the param which indicates the corresponding position.
  public ArgNeedsHighlight(
    func: TexlFunction,
    argCount: number,
    argIndex: number,
    signatureCount: number,
    signatureIndex: number,
  ): boolean {
    // Contracts.AssertValue(func);

    if (
      func.signatureConstraint == null ||
      argCount <= func.signatureConstraint.repeatTopLength ||
      signatureIndex <= func.signatureConstraint.omitStartIndex
    )
      return signatureIndex == argIndex

    return func.signatureConstraint.argNeedsHighlight(argCount, argIndex, signatureCount, signatureIndex)
  }

  /// <summary>
  /// Returns the start index of the input string at which the suggestion has to be replaced upon selection of the suggestion.
  /// </summary>
  public ReplacementStartIndex: number //  { get; protected set; }

  /// <summary>
  /// Returns the length of text to be replaced with the current suggestion.
  /// </summary>
  public ReplacementLength: number // { get; protected set; }

  /// <summary>
  /// A boolean value indicating whether the cursor is in function scope or not.
  /// </summary>
  public IsFunctionScope: boolean //{ get; protected set; }

  /// <summary>
  /// Index of the overload in 'FunctionOverloads' to be displayed in the UI.
  /// This is equal to -1 when IsFunctionScope = False.
  /// </summary>
  public CurrentFunctionOverloadIndex: number //  { get; protected set; }

  public exception: Exception //  { get; protected set; }

  /// <summary>
  /// Enumerates suggestions for the current position in some specified input.
  /// </summary>
  public get Suggestions(): IIntellisenseSuggestion[] {
    let arr = []
    for (let i = 0; i < this._suggestions.length; i++) {
      arr.push(this._suggestions[i])
    }
    return arr
  }

  /// <summary>
  /// Enumerates function overloads for the function to be displayed.
  /// This is empty when IsFunctionScope = False.
  /// </summary>
  public get FunctionOverloads(): IIntellisenseSuggestion[] {
    let arr = []
    for (let i = 0; i < this._functionOverloads.length; i++) {
      arr.push(this._functionOverloads[i])
    }
    return arr
  }
}
