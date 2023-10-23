const Parser = require('../dist/Parser/Parser').default;
const Token = require('../dist/Lexer/Token').default;
const TokenType = require('../dist/Lexer/TokenType').default;
const Expr = require('../dist/Expr/index');

describe('Parser', () => {
    test('should parse a simple expression', () => {
        const tokens = [
            new Token(TokenType.NUMBER_LITERAL_TOKEN, '1'),
            new Token(TokenType.PLUS_TOKEN, '+'),
            new Token(TokenType.NUMBER_LITERAL_TOKEN, '2'),
            new Token(TokenType.SEMICOLON_TOKEN, ';'),
        ];
        const expected = [
            new Expr.BinaryExpr(
                new Expr.NumberLiteralExpr(1),
                new Token(TokenType.PLUS_TOKEN, '+'),
                new Expr.NumberLiteralExpr(2),
            ),
        ];
        expect(new Parser().parse(tokens)).toEqual(expected);
    });

    test('should parse a complex expression', () => {
        const tokens = [
            new Token(TokenType.NUMBER_LITERAL_TOKEN, '1'),
            new Token(TokenType.PLUS_TOKEN, '+'),
            new Token(TokenType.NUMBER_LITERAL_TOKEN, '2'),
            new Token(TokenType.STAR_TOKEN, '*'),
            new Token(TokenType.NUMBER_LITERAL_TOKEN, '3'),
            new Token(TokenType.SEMICOLON_TOKEN, ';'),
        ];
        const expected = [
            new Expr.BinaryExpr(
                new Expr.NumberLiteralExpr(1),
                new Token(TokenType.PLUS_TOKEN, '+'),
                new Expr.BinaryExpr(
                    new Expr.NumberLiteralExpr(2),
                    new Token(TokenType.STAR_TOKEN, '*'),
                    new Expr.NumberLiteralExpr(3),
                ),
            ),
        ];
        expect(new Parser().parse(tokens)).toEqual(expected);
    });

    test('should throw an error for invalid assignment target', () => {
        const tokens = [
            new Token(TokenType.NUMBER_LITERAL_TOKEN, '1'),
            new Token(TokenType.ASSIGNMENT_TOKEN, '='),
            new Token(TokenType.NUMBER_LITERAL_TOKEN, '2'),
            new Token(TokenType.SEMICOLON_TOKEN, ';'),
        ];
        expect(() => new Parser().parse(tokens)).toThrow();
    });

    // var name: STRING = "John";
    test('should parse variable declaration', () => {
        const tokens = [
            new Token(TokenType.IDENTIFIER_TOKEN, 'var'),
            new Token(TokenType.IDENTIFIER_TOKEN, 'name'),
            new Token(TokenType.COLON_TOKEN, ':'),
            new Token(TokenType.IDENTIFIER_TOKEN, 'STRING'),
            new Token(TokenType.ASSIGNMENT_TOKEN, '='),
            new Token(TokenType.STRING_LITERAL_TOKEN, 'John'),
            new Token(TokenType.SEMICOLON_TOKEN, ';'),
        ];
        const expected = [
            new Expr.VariableDeclarationExpr(
                new Token(TokenType.IDENTIFIER_TOKEN, 'name'),
                new Token(TokenType.IDENTIFIER_TOKEN, 'STRING'),
                new Expr.StringLiteralExpr('John'),
            ),
        ];
        expect(new Parser().parse(tokens)).toEqual(expected);
    });
});
