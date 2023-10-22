const { assert } = require('chai');
const TokenType = require('../dist/Lexer/TokenType').default;
const Lexer = require('../dist/Lexer/Lexer').default;

describe('Lexer', () => {
    test('should pass', () => {
        assert.equal(1, 1);
    });

    test('Should return a list of tokens', () => {
        const returnValue = new Lexer().tokenize('1 + 2');
        assert.isArray(returnValue);
    });

    test('Should return a list of tokens with the correct values', () => {
        const returnValue = new Lexer().tokenize('1 + 2');
        assert.equal(returnValue[0].value, '1');
        assert.equal(returnValue[1].value, '+');
        assert.equal(returnValue[2].value, '2');
    });

    test('Should return a list of tokens with the correct types', () => {
        const returnValue = new Lexer().tokenize('1 + 2');
        assert.equal(returnValue[0].type, TokenType.NUMBER_LITERAL_TOKEN);
        assert.equal(returnValue[1].type, TokenType.PLUS_TOKEN);
        assert.equal(returnValue[2].type, TokenType.NUMBER_LITERAL_TOKEN);
    });

    test('Should parse a string with a variable', () => {
        const returnValue = new Lexer().tokenize('1 + x');
        assert.equal(returnValue[0].value, '1');
        assert.equal(returnValue[1].value, '+');
        assert.equal(returnValue[2].value, 'x');
    });

    test('Should parse a string with a variable and a number', () => {
        const returnValue = new Lexer().tokenize('1 + 2 * x');
        assert.equal(returnValue[0].value, '1');
        assert.equal(returnValue[1].value, '+');
        assert.equal(returnValue[2].value, '2');
        assert.equal(returnValue[3].value, '*');
        assert.equal(returnValue[4].value, 'x');
    });

    test('Should parse variable assignment with correct value and types', () => {
        const returnValue = new Lexer().tokenize('var x: NUMBER = 1');
        assert.equal(returnValue[0].value, 'var');
        assert.equal(returnValue[1].value, 'x');
        assert.equal(returnValue[2].value, ':');
        assert.equal(returnValue[3].value, 'NUMBER');
        assert.equal(returnValue[4].value, '=');
        assert.equal(returnValue[5].value, '1');

        assert.equal(returnValue[0].type, TokenType.IDENTIFIER_TOKEN);
        assert.equal(returnValue[1].type, TokenType.IDENTIFIER_TOKEN);
        assert.equal(returnValue[2].type, TokenType.COLON_TOKEN);
        assert.equal(returnValue[3].type, TokenType.IDENTIFIER_TOKEN);
        assert.equal(returnValue[4].type, TokenType.ASSIGNMENT_TOKEN);
        assert.equal(returnValue[5].type, TokenType.NUMBER_LITERAL_TOKEN);
    });

    test('should parse string literal', () => {
        const returnValue = new Lexer().tokenize('"hello world"');
        assert.equal(returnValue[0].value, 'hello world');
        assert.equal(returnValue[0].type, TokenType.STRING_LITERAL_TOKEN);
    });

    test('should parse number literal', () => {
        const returnValue = new Lexer().tokenize('1');
        assert.equal(returnValue[0].value, '1');
        assert.equal(returnValue[0].type, TokenType.NUMBER_LITERAL_TOKEN);
    });

    test('should parse boolean literal', () => {
        const returnValue = new Lexer().tokenize('true');
        assert.equal(returnValue[0].value, 'true');
        assert.equal(returnValue[0].type, TokenType.IDENTIFIER_TOKEN);
    });

    test('should parse null literal', () => {
        const returnValue = new Lexer().tokenize('null');
        assert.equal(returnValue[0].value, 'null');
        assert.equal(returnValue[0].type, TokenType.IDENTIFIER_TOKEN);
    });

    test('should parse object literal', () => {
        const returnValue = new Lexer().tokenize('{ "hello": "world" }');
        assert.equal(returnValue[0].value, '{');
        assert.equal(returnValue[1].value, 'hello');
        assert.equal(returnValue[2].value, ':');
        assert.equal(returnValue[3].value, 'world');
        assert.equal(returnValue[4].value, '}');

        assert.equal(returnValue[0].type, TokenType.OPEN_CURLY_TOKEN);
        assert.equal(returnValue[1].type, TokenType.STRING_LITERAL_TOKEN);
        assert.equal(returnValue[2].type, TokenType.COLON_TOKEN);
        assert.equal(returnValue[3].type, TokenType.STRING_LITERAL_TOKEN);
        assert.equal(returnValue[4].type, TokenType.CLOSE_CURLY_TOKEN);
    });

    test('should parse array literal', () => {
        const returnValue = new Lexer().tokenize('[1, 2, 3]');
        assert.equal(returnValue[0].value, '[');
        assert.equal(returnValue[1].value, '1');
        assert.equal(returnValue[2].value, ',');
        assert.equal(returnValue[3].value, '2');
        assert.equal(returnValue[4].value, ',');
        assert.equal(returnValue[5].value, '3');
        assert.equal(returnValue[6].value, ']');

        assert.equal(returnValue[0].type, TokenType.OPEN_BRACKET_TOKEN);
        assert.equal(returnValue[1].type, TokenType.NUMBER_LITERAL_TOKEN);
        assert.equal(returnValue[2].type, TokenType.COMMA_TOKEN);
        assert.equal(returnValue[3].type, TokenType.NUMBER_LITERAL_TOKEN);
        assert.equal(returnValue[4].type, TokenType.COMMA_TOKEN);
        assert.equal(returnValue[5].type, TokenType.NUMBER_LITERAL_TOKEN);
        assert.equal(returnValue[6].type, TokenType.CLOSE_BRACKET_TOKEN);
    });

    test('should parse function call', () => {
        const returnValue = new Lexer().tokenize('foo(1, 2, 3)');
        assert.equal(returnValue[0].value, 'foo');
        assert.equal(returnValue[1].value, '(');
        assert.equal(returnValue[2].value, '1');
        assert.equal(returnValue[3].value, ',');
        assert.equal(returnValue[4].value, '2');
        assert.equal(returnValue[5].value, ',');
        assert.equal(returnValue[6].value, '3');
        assert.equal(returnValue[7].value, ')');

        assert.equal(returnValue[0].type, TokenType.IDENTIFIER_TOKEN);
        assert.equal(returnValue[1].type, TokenType.OPEN_PAREN_TOKEN);
        assert.equal(returnValue[2].type, TokenType.NUMBER_LITERAL_TOKEN);
        assert.equal(returnValue[3].type, TokenType.COMMA_TOKEN);
        assert.equal(returnValue[4].type, TokenType.NUMBER_LITERAL_TOKEN);
        assert.equal(returnValue[5].type, TokenType.COMMA_TOKEN);
        assert.equal(returnValue[6].type, TokenType.NUMBER_LITERAL_TOKEN);
        assert.equal(returnValue[7].type, TokenType.CLOSE_PAREN_TOKEN);
    });

    test('should parse function declaration', () => {
        const returnValue = new Lexer().tokenize('func foo() {}');
        assert.equal(returnValue[0].value, 'func');
        assert.equal(returnValue[1].value, 'foo');
        assert.equal(returnValue[2].value, '(');
        assert.equal(returnValue[3].value, ')');
        assert.equal(returnValue[4].value, '{');
        assert.equal(returnValue[5].value, '}');

        assert.equal(returnValue[0].type, TokenType.IDENTIFIER_TOKEN);
        assert.equal(returnValue[1].type, TokenType.IDENTIFIER_TOKEN);
        assert.equal(returnValue[2].type, TokenType.OPEN_PAREN_TOKEN);
        assert.equal(returnValue[3].type, TokenType.CLOSE_PAREN_TOKEN);
        assert.equal(returnValue[4].type, TokenType.OPEN_CURLY_TOKEN);
        assert.equal(returnValue[5].type, TokenType.CLOSE_CURLY_TOKEN);
    });

    test('should parse function declaration with parameters', () => {
        const returnValue = new Lexer().tokenize('func foo(x: NUMBER) { return x;}');
        assert.equal(returnValue[0].value, 'func');
        assert.equal(returnValue[1].value, 'foo');
        assert.equal(returnValue[2].value, '(');
        assert.equal(returnValue[3].value, 'x');
        assert.equal(returnValue[4].value, ':');
        assert.equal(returnValue[5].value, 'NUMBER');
        assert.equal(returnValue[6].value, ')');
        assert.equal(returnValue[7].value, '{');
        assert.equal(returnValue[8].value, 'return');
        assert.equal(returnValue[9].value, 'x');
        assert.equal(returnValue[10].value, ';');
        assert.equal(returnValue[11].value, '}');

        assert.equal(returnValue[0].type, TokenType.IDENTIFIER_TOKEN);
        assert.equal(returnValue[1].type, TokenType.IDENTIFIER_TOKEN);
        assert.equal(returnValue[2].type, TokenType.OPEN_PAREN_TOKEN);
        assert.equal(returnValue[3].type, TokenType.IDENTIFIER_TOKEN);
        assert.equal(returnValue[4].type, TokenType.COLON_TOKEN);
        assert.equal(returnValue[5].type, TokenType.IDENTIFIER_TOKEN);
        assert.equal(returnValue[6].type, TokenType.CLOSE_PAREN_TOKEN);
        assert.equal(returnValue[7].type, TokenType.OPEN_CURLY_TOKEN);
        assert.equal(returnValue[8].type, TokenType.IDENTIFIER_TOKEN);
        assert.equal(returnValue[9].type, TokenType.IDENTIFIER_TOKEN);
        assert.equal(returnValue[10].type, TokenType.SEMICOLON_TOKEN);
        assert.equal(returnValue[11].type, TokenType.CLOSE_CURLY_TOKEN);
    });

    test('should parse if statement', () => {
        const returnValue = new Lexer().tokenize('if (x == 1) { return x; }');
        assert.equal(returnValue[0].value, 'if');
        assert.equal(returnValue[1].value, '(');
        assert.equal(returnValue[2].value, 'x');
        assert.equal(returnValue[3].value, '==');
        assert.equal(returnValue[4].value, '1');
        assert.equal(returnValue[5].value, ')');
        assert.equal(returnValue[6].value, '{');
        assert.equal(returnValue[7].value, 'return');
        assert.equal(returnValue[8].value, 'x');
        assert.equal(returnValue[9].value, ';');
        assert.equal(returnValue[10].value, '}');

        assert.equal(returnValue[0].type, TokenType.IDENTIFIER_TOKEN);
        assert.equal(returnValue[1].type, TokenType.OPEN_PAREN_TOKEN);
        assert.equal(returnValue[2].type, TokenType.IDENTIFIER_TOKEN);
        assert.equal(returnValue[3].type, TokenType.EQUAL_TOKEN);
        assert.equal(returnValue[4].type, TokenType.NUMBER_LITERAL_TOKEN);
        assert.equal(returnValue[5].type, TokenType.CLOSE_PAREN_TOKEN);
        assert.equal(returnValue[6].type, TokenType.OPEN_CURLY_TOKEN);
        assert.equal(returnValue[7].type, TokenType.IDENTIFIER_TOKEN);
        assert.equal(returnValue[8].type, TokenType.IDENTIFIER_TOKEN);
        assert.equal(returnValue[9].type, TokenType.SEMICOLON_TOKEN);
        assert.equal(returnValue[10].type, TokenType.CLOSE_CURLY_TOKEN);
    });

    test('should parse if statement with else', () => {
        const returnValue = new Lexer().tokenize('if (x == 1) { return x; } else { return 2; }');
        assert.equal(returnValue[0].value, 'if');
        assert.equal(returnValue[1].value, '(');
        assert.equal(returnValue[2].value, 'x');
        assert.equal(returnValue[3].value, '==');
        assert.equal(returnValue[4].value, '1');
        assert.equal(returnValue[5].value, ')');
        assert.equal(returnValue[6].value, '{');
        assert.equal(returnValue[7].value, 'return');
        assert.equal(returnValue[8].value, 'x');
        assert.equal(returnValue[9].value, ';');
        assert.equal(returnValue[10].value, '}');
        assert.equal(returnValue[11].value, 'else');
        assert.equal(returnValue[12].value, '{');
        assert.equal(returnValue[13].value, 'return');
        assert.equal(returnValue[14].value, '2');
        assert.equal(returnValue[15].value, ';');
        assert.equal(returnValue[16].value, '}');

        assert.equal(returnValue[0].type, TokenType.IDENTIFIER_TOKEN);
        assert.equal(returnValue[1].type, TokenType.OPEN_PAREN_TOKEN);
        assert.equal(returnValue[2].type, TokenType.IDENTIFIER_TOKEN);
        assert.equal(returnValue[3].type, TokenType.EQUAL_TOKEN);
        assert.equal(returnValue[4].type, TokenType.NUMBER_LITERAL_TOKEN);
        assert.equal(returnValue[5].type, TokenType.CLOSE_PAREN_TOKEN);
        assert.equal(returnValue[6].type, TokenType.OPEN_CURLY_TOKEN);
        assert.equal(returnValue[7].type, TokenType.IDENTIFIER_TOKEN);
        assert.equal(returnValue[8].type, TokenType.IDENTIFIER_TOKEN);
        assert.equal(returnValue[9].type, TokenType.SEMICOLON_TOKEN);
        assert.equal(returnValue[10].type, TokenType.CLOSE_CURLY_TOKEN);
        assert.equal(returnValue[11].type, TokenType.IDENTIFIER_TOKEN);
        assert.equal(returnValue[12].type, TokenType.OPEN_CURLY_TOKEN);
        assert.equal(returnValue[13].type, TokenType.IDENTIFIER_TOKEN);
        assert.equal(returnValue[14].type, TokenType.NUMBER_LITERAL_TOKEN);
        assert.equal(returnValue[15].type, TokenType.SEMICOLON_TOKEN);
        assert.equal(returnValue[16].type, TokenType.CLOSE_CURLY_TOKEN);
    });

    test('should parse if else if else statement', () => {
        const returnValue = new Lexer().tokenize(
            'if (x == 1) { return x; } else if (x == 2) { return 2; } else { return 3; }',
        );
        assert.equal(returnValue[0].value, 'if');
        assert.equal(returnValue[1].value, '(');
        assert.equal(returnValue[2].value, 'x');
        assert.equal(returnValue[3].value, '==');
        assert.equal(returnValue[4].value, '1');
        assert.equal(returnValue[5].value, ')');
        assert.equal(returnValue[6].value, '{');
        assert.equal(returnValue[7].value, 'return');
        assert.equal(returnValue[8].value, 'x');
        assert.equal(returnValue[9].value, ';');
        assert.equal(returnValue[10].value, '}');
        assert.equal(returnValue[11].value, 'else');
        assert.equal(returnValue[12].value, 'if');
        assert.equal(returnValue[13].value, '(');
        assert.equal(returnValue[14].value, 'x');
        assert.equal(returnValue[15].value, '==');
        assert.equal(returnValue[16].value, '2');
        assert.equal(returnValue[17].value, ')');
        assert.equal(returnValue[18].value, '{');
        assert.equal(returnValue[19].value, 'return');
        assert.equal(returnValue[20].value, '2');
        assert.equal(returnValue[21].value, ';');
        assert.equal(returnValue[22].value, '}');
        assert.equal(returnValue[23].value, 'else');
        assert.equal(returnValue[24].value, '{');
        assert.equal(returnValue[25].value, 'return');
        assert.equal(returnValue[26].value, '3');
        assert.equal(returnValue[27].value, ';');
        assert.equal(returnValue[28].value, '}');

        assert.equal(returnValue[0].type, TokenType.IDENTIFIER_TOKEN);
        assert.equal(returnValue[1].type, TokenType.OPEN_PAREN_TOKEN);
        assert.equal(returnValue[2].type, TokenType.IDENTIFIER_TOKEN);
        assert.equal(returnValue[3].type, TokenType.EQUAL_TOKEN);
        assert.equal(returnValue[4].type, TokenType.NUMBER_LITERAL_TOKEN);
        assert.equal(returnValue[5].type, TokenType.CLOSE_PAREN_TOKEN);
        assert.equal(returnValue[6].type, TokenType.OPEN_CURLY_TOKEN);
        assert.equal(returnValue[7].type, TokenType.IDENTIFIER_TOKEN);
        assert.equal(returnValue[8].type, TokenType.IDENTIFIER_TOKEN);
        assert.equal(returnValue[9].type, TokenType.SEMICOLON_TOKEN);
        assert.equal(returnValue[10].type, TokenType.CLOSE_CURLY_TOKEN);
        assert.equal(returnValue[11].type, TokenType.IDENTIFIER_TOKEN);
        assert.equal(returnValue[12].type, TokenType.IDENTIFIER_TOKEN);
        assert.equal(returnValue[13].type, TokenType.OPEN_PAREN_TOKEN);
        assert.equal(returnValue[14].type, TokenType.IDENTIFIER_TOKEN);
        assert.equal(returnValue[15].type, TokenType.EQUAL_TOKEN);
        assert.equal(returnValue[16].type, TokenType.NUMBER_LITERAL_TOKEN);
        assert.equal(returnValue[17].type, TokenType.CLOSE_PAREN_TOKEN);
        assert.equal(returnValue[18].type, TokenType.OPEN_CURLY_TOKEN);
        assert.equal(returnValue[19].type, TokenType.IDENTIFIER_TOKEN);
        assert.equal(returnValue[20].type, TokenType.NUMBER_LITERAL_TOKEN);
        assert.equal(returnValue[21].type, TokenType.SEMICOLON_TOKEN);
        assert.equal(returnValue[22].type, TokenType.CLOSE_CURLY_TOKEN);
        assert.equal(returnValue[23].type, TokenType.IDENTIFIER_TOKEN);
        assert.equal(returnValue[24].type, TokenType.OPEN_CURLY_TOKEN);
        assert.equal(returnValue[25].type, TokenType.IDENTIFIER_TOKEN);
        assert.equal(returnValue[26].type, TokenType.NUMBER_LITERAL_TOKEN);
        assert.equal(returnValue[27].type, TokenType.SEMICOLON_TOKEN);
        assert.equal(returnValue[28].type, TokenType.CLOSE_CURLY_TOKEN);
    });

    test('should parse while loop', () => {
        const returnValue = new Lexer().tokenize('while (x < 10) { x++; }');
        assert.equal(returnValue[0].value, 'while');
        assert.equal(returnValue[1].value, '(');
        assert.equal(returnValue[2].value, 'x');
        assert.equal(returnValue[3].value, '<');
        assert.equal(returnValue[4].value, '10');
        assert.equal(returnValue[5].value, ')');
        assert.equal(returnValue[6].value, '{');
        assert.equal(returnValue[7].value, 'x');
        assert.equal(returnValue[8].value, '++');
        assert.equal(returnValue[9].value, ';');
        assert.equal(returnValue[10].value, '}');

        assert.equal(returnValue[0].type, TokenType.IDENTIFIER_TOKEN);
        assert.equal(returnValue[1].type, TokenType.OPEN_PAREN_TOKEN);
        assert.equal(returnValue[2].type, TokenType.IDENTIFIER_TOKEN);
        assert.equal(returnValue[3].type, TokenType.LESS_THEN_TOKEN);
        assert.equal(returnValue[4].type, TokenType.NUMBER_LITERAL_TOKEN);
        assert.equal(returnValue[5].type, TokenType.CLOSE_PAREN_TOKEN);
        assert.equal(returnValue[6].type, TokenType.OPEN_CURLY_TOKEN);
        assert.equal(returnValue[7].type, TokenType.IDENTIFIER_TOKEN);
        assert.equal(returnValue[8].type, TokenType.INCREMENT_TOKEN);
        assert.equal(returnValue[9].type, TokenType.SEMICOLON_TOKEN);
        assert.equal(returnValue[10].type, TokenType.CLOSE_CURLY_TOKEN);
    });

    test('should parse for loop', () => {
        const returnValue = new Lexer().tokenize('for (var i: NUMBER = 0; i < 10; i++) { x++; }');
        assert.equal(returnValue[0].value, 'for');
        assert.equal(returnValue[1].value, '(');
        assert.equal(returnValue[2].value, 'var');
        assert.equal(returnValue[3].value, 'i');
        assert.equal(returnValue[4].value, ':');
        assert.equal(returnValue[5].value, 'NUMBER');
        assert.equal(returnValue[6].value, '=');
        assert.equal(returnValue[7].value, '0');
        assert.equal(returnValue[8].value, ';');
        assert.equal(returnValue[9].value, 'i');
        assert.equal(returnValue[10].value, '<');
        assert.equal(returnValue[11].value, '10');
        assert.equal(returnValue[12].value, ';');
        assert.equal(returnValue[13].value, 'i');
        assert.equal(returnValue[14].value, '++');
        assert.equal(returnValue[15].value, ')');
        assert.equal(returnValue[16].value, '{');
        assert.equal(returnValue[17].value, 'x');
        assert.equal(returnValue[18].value, '++');
        assert.equal(returnValue[19].value, ';');
        assert.equal(returnValue[20].value, '}');

        assert.equal(returnValue[0].type, TokenType.IDENTIFIER_TOKEN);
        assert.equal(returnValue[1].type, TokenType.OPEN_PAREN_TOKEN);
        assert.equal(returnValue[2].type, TokenType.IDENTIFIER_TOKEN);
        assert.equal(returnValue[3].type, TokenType.IDENTIFIER_TOKEN);
        assert.equal(returnValue[4].type, TokenType.COLON_TOKEN);
        assert.equal(returnValue[5].type, TokenType.IDENTIFIER_TOKEN);
        assert.equal(returnValue[6].type, TokenType.ASSIGNMENT_TOKEN);
        assert.equal(returnValue[7].type, TokenType.NUMBER_LITERAL_TOKEN);
        assert.equal(returnValue[8].type, TokenType.SEMICOLON_TOKEN);
        assert.equal(returnValue[9].type, TokenType.IDENTIFIER_TOKEN);
        assert.equal(returnValue[10].type, TokenType.LESS_THEN_TOKEN);
        assert.equal(returnValue[11].type, TokenType.NUMBER_LITERAL_TOKEN);
        assert.equal(returnValue[12].type, TokenType.SEMICOLON_TOKEN);
        assert.equal(returnValue[13].type, TokenType.IDENTIFIER_TOKEN);
        assert.equal(returnValue[14].type, TokenType.INCREMENT_TOKEN);
        assert.equal(returnValue[15].type, TokenType.CLOSE_PAREN_TOKEN);
        assert.equal(returnValue[16].type, TokenType.OPEN_CURLY_TOKEN);
        assert.equal(returnValue[17].type, TokenType.IDENTIFIER_TOKEN);
        assert.equal(returnValue[18].type, TokenType.INCREMENT_TOKEN);
        assert.equal(returnValue[19].type, TokenType.SEMICOLON_TOKEN);
        assert.equal(returnValue[20].type, TokenType.CLOSE_CURLY_TOKEN);
    });

    test('should parse empty infinite for loop', () => {
        const returnValue = new Lexer().tokenize('for (;;) {}');
        assert.equal(returnValue[0].value, 'for');
        assert.equal(returnValue[1].value, '(');
        assert.equal(returnValue[2].value, ';');
        assert.equal(returnValue[3].value, ';');
        assert.equal(returnValue[4].value, ')');
        assert.equal(returnValue[5].value, '{');
        assert.equal(returnValue[6].value, '}');

        assert.equal(returnValue[0].type, TokenType.IDENTIFIER_TOKEN);
        assert.equal(returnValue[1].type, TokenType.OPEN_PAREN_TOKEN);
        assert.equal(returnValue[2].type, TokenType.SEMICOLON_TOKEN);
        assert.equal(returnValue[3].type, TokenType.SEMICOLON_TOKEN);
        assert.equal(returnValue[4].type, TokenType.CLOSE_PAREN_TOKEN);
        assert.equal(returnValue[5].type, TokenType.OPEN_CURLY_TOKEN);
        assert.equal(returnValue[6].type, TokenType.CLOSE_CURLY_TOKEN);
    });

    test('should parse empty infinite for loop with failsafe', () => {
        const returnValue = new Lexer().tokenize('for 100 (;;) {}');
        assert.equal(returnValue[0].value, 'for');
        assert.equal(returnValue[1].value, '100');
        assert.equal(returnValue[2].value, '(');
        assert.equal(returnValue[3].value, ';');
        assert.equal(returnValue[4].value, ';');
        assert.equal(returnValue[5].value, ')');
        assert.equal(returnValue[6].value, '{');
        assert.equal(returnValue[7].value, '}');

        assert.equal(returnValue[0].type, TokenType.IDENTIFIER_TOKEN);
        assert.equal(returnValue[1].type, TokenType.NUMBER_LITERAL_TOKEN);
        assert.equal(returnValue[2].type, TokenType.OPEN_PAREN_TOKEN);
        assert.equal(returnValue[3].type, TokenType.SEMICOLON_TOKEN);
        assert.equal(returnValue[4].type, TokenType.SEMICOLON_TOKEN);
        assert.equal(returnValue[5].type, TokenType.CLOSE_PAREN_TOKEN);
        assert.equal(returnValue[6].type, TokenType.OPEN_CURLY_TOKEN);
        assert.equal(returnValue[7].type, TokenType.CLOSE_CURLY_TOKEN);
    });

    test('should parse empty infinite while loop', () => {
        const returnValue = new Lexer().tokenize('while (true) {}');
        assert.equal(returnValue[0].value, 'while');
        assert.equal(returnValue[1].value, '(');
        assert.equal(returnValue[2].value, 'true');
        assert.equal(returnValue[3].value, ')');
        assert.equal(returnValue[4].value, '{');
        assert.equal(returnValue[5].value, '}');

        assert.equal(returnValue[0].type, TokenType.IDENTIFIER_TOKEN);
        assert.equal(returnValue[1].type, TokenType.OPEN_PAREN_TOKEN);
        assert.equal(returnValue[2].type, TokenType.IDENTIFIER_TOKEN);
        assert.equal(returnValue[3].type, TokenType.CLOSE_PAREN_TOKEN);
        assert.equal(returnValue[4].type, TokenType.OPEN_CURLY_TOKEN);
        assert.equal(returnValue[5].type, TokenType.CLOSE_CURLY_TOKEN);
    });

    test('should parse empty infinite while loop with failsafe', () => {
        const returnValue = new Lexer().tokenize('while 100 (true) {}');
        assert.equal(returnValue[0].value, 'while');
        assert.equal(returnValue[1].value, '100');
        assert.equal(returnValue[2].value, '(');
        assert.equal(returnValue[3].value, 'true');
        assert.equal(returnValue[4].value, ')');
        assert.equal(returnValue[5].value, '{');
        assert.equal(returnValue[6].value, '}');

        assert.equal(returnValue[0].type, TokenType.IDENTIFIER_TOKEN);
        assert.equal(returnValue[1].type, TokenType.NUMBER_LITERAL_TOKEN);
        assert.equal(returnValue[2].type, TokenType.OPEN_PAREN_TOKEN);
        assert.equal(returnValue[3].type, TokenType.IDENTIFIER_TOKEN);
        assert.equal(returnValue[4].type, TokenType.CLOSE_PAREN_TOKEN);
        assert.equal(returnValue[5].type, TokenType.OPEN_CURLY_TOKEN);
        assert.equal(returnValue[6].type, TokenType.CLOSE_CURLY_TOKEN);
    });

    test('should parse empty infinite do while loop', () => {
        const returnValue = new Lexer().tokenize('do {} while (true)');
        assert.equal(returnValue[0].value, 'do');
        assert.equal(returnValue[1].value, '{');
        assert.equal(returnValue[2].value, '}');
        assert.equal(returnValue[3].value, 'while');
        assert.equal(returnValue[4].value, '(');
        assert.equal(returnValue[5].value, 'true');
        assert.equal(returnValue[6].value, ')');

        assert.equal(returnValue[0].type, TokenType.IDENTIFIER_TOKEN);
        assert.equal(returnValue[1].type, TokenType.OPEN_CURLY_TOKEN);
        assert.equal(returnValue[2].type, TokenType.CLOSE_CURLY_TOKEN);
        assert.equal(returnValue[3].type, TokenType.IDENTIFIER_TOKEN);
        assert.equal(returnValue[4].type, TokenType.OPEN_PAREN_TOKEN);
        assert.equal(returnValue[5].type, TokenType.IDENTIFIER_TOKEN);
        assert.equal(returnValue[6].type, TokenType.CLOSE_PAREN_TOKEN);
    });

    test('should parse empty infinite do while loop with failsafe', () => {
        const returnValue = new Lexer().tokenize('do 100 {} while (true)');
        assert.equal(returnValue[0].value, 'do');
        assert.equal(returnValue[1].value, '100');
        assert.equal(returnValue[2].value, '{');
        assert.equal(returnValue[3].value, '}');
        assert.equal(returnValue[4].value, 'while');
        assert.equal(returnValue[5].value, '(');
        assert.equal(returnValue[6].value, 'true');
        assert.equal(returnValue[7].value, ')');

        assert.equal(returnValue[0].type, TokenType.IDENTIFIER_TOKEN);
        assert.equal(returnValue[1].type, TokenType.NUMBER_LITERAL_TOKEN);
        assert.equal(returnValue[2].type, TokenType.OPEN_CURLY_TOKEN);
        assert.equal(returnValue[3].type, TokenType.CLOSE_CURLY_TOKEN);
        assert.equal(returnValue[4].type, TokenType.IDENTIFIER_TOKEN);
        assert.equal(returnValue[5].type, TokenType.OPEN_PAREN_TOKEN);
        assert.equal(returnValue[6].type, TokenType.IDENTIFIER_TOKEN);
        assert.equal(returnValue[7].type, TokenType.CLOSE_PAREN_TOKEN);
    });

    it('should tokenize template string', () => {
        const input = '`hello ${world}`';
        const expectedTokens = [
            { type: TokenType.TEMPLATE_LITERAL_TOKEN, value: 'hello ${world}', line: 1 },
            { type: TokenType.EOF_TOKEN, value: 'EOF', line: 1 },
        ];
        const tokens = new Lexer().tokenize(input);
        assert.deepEqual(tokens, expectedTokens);
    });

    it('should tokenize parentheses', () => {
        const input = '()';
        const expectedTokens = [
            { type: TokenType.OPEN_PAREN_TOKEN, value: '(', line: 1 },
            { type: TokenType.CLOSE_PAREN_TOKEN, value: ')', line: 1 },
            { type: TokenType.EOF_TOKEN, value: 'EOF', line: 1 },
        ];
        const tokens = new Lexer().tokenize(input);
        assert.deepEqual(tokens, expectedTokens);
    });

    it('should tokenize brackets', () => {
        const input = '[]';
        const expectedTokens = [
            { type: TokenType.OPEN_BRACKET_TOKEN, value: '[', line: 1 },
            { type: TokenType.CLOSE_BRACKET_TOKEN, value: ']', line: 1 },
            { type: TokenType.EOF_TOKEN, value: 'EOF', line: 1 },
        ];
        const tokens = new Lexer().tokenize(input);
        assert.deepEqual(tokens, expectedTokens);
    });

    it('should tokenize curly braces', () => {
        const input = '{}';
        const expectedTokens = [
            { type: TokenType.OPEN_CURLY_TOKEN, value: '{', line: 1 },
            { type: TokenType.CLOSE_CURLY_TOKEN, value: '}', line: 1 },
            { type: TokenType.EOF_TOKEN, value: 'EOF', line: 1 },
        ];
        const tokens = new Lexer().tokenize(input);
        assert.deepEqual(tokens, expectedTokens);
    });

    it('should tokenize comma', () => {
        const input = ',';
        const expectedTokens = [
            { type: TokenType.COMMA_TOKEN, value: ',', line: 1 },
            { type: TokenType.EOF_TOKEN, value: 'EOF', line: 1 },
        ];
        const tokens = new Lexer().tokenize(input);
        assert.deepEqual(tokens, expectedTokens);
    });

    it('should tokenize dot', () => {
        const input = '.';
        const expectedTokens = [
            { type: TokenType.DOT_TOKEN, value: '.', line: 1 },
            { type: TokenType.EOF_TOKEN, value: 'EOF', line: 1 },
        ];
        const tokens = new Lexer().tokenize(input);
        assert.deepEqual(tokens, expectedTokens);
    });

    it('should tokenize semicolon', () => {
        const input = ';';
        const expectedTokens = [
            { type: TokenType.SEMICOLON_TOKEN, value: ';', line: 1 },
            { type: TokenType.EOF_TOKEN, value: 'EOF', line: 1 },
        ];
        const tokens = new Lexer().tokenize(input);
        assert.deepEqual(tokens, expectedTokens);
    });

    it('should tokenize colon', () => {
        const input = ':';
        const expectedTokens = [
            { type: TokenType.COLON_TOKEN, value: ':', line: 1 },
            { type: TokenType.EOF_TOKEN, value: 'EOF', line: 1 },
        ];
        const tokens = new Lexer().tokenize(input);
        assert.deepEqual(tokens, expectedTokens);
    });

    it('should tokenize question mark', () => {
        const input = '?';
        const expectedTokens = [
            { type: TokenType.QUESTION_MARK_TOKEN, value: '?', line: 1 },
            { type: TokenType.EOF_TOKEN, value: 'EOF', line: 1 },
        ];
        const tokens = new Lexer().tokenize(input);
        assert.deepEqual(tokens, expectedTokens);
    });

    it('should tokenize at', () => {
        const input = '@';
        const expectedTokens = [
            { type: TokenType.AT_TOKEN, value: '@', line: 1 },
            { type: TokenType.EOF_TOKEN, value: 'EOF', line: 1 },
        ];
        const tokens = new Lexer().tokenize(input);
        assert.deepEqual(tokens, expectedTokens);
    });

    it('should tokenize bang', () => {
        const input = '!';
        const expectedTokens = [
            { type: TokenType.BANG_TOKEN, value: '!', line: 1 },
            { type: TokenType.EOF_TOKEN, value: 'EOF', line: 1 },
        ];
        const tokens = new Lexer().tokenize(input);
        assert.deepEqual(tokens, expectedTokens);
    });

    it('should tokenize plus', () => {
        const input = '+';
        const expectedTokens = [
            { type: TokenType.PLUS_TOKEN, value: '+', line: 1 },
            { type: TokenType.EOF_TOKEN, value: 'EOF', line: 1 },
        ];
        const tokens = new Lexer().tokenize(input);
        assert.deepEqual(tokens, expectedTokens);
    });

    it('should tokenize minus', () => {
        const input = '-';
        const expectedTokens = [
            { type: TokenType.MINUS_TOKEN, value: '-', line: 1 },
            { type: TokenType.EOF_TOKEN, value: 'EOF', line: 1 },
        ];
        const tokens = new Lexer().tokenize(input);
        assert.deepEqual(tokens, expectedTokens);
    });

    it('should tokenize star', () => {
        const input = '*';
        const expectedTokens = [
            { type: TokenType.STAR_TOKEN, value: '*', line: 1 },
            { type: TokenType.EOF_TOKEN, value: 'EOF', line: 1 },
        ];
        const tokens = new Lexer().tokenize(input);
        assert.deepEqual(tokens, expectedTokens);
    });

    it('should tokenize slash', () => {
        const input = '/';
        const expectedTokens = [
            { type: TokenType.SLASH_TOKEN, value: '/', line: 1 },
            { type: TokenType.EOF_TOKEN, value: 'EOF', line: 1 },
        ];
        const tokens = new Lexer().tokenize(input);
        assert.deepEqual(tokens, expectedTokens);
    });

    it('should tokenize modulo', () => {
        const input = '%';
        const expectedTokens = [
            { type: TokenType.MODULO_TOKEN, value: '%', line: 1 },
            { type: TokenType.EOF_TOKEN, value: 'EOF', line: 1 },
        ];
        const tokens = new Lexer().tokenize(input);
        assert.deepEqual(tokens, expectedTokens);
    });

    it('should tokenize equal', () => {
        const input = '=';
        const expectedTokens = [
            { type: TokenType.ASSIGNMENT_TOKEN, value: '=', line: 1 },
            { type: TokenType.EOF_TOKEN, value: 'EOF', line: 1 },
        ];
        const tokens = new Lexer().tokenize(input);
        assert.deepEqual(tokens, expectedTokens);
    });

    it('should tokenize less', () => {
        const input = '<';
        const expectedTokens = [
            { type: TokenType.LESS_THEN_TOKEN, value: '<', line: 1 },
            { type: TokenType.EOF_TOKEN, value: 'EOF', line: 1 },
        ];
        const tokens = new Lexer().tokenize(input);
        assert.deepEqual(tokens, expectedTokens);
    });

    it('should tokenize greater', () => {
        const input = '>';
        const expectedTokens = [
            { type: TokenType.GREATER_THEN_TOKEN, value: '>', line: 1 },
            { type: TokenType.EOF_TOKEN, value: 'EOF', line: 1 },
        ];
        const tokens = new Lexer().tokenize(input);
        assert.deepEqual(tokens, expectedTokens);
    });

    it('should tokenize and', () => {
        const input = '&&';
        const expectedTokens = [
            { type: TokenType.AND_TOKEN, value: '&&', line: 1 },
            { type: TokenType.EOF_TOKEN, value: 'EOF', line: 1 },
        ];
        const tokens = new Lexer().tokenize(input);
        assert.deepEqual(tokens, expectedTokens);
    });

    it('should tokenize or', () => {
        const input = '||';
        const expectedTokens = [
            { type: TokenType.OR_TOKEN, value: '||', line: 1 },
            { type: TokenType.EOF_TOKEN, value: 'EOF', line: 1 },
        ];
        const tokens = new Lexer().tokenize(input);
        assert.deepEqual(tokens, expectedTokens);
    });

    it('should parse string literal', () => {
        const input = "'hello world'";
        const expectedTokens = [
            { type: TokenType.STRING_LITERAL_TOKEN, value: 'hello world', line: 1 },
            { type: TokenType.EOF_TOKEN, value: 'EOF', line: 1 },
        ];
        const tokens = new Lexer().tokenize(input);
        assert.deepEqual(tokens, expectedTokens);
    });

    it('should parse number literal', () => {
        const input = '123.45';
        const expectedTokens = [
            { type: TokenType.NUMBER_LITERAL_TOKEN, value: '123.45', line: 1 },
            { type: TokenType.EOF_TOKEN, value: 'EOF', line: 1 },
        ];
        const tokens = new Lexer().tokenize(input);
        assert.deepEqual(tokens, expectedTokens);
    });

    it('should parse identifier', () => {
        const input = 'foo_bar123';
        const expectedTokens = [
            { type: TokenType.IDENTIFIER_TOKEN, value: 'foo_bar123', line: 1 },
            { type: TokenType.EOF_TOKEN, value: 'EOF', line: 1 },
        ];
        const tokens = new Lexer().tokenize(input);
        assert.deepEqual(tokens, expectedTokens);
    });
});
