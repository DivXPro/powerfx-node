import { IErrorContainer } from '../../app/errorContainers'
import { TexlBinding } from '../../binding'
import { DocumentErrorSeverity } from '../../errors'
import { BuiltinFunction } from '../../functions/BuiltinFunction'
import { ArgValidators } from '../../functions/functionArgValidators'
import { SignatureConstraint } from '../../functions/SignatureConstraint'
import { VariadicOp } from '../../lexer'
import { StringGetter, TexlStrings } from '../../localization'
import {
  CallNode,
  FirstNameNode,
  ListNode,
  TexlNode,
  VariadicOpNode,
} from '../../syntax'
import { DKind } from '../../types/DKind'
import { DType } from '../../types/DType'
import { FunctionCategories } from '../../types/FunctionCategories'
import { CollectionUtils } from '../../utils/CollectionUtils'
import { Dictionary } from '../../utils/Dictionary'

export class IfFunction extends BuiltinFunction {
  public get isStrict() {
    return false
  }

  public get suggestionTypeReferenceParamIndex() {
    return 1
  }

  public get usesEnumNamespace() {
    return true
  }

  public get isSelfContained() {
    return true
  }

  public get supportsParamCoercion() {
    return true
  }

  constructor() {
    super(
      undefined,
      'If',
      undefined,
      TexlStrings.AboutIf,
      FunctionCategories.Logical,
      DType.Unknown,
      0,
      2,
      Number.MAX_VALUE
    )

    // If(cond1, value1, cond2, value2, ..., condN, valueN, [valueFalse], ...)
    this.signatureConstraint = new SignatureConstraint(4, 2, 0, 8)
  }

  public getSignatures() {
    // Enumerate just the base overloads (the first 3 possibilities).
    return [
      [TexlStrings.IfArgCond, TexlStrings.IfArgTrueValue],
      [
        TexlStrings.IfArgCond,
        TexlStrings.IfArgTrueValue,
        TexlStrings.IfArgElseValue,
      ],
      [
        TexlStrings.IfArgCond,
        TexlStrings.IfArgTrueValue,
        TexlStrings.IfArgCond,
        TexlStrings.IfArgTrueValue,
      ],
    ]
  }

  public getSignaturesAtArity(arity: number) {
    if (arity > 2) {
      return this.GetOverloadsIf(arity)
    }

    return super.getSignaturesAtArity(arity)
  }

  public isLazyEvalParam(index: number) {
    return index >= 1
  }

  public checkInvocation(
    args: TexlNode[],
    argTypes: DType[],
    errors: IErrorContainer,
    binding: TexlBinding
  ): [
    boolean,
    { returnType: DType; nodeToCoercedTypeMap: Dictionary<TexlNode, DType> }
  ] {
    // Contracts.AssertValue(binding);
    // Contracts.AssertValue(args);
    // Contracts.AssertAllValues(args);
    // Contracts.AssertValue(argTypes);
    // Contracts.Assert(args.length == argTypes.length);
    // Contracts.AssertValue(errors);
    // Contracts.Assert(MinArity <= args.length && args.length <= MaxArity);

    let count = args.length
    let nodeToCoercedTypeMap = null

    // Check the predicates.
    let fArgsValid = true
    for (let i = 0; i < (count & ~1); i += 2) {
      let CheckType = super.checkType(
        args[i],
        argTypes[i],
        DType.Boolean,
        errors,
        true
      )
      let withCoercion = CheckType[1]
      fArgsValid = fArgsValid && CheckType[0]

      if (withCoercion) {
        nodeToCoercedTypeMap = CollectionUtils.AddDictionary(
          nodeToCoercedTypeMap,
          args[i],
          DType.Boolean
        )
      }
    }

    let type = this.returnType
    let returnType = type
    // Are we on a behavior property?
    let isBehavior = binding.isBehavior

    // Compute the result type by joining the types of all non-predicate args.
    // Contracts.Assert(type == DType.Unknown);
    for (let i = 1; i < count; ) {
      const nodeArg = args[i]
      const typeArg = argTypes[i]
      if (typeArg.isError) {
        errors.ensureError(args[i], TexlStrings.ErrTypeError)
      }

      const typeSuper = DType.Supertype(type, typeArg)

      if (!typeSuper.isError) {
        type = typeSuper
      } else if (type.kind == DKind.Unknown) {
        type = typeSuper
        fArgsValid = false
      } else if (!type.isError) {
        if (typeArg.coercesTo(type)) {
          nodeToCoercedTypeMap = CollectionUtils.AddDictionary(
            nodeToCoercedTypeMap,
            nodeArg,
            type
          )
        } else if (!isBehavior || !this.IsArgTypeInconsequential(nodeArg)) {
          errors.ensureErrorWithSeverity(
            DocumentErrorSeverity.Severe,
            nodeArg,
            TexlStrings.ErrBadType_ExpectedType_ProvidedType,
            type.getKindString(),
            typeArg.getKindString()
          )
          fArgsValid = false
        }
      } else if (typeArg.kind != DKind.Unknown) {
        type = typeArg
        fArgsValid = false
      }

      // If there are an odd number of args, the last arg also participates.
      i += 2
      if (i == count) {
        i--
      }
    }

    // Update the return type based on the specified invocation args.
    returnType = type

    // return fArgsValid;
    return [fArgsValid, { returnType, nodeToCoercedTypeMap }]
  }

