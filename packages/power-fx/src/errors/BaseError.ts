import {
  ErrorResource,
  ErrorResourceKey,
  Span,
  StringResources,
  TexlStrings,
} from '../localization'
import { StringBuilder } from '../utils/StringBuilder'
import { DocumentErrorKind } from './DocumentErrorKind'
import { DocumentErrorSeverity } from './DocumentErrorSeverity'
import { ErrorHelpLink } from './ErrorHelpLink'
import { IDocumentError } from './IDocumentError'

export abstract class BaseError {
  private static readonly HowToFixSuffix = '_HowToFix'

  innerError: IDocumentError
  errorKind: DocumentErrorKind
  shortMessage: string
  longMessage: string
  messageKey: string
  errorResourceKey: ErrorResourceKey
  messageArgs: any[]
  howToFixMessages: string[]
  whyToFixMessage: string
  links: ErrorHelpLink[]
  entity: string
  entityId: string
  parent: string
  propertyName: string
  textSpan: Span
  private _sinkTypeErrors?: string[]
  public get sinkTypeErrors(): string[] {
    return this._sinkTypeErrors
  }
  public set sinkTypeErrors(value: string[]) {
    this._sinkTypeErrors = value
  }
  severity: DocumentErrorSeverity
  internalException: Error

  constructor(
    innerError: IDocumentError | undefined,
    internalException: Error | undefined,
    kind: DocumentErrorKind,
    severity: DocumentErrorSeverity,
    errKey: ErrorResourceKey,
    textSpan?: Span,
    sinkTypeErrors?: string[],
    ...args: any[]
  ) {
    // Contracts.AssertValueOrNull(innerError)
    // Contracts.AssertValueOrNull(args)
    // Contracts.AssertValueOrNull(internalException)
    // Contracts.AssertValueOrNull(textSpan)
    // Contracts.AssertValueOrNull(sinkTypeErrors)

    this.innerError = innerError
    this.internalException = internalException
    this.errorKind = kind
    this.severity = severity
    this.errorResourceKey = errKey
    this._sinkTypeErrors = sinkTypeErrors
    this.messageArgs = args
    this.entity = ''
    this.parent = ''
    this.propertyName = ''
    this.messageKey = errKey.key
    this.textSpan = textSpan

    // We expect errKey to be the key for an error resource object within string resources.
    // We fall back to using a basic content string within string resources, for errors
    // that haven't yet been converted to an ErrorResource in the Resources.pares file.
    let shortMessage: string
    let longMessage: string
    const result = StringResources.TryGetErrorResource(errKey)
    let errorResource = result[1]
    if (!result[0]) {
      errorResource = null
      shortMessage = StringResources.Get(errKey.key)
      longMessage = null
    } else {
      shortMessage = errorResource.getSingleValue(ErrorResource.ShortMessageTag)
      // Contracts.AssertValue(shortMessage)
      longMessage = errorResource.getSingleValue(ErrorResource.LongMessageTag)
    }

    this.shortMessage = this.formatMessage(shortMessage, ...args)
    this.longMessage = this.formatMessage(longMessage, ...args)
    this.howToFixMessages =
      errorResource?.getValues(ErrorResource.HowToFixTag) ??
      BaseError.GetHowToFix(errKey.key)
    this.whyToFixMessage =
      errorResource?.getSingleValue(ErrorResource.WhyToFixTag) ?? ''
    this.links = errorResource?.helpLinks
  }

  private formatMessage(message: string, ...args: any[]): string {
    if (message == null) {
      return null
    }

    const sb = new StringBuilder()
    if (args != null && args.length > 0) {
      try {
        sb.appendFormat(message, ...args)
      } catch (FormatException) {
        // Just in case we let a poorly escaped format string (eg a column name with {}s in it) get this far
        // we will degrade the quality of the error report, but keep running at least
        sb.append(message)
      }
    } else {
      sb.append(message)
    }

    return sb.toString()
  }

  /// <summary>
  /// Retrieves the "HowToFix" messages for a particular message key. These messages should either
  /// be named with the suffix "_HowToFix" or "_HowToFix1, _HowToFix2..." if multiple exist.
  ///
  /// NOTE: Usage of this pattern is deprecated. New errors should use the StringResources.ErrorResouce
  /// format to specify HowToFix messages.
  /// </summary>
  /// <param name="messageKey">Key for the error message.</param>
  /// <returns>List of how to fix messages. Null if none exist.</returns>
  static GetHowToFix(messageKey: string, locale: string = null): Array<string> {
    // Contracts.AssertNonEmpty(messageKey);

    // Look for singular Message_HowToFix
    const howToFixSingularKey = messageKey + BaseError.HowToFixSuffix
    const result = StringResources.TryGet(howToFixSingularKey, locale)
    const howToFixSingularMessage = result[1]
    if (result[0]) {
      return [howToFixSingularMessage]
    }

    // Look for multiple how to fix messages: Message_HowToFix1, Message_HowToFix2...
    const messages: Array<string> = []
    let howToFixMessage: string
    for (
      let messageIndex = 1;
      (howToFixMessage = StringResources.TryGet(
        howToFixSingularKey + messageIndex,
        locale
      )[1]);
      messageIndex++
    ) {
      messages.push(howToFixMessage)
    }

    return messages.length == 0 ? null : messages
  }

  private format(sb: StringBuilder) {
    // #if DEBUG
    //       let lenStart = sb.Length;
    // #endif
    this.formatCore(sb)
    // #if DEBUG
    //       Contracts.Assert(sb.Length > lenStart);
    // #endif
    this.formatInnerError(sb)
  }

  protected formatCore(sb: StringBuilder) {
    // Contracts.AssertValue(sb);

    sb.append(TexlStrings.InfoMessage().toString())
    sb.append(this.shortMessage)
  }

  private formatInnerError(sb: StringBuilder) {
    // Contracts.AssertValue(sb);

    if (this.innerError == null) {
      return
    }

    sb.appendLine()
    const innerError = this.innerError as BaseError
    // Contracts.AssertValue(innerError);
    innerError?.format(sb)
  }

  public toString(): string {
    const sb = new StringBuilder()
    this.format(sb)
    return sb.toString()
  }
}
