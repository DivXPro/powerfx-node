// Find the variables that this formula depends on.

import { BindKind, TexlBinding } from '../binding'
import { FirstNameNode, IdentityTexlVisitor, TexlNode } from '../syntax'

// Used for recalc.
export class DependencyFinder extends IdentityTexlVisitor {
  private _binding: TexlBinding
  public _vars: Set<string> = new Set<string>()

  constructor(binding?: TexlBinding) {
    super()
    this._binding = binding
  }
  public static FindDependencies(node: TexlNode, binding: TexlBinding): Set<string> {
    const v = new DependencyFinder()
    v._binding = binding
    node.accept(v)
    return v._vars
  }

  public visit(node: FirstNameNode) {
    const info = this._binding.getInfo(node)
    const name = node.ident?.name.value
    // Only include dependencies from the incoming context (Fields)
    // defined at the top level (NestDst==1)
    if (
      (info?.nestDst == 1 && info?.kind == BindKind.LambdaField) ||
      info?.kind == BindKind.ScopeVariable ||
      info?.kind == BindKind.PowerFxResolvedObject
    ) {
      this._vars.add(name)
    }
    super.visit(node)
  }
}
