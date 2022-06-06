import { IErrorContainer } from '../../app/errorContainers';
import { TexlBinding } from '../../binding';
import { DocumentErrorSeverity } from '../../errors';
import { BuiltinFunction } from '../../functions/BuiltinFunction';
import { FunctionScopeInfo } from '../../functions/FunctionScopeInfo';
import { VariadicOp } from '../../lexer';
import { TexlStrings } from '../../localization';
import { CallNode, ListNode, TexlNode, VariadicOpNode } from '../../syntax';
import { DKind } from '../../types/DKind';
import { DType } from '../../types/DType';
import { ErrorType } from '../../types/ErrorType';
import { FunctionCategories } from '../../types/FunctionCategories';
import { TypedName } from '../../types/TypedName';
import { CollectionUtils } from '../../utils/CollectionUtils';
import { Dictionary } from '../../utils/Dictionary';
import { DName } from '../../utils/DName';

export class IfErrorFunction extends BuiltinFunction {
  public get isStrict() {
    return false;
  }

  public get requiresErrorContext() {
    return true;
  }

  public get isSelfContained() {
    return true;
  }

  public get hasLambdas() {
    return true;
  }

  public get isAsync() {
    return true;
  }

  public get supportsParamCoercion() {
    return true;
  }

  constructor() {
    super(
      undefined,
      'IfError',
      undefined,
      TexlStrings.AboutIfError,
      FunctionCategories.Logical,
      DType.Unknown,
      0,
      2,
      Number.MAX_VALUE
    );

    let typeNems = [
      new TypedName(ErrorType.ReifiedError(), new DName('FirstError')),
      new TypedName(ErrorType.ReifiedErrorTable(), new DName('AllErrors')),
      new TypedName(DType.ObjNull, new DName('ErrorResult')),
    ];
    this.scopeInfo = new FunctionScopeInfo(
      this,
      true,
      true,
      true,
      false,
      DType.CreateRecord(...typeNems),
      (i) => i > 0 && i % 2 == 1
    );
  }

  public getSignatures() {
    return [
      [TexlStrings.IfErrorArg1, TexlStrings.IfErrorArg2],
      [TexlStrings.IfErrorArg1, TexlStrings.IfErrorArg2, TexlStrings.IfErrorArg2],
      [
        TexlStrings.IfErrorArg1,
        TexlStrings.IfErrorArg2,
        TexlStrings.IfErrorArg2,
        TexlStrings.IfErrorArg2,
      ],
    ];
  }

  public getSignaturesAtArity(arity: number) {
    if (arity > 2) {
      return super.getGenericSignatures(arity, TexlStrings.IfErrorArg2);
    }

    return super.getSignaturesAtArity(arity);
  }

  public checkInvocation(
    args: TexlNode[],
    argTypes: DType[],
    errors: IErrorContainer,
    binding: TexlBinding
  ): [boolean, { returnType: DType; nodeToCoercedTypeMap: Dictionary<TexlNode, DType> }] {
    // Contracts.AssertValue(binding);
    // Contracts.AssertValue(args);
    // Contracts.AssertAllValues(args);
    // Contracts.AssertValue(argTypes);
    // Contracts.Assert(args.length == argTypes.length);
    // Contracts.AssertValue(errors);
    // Contracts.Assert(MinArity <= args.length && args.length <= MaxArity);

    let count = args.length;
    let nodeToCoercedTypeMap = null;

    // Check the predicates.
    let fArgsValid = true;
    let type = this.returnType;
    let returnType = type;
    let isBehavior = binding.isBehavior;

    // Contracts.Assert(type == DType.Unknown);
    for (let i = 0; i < count; ) {
      let nodeArg = args[i];
      let typeArg = argTypes[i];

      if (typeArg.isError) {
        errors.ensureError(args[i], TexlStrings.ErrTypeError);
      }

      // In an IfError expression, not all expressions can be returned to the caller:
      // - If there is an even number of arguments, only the fallbacks or the last
      //   value (the next-to-last argument) can be returned:
      //   IfError(v1, f1, v2, f2, v3, f3) --> possible values to be returned are f1, f2, f3 or v3
      // - If there is an odd number of arguments, only the fallbacks or the last
      //   value (the last argument) can be returned:
      //   IfError(v1, f1, v2, f2, v3) --> possible values to be returned are f1, f2 or v3
      let typeCanBeReturned = i % 2 == 1 || i == (count % 2 == 0 ? count - 2 : count - 1);

      if (typeCanBeReturned) {
        // Let's check if it matches the other types that can be returned
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
          } else if (!isBehavior || !this.IsArgTypeInconsequential(nodeArg)) {
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

      // If there are an odd number of args, the last arg also participates.
      i += 2;
      if (i == count) {
        i--;
      }
    }

    returnType = type;
    // return fArgsValid;
    return [fArgsValid, { returnType, nodeToCoercedTypeMap }];
  }

  // In behavior properties, the arg type is irrelevant if nothing actually depends
  // on the output type of IfError (see If.cs, Switch.cs)
  private IsArgTypeInconsequential(arg: TexlNode): boolean {
    // Contracts.AssertValue(arg);
    // Contracts.Assert(arg.Parent is ListNode);
    // Contracts.Assert(arg.Parent.Parent is CallNode);
    // Contracts.Assert(arg.Parent.Parent.AsCall().Head.Name == Name);

    let call = arg.parent.parent.asCall(); //.VerifyValue();

    // Pattern: OnSelect = IfError(arg1, arg2, ... argK)
    // Pattern: OnSelect = IfError(arg1, IfError(arg1, arg2,...), ... argK)
    // ...etc.
    let ancestor = call;
    while (ancestor.head.name.value == this.name) {
      if (ancestor.parent == null && ancestor.args.children.length > 0) {
        return true;
      }

      // Deal with the possibility that the ancestor may be contributing to a chain.
      // This also lets us cover the following patterns:
      // Pattern: OnSelect = X; IfError(arg1, arg2); Y; Z
      // Pattern: OnSelect = X; IfError(arg1;arg11;...;arg1k, arg2;arg21;...;arg2k); Y; Z
      // ...etc.
      let chainNode: VariadicOpNode;
      if (
        (chainNode = ancestor.parent.asVariadicOp()) != null &&
        chainNode.op == VariadicOp.Chain
      ) {
        // Top-level chain in a behavior rule.
        if (chainNode.parent == null) {
          return true;
        }

        // A chain nested within a larger non-call structure.
        if (
          !(chainNode.parent instanceof ListNode) ||
          !(chainNode.parent.parent instanceof CallNode)
        ) {
          return false;
        }

        // Only the last chain segment is consequential.
        let numSegments = chainNode.children.length;
        if (numSegments > 0 && !arg.inTree(chainNode.children[numSegments - 1])) {
          return true;
        }

        // The node is in the last segment of a chain nested within a larger invocation.
        ancestor = chainNode.parent.parent.asCall();
        continue;
      }

      // Walk up the parent chain to the outer invocation.
      if (!(ancestor.parent instanceof ListNode) || !(ancestor.parent.parent instanceof CallNode)) {
        return false;
      }

      ancestor = ancestor.parent.parent.asCall();
    }

    // Exhausted all supported patterns.
    return false;
  }

  public isLambdaParam(index: number) {
    return index > 0;
  }
}
