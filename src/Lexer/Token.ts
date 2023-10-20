import TokenType from './TokenType';

export default class Token {
    constructor(public type: TokenType, public value: string, public line = 0) {}

    public toString(): string {
        return `Token(${this.type}, ${this.value}, ${this.line})`;
    }
}
