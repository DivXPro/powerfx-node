import { IErrorContainer } from '../../app/errorContainers';
import { TexlBinding } from '../../binding';
import { DocumentErrorSeverity } from '../../errors/DocumentErrorSeverity';
import { BuiltinFunction } from '../../functions/BuiltinFunction';
import { StringGetter, TexlStrings } from '../../localization';
import { TexlNode } from '../../syntax';
import { DKind } from '../../types/DKind';
import { DType } from '../../types/DType';
import { FunctionCategories } from '../../types/FunctionCategories';
import { CollectionUtils } from '../../utils/CollectionUtils';
import { Dictionary } from '../../utils/Dictionary';

export class CoalesceFunction extends BuiltinFunction {
  public get isSelfContained() {
    return true;
  }

  public get supportsParamCoercion() {
    return true;
  }

  constructor() {
    super(
      undefined,
      'Coalesce',
      undefined,
      TexlStrings.AboutCoalesce,
      FunctionCategories.Information,
      DType.Unknown,
      0,
      1,
      Number.MAX_VALUE
    );
  }

  public getSignatures(): Array<StringGetter[]> {
    return [
      [TexlStrings.CoalesceArg1],
      [TexlStrings.CoalesceArg1, TexlStrings.CoalesceArg1],
      [TexlStrings.CoalesceArg1, TexlStrings.CoalesceArg1, TexlStrings.CoalesceArg1],
    ];
  }

  public getSignaturesAtArity(arity: number): Array<StringGetter[]> {
    if (arity > 2) {
      return super.getGenericSignatures(arity, TexlStrings.CoalesceArg1);
    }

    return super.getSignaturesAtArity(arity);
  }

  public checkInvocation(
    args: TexlNode[],
    argTypes: DType[],
    errors: IErrorContainer,
    binding: TexlBinding
  ): [boolean, { returnType: DType; nodeToCoercedTypeMap: Dictionary<TexlNode, DType> }] {
    {
      // Contracts.AssertValue(args);
      // Contracts.AssertValue(argTypes);
      // Contracts.Assert(args.Length == argTypes.Length);
      // Contracts.Assert(args.Length >= 1);
      // Contracts.AssertValue(errors);

      let nodeToCoercedTypeMap: Dictionary<TexlNode, DType> = null;

      let count = args.length;
      let fArgsValid = true;
      let fArgsNonNull = false;
      let returnType = this.returnType;
      let type: DType = returnType;

      for (let i = 0; i < count; i++) {
        let nodeArg = args[i];
        let typeArg = argTypes[i];

        if (typeArg.kind == DKind.ObjNull) {
          continue;
        }

        fArgsNonNull = true;
        if (typeArg.isError) {
          errors.ensureError(args[i], TexlStrings.ErrTypeError);
        }

        let typeSuper = DType.Supertype(type, typeArg);

        if (!typeSuper.isError) {
          type = typeSuper;
        } else if (type.kind == DKind.Unknown) {
          // One of the args is also of unknown type, so we can't resolve the type of IfError
          type = typeSuper;
          fArgsValid = false;
        } else if (!type.isError) {
          // Types don't resolve normally, coercion needed
          if (typeArg.coercesTo(type)) {
            nodeToCoercedTypeMap = CollectionUtils.AddDictionary(
              nodeToCoercedTypeMap,
              nodeArg,
              type
            );
          } else {
            errors.ensureErrorWithSeverity(
              DocumentErrorSeverity.Severe,
              nodeArg,
              TexlStrings.ErrBadType_ExpectedType_ProvidedType,
              type.getKindString(),
              typeArg.getKindString()
            );
            fArgsValid = false;
          }
        } else if (typeArg.kind != DKind.Unknown) {
          type = typeArg;
          fArgsValid = false;
        }
      }

      if (!fArgsNonNull) {
        type = DType.ObjNull;
      }

      returnType = type;
      return [fArgsValid, { returnType, nodeToCoercedTypeMap }];
    }
  }
}