  // This method returns true if there are special suggestions for a particular parameter of the function.
  public hasSuggestionsForParam(argumentIndex: number) {
    // Contracts.Assert(argumentIndex >= 0);

    return argumentIndex > 1
  }

  private IsArgTypeInconsequential(arg: TexlNode) {
    // Contracts.AssertValue(arg);
    // Contracts.Assert(arg.Parent is ListNode);
    // Contracts.Assert(arg.Parent.Parent is CallNode);
    // Contracts.Assert(arg.Parent.Parent.AsCall().Head.Name == Name);

    const call = arg.parent.parent.asCall() //.VerifyValue();

    // Pattern: OnSelect = If(cond, argT, argF)
    // Pattern: OnSelect = If(cond, arg1, cond, arg2, ..., argK, argF)
    // Pattern: OnSelect = If(cond, arg1, If(cond, argT, argF))
    // Pattern: OnSelect = If(cond, arg1, If(cond, arg2, cond, arg3, ...))
    // Pattern: OnSelect = If(cond, arg1, cond, If(cond, arg2, cond, arg3, ...), ...)
    // ...etc.
    let ancestor = call
    while (ancestor.head.name.value == this.name) {
      if (ancestor.parent == null && ancestor.args.children.length > 0) {
        for (let i = 0; i < ancestor.args.children.length; i += 2) {
          // If the given node is part of a condition arg of an outer If invocation,
          // then it's NOT inconsequential. Note that the very last arg to an If
          // is not a condition -- it's the "else" branch, hence the test below.
          if (
            i != ancestor.args.children.length - 1 &&
            arg.inTree(ancestor.args.children[i])
          ) {
            return false
          }
        }

        return true
      }

      // Deal with the possibility that the ancestor may be contributing to a chain.
      // This also lets us cover the following patterns:
      // Pattern: OnSelect = X; If(cond, arg1, arg2); Y; Z
      // Pattern: OnSelect = X; If(cond, arg1;arg11;...;arg1k, arg2;arg21;...;arg2k); Y; Z
      // ...etc.
      let chainNode: VariadicOpNode
      if (
        (chainNode = ancestor.parent.asVariadicOp()) != null &&
        chainNode.op == VariadicOp.Chain
      ) {
        // Top-level chain in a behavior rule.
        if (chainNode.parent == null) {
          return true
        }

        // A chain nested within a larger non-call structure.
        if (
          !(chainNode.parent instanceof ListNode) ||
          !(chainNode.parent.parent instanceof CallNode)
        ) {
          return false
        }

        // Only the last chain segment is consequential.
        const numSegments = chainNode.children.length
        if (
          numSegments > 0 &&
          !arg.inTree(chainNode.children[numSegments - 1])
        ) {
          return true
        }

        // The node is in the last segment of a chain nested within a larger invocation.
        ancestor = chainNode.parent.parent.asCall()
        continue
      }

      // Walk up the parent chain to the outer invocation.
      if (
        !(ancestor.parent instanceof ListNode) ||
        !(ancestor.parent.parent instanceof CallNode)
      ) {
        return false
      }

      ancestor = ancestor.parent.parent.asCall()
    }

    // Exhausted all supported patterns.
    return false
  }

