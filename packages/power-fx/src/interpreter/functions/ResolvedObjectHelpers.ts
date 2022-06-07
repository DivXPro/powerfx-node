// Core operations for turning ResolvedObjects into PowerFx values
import { RecalcFormulaInfo } from '../RecalcFormulaInfo';
import {
  ErrorKind,
  ErrorValue,
  ExpressionError,
  FormulaValue,
  FormulaValueStatic,
  NamedValue,
} from '../../public';
import { OptionSet } from '../environment/OptionSet';
import { IRContext } from '../../ir';
import { CommonErrors } from './CommonErrors';
import { ResolvedObjectNode } from '../../ir/node';

export class ResolvedObjectHelpers {
  public static RecalcFormulaInfo(fi: RecalcFormulaInfo): FormulaValue {
    return fi.value;
  }

  public static OptionSet(optionSet: OptionSet, irContext: IRContext): FormulaValue {
    const options: NamedValue[] = [];
    for (const option of optionSet.options) {
      const result = optionSet.tryGetValue(option[0]);
      const osValue = result[1];
      if (!result[0]) {
        // This is iterating the Options in the option set
        // so we already know TryGetValue will succeed, making this unreachable.
        return CommonErrors.UnreachableCodeError(irContext);
      }

      options.push(new NamedValue(option[0].value, osValue));
    }

    // When evaluating an option set ResolvedObjectNode, we convert the options into a record
    // This allows the use of the FieldAccess operator to get specific option values.
    return FormulaValueStatic.RecordFromFields(options);
  }

  public static ResolvedObjectError(node: ResolvedObjectNode): FormulaValue {
    return new ErrorValue(
      node.IRContext,
      new ExpressionError(
        `Unrecognized symbol ${node?.Value}`,
        node.IRContext.sourceContext,
        ErrorKind.Validation
      )
    );
  }
}
