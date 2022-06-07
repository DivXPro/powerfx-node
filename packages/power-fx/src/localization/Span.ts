import { hashCode } from '../utils/Hash'
import { KeyValuePair } from '../utils/types'

export class Span {
  public min: number
  public lim: number

  constructor(min: number, lim: number) {
    // Contracts.CheckParam(min >= 0, "min");
    // Contracts.CheckParam(lim >= min, "lim");

    this.min = min
    this.lim = lim
  }

  public getFragment(script: string) {
    // Contracts.AssertValue(script);
    // Contracts.Assert(Lim <= script.Length);
    return script.substr(this.min, this.lim - this.min)
  }

  public toString() {
    return `Min: ${this.min}, Lim: ${this.lim}`
  }

  public startsWith(script: string, match: string) {
    // Contracts.AssertValue(script);
    // Contracts.Assert(Min <= script.Length);
    // Contracts.AssertValue(match);
    return (
      this.min + match.length <= script.length &&
      script.substr(this.min, match.length) === match
    )
  }

  // TODO: 需重构
  // Generic span replacer. Given a set of unordered spans and replacement strings for
  // each, this produces a new string with all the specified spans replaced accordingly.
  public static ReplaceSpans(
    script: string,
    worklist: Array<KeyValuePair<Span, string>>
  ) {
    // Contracts.AssertValue(script);
    // Contracts.AssertValue(worklist);
    return ''
    // StringBuilder sb = null;
    // try
    // {
    //     // sb = StringBuilderCache.Acquire(script.Length);
    //     let str: string = ''
    //     worklist.sort((a, b) => a.key.min - b.key.min).forEach(item => {
    //       str +=
    //     })
    //     int index = 0;

    //     foreach (let pair in worklist.OrderBy(kvp => kvp.Key.Min))
    //     {
    //         sb.Append(script, index, pair.Key.Min - index);
    //         sb.Append(pair.Value);
    //         index = pair.Key.Lim;
    //     }

    //     if (index < script.Length)
    //         sb.Append(script, index, script.Length - index);

    //     return sb.ToString();
    // }
    // finally
    // {
    //     if (sb != null)
    //         StringBuilderCache.Release(sb);
    // }
  }

  public Equals(obj: any) {
    return obj instanceof Span && this.min == obj.min && this.lim == obj.lim
  }

  public getHashCode() {
    const base = 'SpanClass1160472096'
    return hashCode(base + hashCode(this.min) + hashCode(this.lim))
  }
}
