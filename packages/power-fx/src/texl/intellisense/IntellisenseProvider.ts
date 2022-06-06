import { EnumStore } from '../../types/enums'
import { IIntellisense } from './IIntellisense'
import { Intellisense } from './Intellisense'
import { BinaryOpNodeSuggestionHandler } from './SuggestionHandlers/BinaryOpNodeSuggestionHandler'
import { BlankNodeSuggestionHandler } from './SuggestionHandlers/BlankNodeSuggestionHandler'
import { BoolLitNodeSuggestionHandler } from './SuggestionHandlers/BoolLitNodeSuggestionHandler'
import { CallNodeSuggestionHandler } from './SuggestionHandlers/CallNodeSuggestionHandler'
import { CommentNodeSuggestionHandler } from './SuggestionHandlers/CommentNodeSuggestionHandler'
import { DottedNameNodeSuggestionHandler } from './SuggestionHandlers/DottedNameNodeSuggestionHandler'
import { ErrorNodeSuggestionHandler } from './SuggestionHandlers/ErrorNodeSuggestionHandler'
import { FirstNameNodeSuggestionHandler } from './SuggestionHandlers/FirstNameNodeSuggestionHandler'
import { FunctionRecordNameSuggestionHandler } from './SuggestionHandlers/FunctionRecordNameSuggestionHandler'
import { ISuggestionHandler } from './SuggestionHandlers/ISuggestionHandler'
import { NullNodeSuggestionHandler } from './SuggestionHandlers/NullNodeSuggestionHandler'
import { RecordNodeSuggestionHandler } from './SuggestionHandlers/RecordNodeSuggestionHandler'
import { StrNumLitNodeSuggestionHandler } from './SuggestionHandlers/StrNumLitNodeSuggestionHandler'
import { UnaryOpNodeSuggestionHandler } from './SuggestionHandlers/UnaryOpNodeSuggestionHandler'

export class IntellisenseProvider {
  //TODO 是否需要按分布类放在Intellisense下访问？
  public static readonly suggestionHandlers: ISuggestionHandler[] = [
    // new Intellisense.CommentNodeSuggestionHandler(),
    // new Intellisense.NullNodeSuggestionHandler(),
    // new Intellisense.FunctionRecordNameSuggestionHandler(),
    // new Intellisense.ErrorNodeSuggestionHandler(),
    // new Intellisense.BlankNodeSuggestionHandler(),
    // new Intellisense.DottedNameNodeSuggestionHandler(),
    // new Intellisense.FirstNameNodeSuggestionHandler(),
    // new Intellisense.CallNodeSuggestionHandler(),
    // new Intellisense.BinaryOpNodeSuggestionHandler(),
    // new Intellisense.UnaryOpNodeSuggestionHandler(),
    // new Intellisense.BoolLitNodeSuggestionHandler(),
    // new Intellisense.StrNumLitNodeSuggestionHandler(),
    // new Intellisense.RecordNodeSuggestionHandler(),

    new CommentNodeSuggestionHandler(),
    new NullNodeSuggestionHandler(),
    new FunctionRecordNameSuggestionHandler(),
    new ErrorNodeSuggestionHandler(),
    new BlankNodeSuggestionHandler(),
    new DottedNameNodeSuggestionHandler(),
    new FirstNameNodeSuggestionHandler(),
    new CallNodeSuggestionHandler(),
    new BinaryOpNodeSuggestionHandler(),
    new UnaryOpNodeSuggestionHandler(),
    new BoolLitNodeSuggestionHandler(),
    new StrNumLitNodeSuggestionHandler(),
    new RecordNodeSuggestionHandler(),
  ]

  public static GetIntellisense(enumStore: EnumStore): IIntellisense {
    return new Intellisense(enumStore, IntellisenseProvider.suggestionHandlers)
  }
}
