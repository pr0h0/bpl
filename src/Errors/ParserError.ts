import Token from '../Lexer/Token';

class ParserError extends Error {
    constructor(message: string, token: Token | null) {
        super(message);
        this.name = ParserError.name;
        this.token = token;
        this.line = token !== null ? token.line : 0;
    }

    public line: number;
    public token: Token | null;

    public override toString(): string {
        return `Parser:: ${this.message} at line ${this.line} [${this.token?.value}]\n\n${this.stack}`;
    }
}

export default ParserError;
