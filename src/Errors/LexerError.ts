class LexerError extends Error {
  constructor(message: string, line: number) {
    super(message);
    this.name = "LexerError";
    this.line = line;
  }

  public line: number;

  public override toString(): string {
    return `LEXER:: ${this.message} at line ${this.line}`;
  }
}

export default LexerError;