  // Gets the overloads for the If function for the specified arity.
  // If is special because it doesn't have a small number of overloads
  // since its max arity is int.MaxSize.
  private GetOverloadsIf(arity: number): Array<StringGetter[]> {
    // Contracts.Assert(arity >= 3);

    // REVIEW ragru: What should be the number of overloads for functions like these?
    // Once we decide should we just hardcode the number instead of having the outer loop?
    const OverloadCount = 3

    let overloads = new Array<StringGetter[]>(OverloadCount)

    // Limit the argCount avoiding potential OOM
    let argCount =
      arity > this.signatureConstraint.repeatTopLength
        ? this.signatureConstraint.repeatTopLength + (arity & 1)
        : arity
    for (let ioverload = 0; ioverload < OverloadCount; ioverload++) {
      let signature = [] // new StringGetter[argCount];
      let fOdd = (argCount & 1) != 0
      let cargCur = fOdd ? argCount - 1 : argCount

      for (let iarg = 0; iarg < cargCur; iarg += 2) {
        signature[iarg] = TexlStrings.IfArgCond
        signature[iarg + 1] = TexlStrings.IfArgTrueValue
      }

      if (fOdd) {
        signature[cargCur] = TexlStrings.IfArgElseValue
      }

      argCount++
      overloads.push(signature)
    }
    return overloads
    // return new ReadOnlyCollection<StringGetter[]>(overloads);
  }

  private TryGetDSNodes(
    binding: TexlBinding,
    args: TexlNode[]
  ): [boolean, Array<FirstNameNode>] {
    let dsNodes: FirstNameNode[] = [] // = new List<FirstNameNode>();

    let count = args.length
    for (let i = 1; i < count; ) {
      let nodeArg = args[i]

      let TryGetValidValue =
        ArgValidators.DataSourceArgNodeValidator.tryGetValidValue(
          nodeArg,
          binding
        )
      let tmpDsNodes = TryGetValidValue[1]
      if (TryGetValidValue[0]) {
        for (let node of tmpDsNodes) {
          dsNodes.push(node)
        }
      }

      // If there are an odd number of args, the last arg also participates.
      i += 2
      if (i == count) {
        i--
      }
    }
    return [dsNodes.length > 0, dsNodes]
  }

  public tryGetDataSourceNodes(
    callNode: CallNode,
    binding: TexlBinding
  ): [boolean, Array<FirstNameNode>] {
    // Contracts.AssertValue(callNode);
    // Contracts.AssertValue(binding);
    // let dsNodes: FirstNameNode[] = [];// new List<FirstNameNode>();
    let dsNodes: Array<FirstNameNode> = []
    if (callNode.args.count < 2) {
      return [false, dsNodes]
    }

    let args = callNode.args.children //.VerifyValue();
    let TryGetDSNodes = this.TryGetDSNodes(binding, args)
    dsNodes = TryGetDSNodes[1]
    return [TryGetDSNodes[0], dsNodes]
  }

  public supportsPaging(callNode: CallNode, binding: TexlBinding) {
    let TryGetDataSourceNodes = super.tryGetDataSourceNodes(callNode, binding)
    if (!TryGetDataSourceNodes[0]) {
      return false
    }

    let args = callNode.args.children //.VerifyValue();
    let count = args.length

    for (let i = 1; i < count; ) {
      if (!binding.isPageable(args[i])) {
        return false
      }

      // If there are an odd number of args, the last arg also participates.
      i += 2
      if (i == count) {
        i--
      }
    }

    return true
  }
}
