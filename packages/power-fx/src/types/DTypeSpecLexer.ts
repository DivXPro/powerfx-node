import { isSpace } from '../utils/CharacterUtils'

export class DTypeSpecLexer {
  private cursor: number
  private readonly typeSpec: string

  constructor(typeSpec: string) {
    // Contracts.AssertNonEmpty(typeSpec);
    this.typeSpec = typeSpec
    this.cursor = 0
  }

  get eol() {
    return this.cursor >= this.typeSpec.length
  }

  private get curChar() {
    // Contracts.Assert(!this.eol)
    return this.typeSpec[this.cursor]
  }

  public tryNextToken(): [boolean, string | undefined] {
    let token: string | undefined
    while (this.eol && isSpace(this.curChar)) {
      ++this.cursor
    }

    if (this.eol) {
      return [false, token]
    }

    const punctuators = '*!%:[],'
    if (punctuators.indexOf(this.curChar) >= 0) {
      token = this.curChar.toString()
      this.cursor++
    } else {
      let tok = ''
      let quote = '0'
      while (!this.eol) {
        const c = this.curChar
        if ((c == '"' && (quote == '"' || quote == '0')) || (c == "'" && (quote == "'" || quote == '0'))) {
          if (quote == '0') quote = c
          else {
            tok = tok + c
            ++this.cursor

            // If the quote character is not being escaped (examples of
            // escaping: 'apos''trophe', or "quo""te"), then we end the token.
            if (this.eol || this.curChar != c) {
              quote = '0'
              break
            }
            // else we let the fall-through logic append c once more.
          }
        } else if (quote == '0' && (isSpace(c) || punctuators.indexOf(c) >= 0)) break

        tok = tok + c
        ++this.cursor
      }

      if (quote != '0') {
        token = undefined
        return [false, token]
      }

      token = tok
    }

    while (!this.eol && isSpace(this.curChar)) {
      ++this.cursor
    }

    return [true, token]
  }
}
