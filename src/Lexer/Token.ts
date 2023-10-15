import TokenType from "./TokenType";

export default class Token {
  constructor(public type: TokenType, public value: string, public line = 0) {}
}
