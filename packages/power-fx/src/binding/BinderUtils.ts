import { TexlFunction } from '../functions/TexlFunction'
import { DelegationStatus, TrackingProvider } from '../logging/trackers'
import { CallNode, DottedNameNode, FirstNameNode } from '../syntax'
import { DName } from '../utils/DName'
import { DPath } from '../utils/DPath'
import { TexlBinding } from './Binder'
import { BindKind } from './BindKind'

export class BinderUtils {
  static TryConvertNodeToDPath(binding: TexlBinding, node: DottedNameNode): [boolean, DPath] {
    // Contracts.AssertValue(binding);
    // Contracts.AssertValue(node);

    let path: DPath
    if (node.left instanceof DottedNameNode) {
      const result = BinderUtils.TryConvertNodeToDPath(binding, node.left as DottedNameNode)
      path = result[1]
      if (result[0]) {
        let rightNodeName = node.right.name
        const rst = binding.tryGetReplacedIdentName(node.right)
        const possibleRename = rst[1]
        if (rst[0]) {
          rightNodeName = new DName(possibleRename)
        }
        path = path.append(rightNodeName)
        return [true, path]
      }
    } else if (node.left instanceof FirstNameNode) {
      if (binding.getInfo(node.left).kind == BindKind.LambdaFullRecord) {
        let rightNodeName = node.right.name
        const rst = binding.tryGetReplacedIdentName(node.right)
        const rename = rst[1]
        if (rst[0]) {
          rightNodeName = new DName(rename)
        }

        path = DPath.Root.append(rightNodeName)
        return [true, path]
      }

      // Check if the access was renamed:
      let leftNodeName = node.left.ident.name
      const rst = binding.tryGetReplacedIdentName(node.left.ident)
      const possibleRename = rst[1]
      if (rst[0]) {
        leftNodeName = new DName(possibleRename)
      }

      path = DPath.Root.append(leftNodeName).append(node.right.name)
      return [true, path]
    }

    path = DPath.Root
    return [false, path]
  }

  public static LogTelemetryForFunction(
    fn: TexlFunction,
    node: CallNode,
    texlBinding: TexlBinding,
    isServerDelegatable: boolean,
  ) {
    // Contracts.AssertValue(function);
    // Contracts.AssertValue(node);
    // Contracts.AssertValue(texlBinding);

    // We only want to log about successful delegation status here. Any failures should have been logged by this time.
    if (isServerDelegatable) {
      TrackingProvider.Instance.setDelegationTrackerStatus(DelegationStatus.DelegationSuccessful, node, texlBinding, fn)
      return
    }
  }
}
