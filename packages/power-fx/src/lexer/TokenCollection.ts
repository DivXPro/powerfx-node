import { Span } from '../localization'
import { Queue } from '../utils/Queue'
import { Token } from './tokens'

export class TokenCollection {
  public readonly Contents: Token[]

  // The class assumes ownership of newContents
  constructor(newContents: Token[]) {
    // Contracts.AssertValue(newContents);
    this.Contents = newContents
  }

  // Provides a set of textspans representing stretches of the current TokenString that are
  // lexically equal to the needle.  Does not provide overlapping matches, and therefore
  // does not provide the complete set of matches
  public GetAllMatches(needle: TokenCollection): Span[] {
    // Contracts.AssertValue(needle);
    // Contracts.Assert(needle.Contents.Length > 1);
    // Contracts.Assert(needle.Contents[needle.Contents.Length - 1] is EofToken);

    // Ignore the EofToken at the end of the needle tokenstring
    let needleLength: number = needle.Contents.length - 1
    let matches: Queue<Span> = new Queue<Span>()

    // Cycle through the current TokenString looking for substring matches
    for (let haystackIndex: number = 0; haystackIndex <= this.Contents.length - needleLength; ) {
      let doMatch: boolean = true

      // Compare the needle with the current region of the haystack looking for a match
      for (let needleIndex: number = 0; needleIndex < needleLength; needleIndex++) {
        if (!this.Contents[haystackIndex + needleIndex].equals(needle.Contents[needleIndex])) {
          doMatch = false
          break
        }
      }

      // If they match, add the appropriate tokenspan to the output and increase haystackIndex to avoid
      // possibly recording overlapping matches
      if (doMatch) {
        // The (- 1) portion of the below expression accounts for the fact that we want the
        // lim of the TextSpan to be the lim of the last token that matches the needle
        let spanLim: number = this.Contents[haystackIndex + needleLength - 1].Span.lim
        let spanMin: number = this.Contents[haystackIndex].Span.min
        matches.push(new Span(spanMin, spanLim))
        haystackIndex += needle.Contents.length - 1
      } else {
        haystackIndex++
      }
    }

    return matches.toArray()
  }
}
