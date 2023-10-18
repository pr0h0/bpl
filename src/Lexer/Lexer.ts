import LexerError from '../Errors/LexerError';
import Token from './Token';
import TokenType from './TokenType';

class Lexer {
    private static tokens: string[] = [];
    private static line: number = 1;

    public static tokenize(input: string): Token[] {
        this.tokens = input.split('');
        this.line = 1;

        return this.parseTokens();
    }

    private static parseTokens(): Token[] {
        const tokens: Token[] = [];

        while (this.tokens.length > 0) {
            const token: Token | null = this.parseToken();

            if (token !== null) {
                tokens.push(token);
            }
        }

        tokens.push(new Token(TokenType.EOF_TOKEN, 'EOF', this.line));
        return tokens;
    }
    private static parseToken(): Token | null {
        const token = this.consume();
        if (token === '\n') {
            this.line++;
            return null;
        }
        if ([' ', '\t', '\r'].includes(token)) return null;

        if (token === '(') return new Token(TokenType.OPEN_PAREN_TOKEN, token, this.line);
        if (token === ')') return new Token(TokenType.CLOSE_PAREN_TOKEN, token, this.line);
        if (token === '[') return new Token(TokenType.OPEN_BRACKET_TOKEN, token, this.line);
        if (token === ']') return new Token(TokenType.CLOSE_BRACKET_TOKEN, token, this.line);
        if (token === '{') return new Token(TokenType.OPEN_CURLY_TOKEN, token, this.line);
        if (token === '}') return new Token(TokenType.CLOSE_CURLY_TOKEN, token, this.line);
        if (token === ',') return new Token(TokenType.COMMA_TOKEN, token, this.line);
        if (token === '.') return new Token(TokenType.DOT_TOKEN, token, this.line);
        if (token === ';') return new Token(TokenType.SEMICOLON_TOKEN, token, this.line);
        if (token === ':') return new Token(TokenType.COLON_TOKEN, token, this.line);
        if (token === '?') return new Token(TokenType.QUESTION_MARK_TOKEN, token, this.line);
        if (token === '@') return new Token(TokenType.AT_TOKEN, token, this.line);

        if (token === '!') return this.parseBangToken(token);
        if (token === '+') return this.parsePlusToken(token);
        if (token === '-') return this.parseMinusToken(token);
        if (token === '*') return this.parseStarToken(token);
        if (token === '/') return this.parseSlashToken(token);
        if (token === '%') return this.parseModuloToken(token);
        if (token === '=') return this.parseEqualToken(token);
        if (token === '<') return this.parseLessToken(token);
        if (token === '>') return this.parseGreaterToken(token);
        if (token === '&') return this.parseAndToken(token);
        if (token === '|') return this.parseOrToken(token);

        if ('\'"'.includes(token)) return this.parseStringLiteralToken(token);
        if (token === '`') return this.parseTemplateLiteralToken(token);

        if ('0123456789'.includes(token)) return this.parseNumberLiteralToken(token);

        if (/[a-zA-Z_]/.test(token)) return this.parseIdentifierToken(token);

        throw new LexerError(`Unexpected token '${token}'`, this.line);
    }

    static parseTemplateLiteralToken(token: string): Token | null {
        let openCount = 1;
        let str = '';
        while (this.tokens.length) {
            if (this.seek() === token) {
                openCount--;
                if (openCount === 0) break;
            }
            if (this.seek() === '\n') this.line++;
            str += this.consume();
        }

        if (openCount !== 0) throw new LexerError('Unterminated template literal', this.line);

        this.consume();
        return new Token(TokenType.TEMPLATE_LITERAL_TOKEN, str, this.line);
    }

    static parseIdentifierToken(token: string): Token | null {
        let identifier = token;
        while (/[a-zA-Z0-9_]/.test(this.seek() || '')) {
            identifier += this.consume();
        }

        return new Token(TokenType.IDENTIFIER_TOKEN, identifier, this.line);
    }

    static parseNumberLiteralToken(token: string): Token | null {
        let number = token;
        while (this.tokens.length && '0123456789.'.includes(this.seek())) {
            number += this.consume();
        }

        const parsedNumber = Number(number);

        if (isNaN(parsedNumber)) throw new LexerError(`Invalid number literal: '${number}'`, this.line);
        return new Token(TokenType.NUMBER_LITERAL_TOKEN, number, this.line);
    }
    static parseStringLiteralToken(token: string): Token | null {
        let str = '';
        while (
            this.tokens.length &&
            (this.seek() !== token || (this.seek() === token && str.length && str.endsWith('\\')))
        ) {
            if (this.seek() === '\n') throw new LexerError('Unterminated string literal', this.line);
            str += this.consume();
        }

        if (this.tokens.length === 0 && !str.endsWith(token))
            throw new LexerError('Unterminated string literal', this.line);
        this.consume();
        return new Token(TokenType.STRING_LITERAL_TOKEN, str, this.line);
    }

    static parseLessToken(token: string): Token | null {
        if (this.seek() === '=') {
            return new Token(TokenType.LESS_OR_EQUAL_TOKEN, token + this.consume(), this.line);
        }
        return new Token(TokenType.LESS_THEN_TOKEN, token, this.line);
    }
    static parseGreaterToken(token: string): Token | null {
        if (this.seek() === '=') {
            return new Token(TokenType.GREATER_OR_EQUAL_TOKEN, token + this.consume(), this.line);
        }
        return new Token(TokenType.GREATER_THEN_TOKEN, token, this.line);
    }
    static parseAndToken(token: string): Token | null {
        if (this.seek() === '&') {
            return new Token(TokenType.AND_TOKEN, token + this.consume(), this.line);
        }
        throw new LexerError("Unexpected single '&' token", this.line);
    }
    static parseOrToken(token: string): Token | null {
        if (this.seek() === '|') {
            return new Token(TokenType.OR_TOKEN, token + this.consume(), this.line);
        }
        throw new LexerError("Unexpected single '|' token", this.line);
    }
    static parseEqualToken(token: string): Token | null {
        if (this.seek() === '=') {
            return new Token(TokenType.EQUAL_TOKEN, token + this.consume(), this.line);
        }
        return new Token(TokenType.ASSIGNMENT_TOKEN, token, this.line);
    }
    static parseSlashToken(token: string): Token | null {
        // Single line comment
        if (this.seek() === '/') {
            this.consume();
            while (this.tokens.length && this.seek() !== '\n') {
                this.consume();
            }
            this.consume(); // Consume the \n
            this.line++;
            return null;
        }
        // Multi line comment
        if (this.seek() === '*') {
            this.consume();
            while (this.tokens.length) {
                if (this.seek() === '\n') this.line++;
                if (this.seek() === '*' && this.seek(1) === '/') break;
                this.consume();
            }
            this.consume();
            this.consume();
            return null;
        }
        if (this.seek() === '=') {
            return new Token(TokenType.SLASH_EQUAL_TOKEN, token + this.consume(), this.line);
        }
        return new Token(TokenType.SLASH_TOKEN, token, this.line);
    }
    static parseModuloToken(token: string): Token | null {
        if (this.seek() === '=') {
            return new Token(TokenType.MODULO_EQUAL_TOKEN, token + this.consume(), this.line);
        }
        return new Token(TokenType.MODULO_TOKEN, token, this.line);
    }
    static parseStarToken(token: string): Token | null {
        if (this.seek() === '=') {
            return new Token(TokenType.STAR_EQUAL_TOKEN, token + this.consume(), this.line);
        }
        return new Token(TokenType.STAR_TOKEN, token, this.line);
    }
    static parseMinusToken(token: string): Token | null {
        if (this.seek() === '-') {
            return new Token(TokenType.DECREMENT_TOKEN, token + this.consume(), this.line);
        }
        if (this.seek() === '=') {
            return new Token(TokenType.MINUS_EQUAL_TOKEN, token + this.consume(), this.line);
        }
        return new Token(TokenType.MINUS_TOKEN, token, this.line);
    }
    static parseBangToken(token: string): Token | null {
        if (this.seek() === '=') {
            return new Token(TokenType.NOT_EQUAL_TOKEN, token + this.consume(), this.line);
        }
        return new Token(TokenType.BANG_TOKEN, token, this.line);
    }
    static parsePlusToken(token: string): Token | null {
        if (this.seek() === '+') {
            return new Token(TokenType.INCREMENT_TOKEN, token + this.consume(), this.line);
        }
        if (this.seek() === '=') {
            return new Token(TokenType.PLUS_EQUAL_TOKEN, token + this.consume(), this.line);
        }
        return new Token(TokenType.PLUS_TOKEN, token, this.line);
    }

    private static seek(index: number = 0): string {
        return this.tokens[index];
    }
    private static consume(): string {
        if (this.tokens.length === 0) throw new LexerError('Unexpected EOF', this.line);
        return this.tokens.shift() as string;
    }
}

export default Lexer;
