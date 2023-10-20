import ParserError from '../Errors/ParserError';
import ValueType from '../Interpreter/ValueType';
import Lexer from '../Lexer/Lexer';
import Token from '../Lexer/Token';
import TokenType from '../Lexer/TokenType';
import {
    AssignmentExpr,
    BinaryExpr,
    BlockStmt,
    BooleanLiteralExpr,
    BreakStmt,
    ContinueStmt,
    DoWhileUntilStmt,
    EmptyExpr,
    Expr,
    ForStmt,
    FunctionCallExpr,
    FunctionDeclarationExpr,
    IdentifierExpr,
    IfStmt,
    NullLiteralExpr,
    NumberLiteralExpr,
    ReturnStmt,
    StringLiteralExpr,
    TemplateLiteralExpr,
    TernaryExpr,
    UnaryExpr,
    VariableDeclarationExpr,
    WhileUntilStmt,
} from './Expr';
import ExprType from './ExprType';

class Parser {
    static tokens: Token[];

    static parse(tokens: Token[]): Expr[] {
        this.tokens = tokens;
        const stmts: Expr[] = [];

        while (this.tokens.length) {
            stmts.push(this.parseExpr());
        }
        return stmts;
    }

    static parseExpr(): Expr {
        const expr = this.parseAssignment();

        this.optional(TokenType.SEMICOLON_TOKEN);

        return expr;
    }

    static parseAssignment(): Expr {
        const expr = this.parseTernary();

        if (this.optional(TokenType.ASSIGNMENT_TOKEN)) {
            const value = this.parseTernary();

            if (expr instanceof IdentifierExpr) {
                return new AssignmentExpr(new Token(TokenType.IDENTIFIER_TOKEN, expr.value), value);
            }

            throw new ParserError('Invalid assignment target', expr as unknown as Token);
        }

        return expr;
    }

    static parseTernary(): Expr {
        let expr = this.parseLogical();

        if (this.optional(TokenType.QUESTION_MARK_TOKEN)) {
            const thenBranch = this.parseExpr();
            this.consume(TokenType.COLON_TOKEN, 'Expected ":" after ternary expression');
            const elseBranch = this.parseExpr();

            expr = new TernaryExpr(expr, thenBranch, elseBranch);
        }

        return expr;
    }

    static parseLogical(): Expr {
        let expr = this.parseComparison();

        while (
            this.tokens.length &&
            (this.peek().type === TokenType.AND_TOKEN || this.peek().type === TokenType.OR_TOKEN)
        ) {
            const operator = this.consume(this.peek().type);
            const right = this.parseComparison();
            expr = new BinaryExpr(expr, operator, right);
        }

        return expr;
    }

    static parseComparison(): Expr {
        let expr = this.parseAddition();

        while (
            (this.tokens.length && this.peek().type === TokenType.EQUAL_TOKEN) ||
            this.peek().type === TokenType.NOT_EQUAL_TOKEN ||
            this.peek().type === TokenType.GREATER_THEN_TOKEN ||
            this.peek().type === TokenType.GREATER_OR_EQUAL_TOKEN ||
            this.peek().type === TokenType.LESS_THEN_TOKEN ||
            this.peek().type === TokenType.LESS_OR_EQUAL_TOKEN
        ) {
            const operator = this.consume(this.peek().type);
            const right = this.parseAddition();
            expr = new BinaryExpr(expr, operator, right);
        }

        return expr;
    }

    static parseAddition(): Expr {
        let expr = this.parseMultiplication();

        while (
            this.tokens.length &&
            (this.peek().type === TokenType.PLUS_TOKEN || this.peek().type === TokenType.MINUS_TOKEN)
        ) {
            const operator = this.consume(this.peek().type);
            const right = this.parseMultiplication();
            expr = new BinaryExpr(expr, operator, right);
        }

        return expr;
    }

    static parseMultiplication(): Expr {
        let expr = this.parseUnary();

        while (
            this.tokens.length &&
            (this.peek().type === TokenType.STAR_TOKEN ||
                this.peek().type === TokenType.EXPONENT_TOKEN ||
                this.peek().type === TokenType.SLASH_TOKEN ||
                this.peek().type === TokenType.MODULO_TOKEN)
        ) {
            const operator = this.consume(this.peek().type);
            const right = this.parseUnary();
            expr = new BinaryExpr(expr, operator, right);
        }

        return expr;
    }

    static parseUnary(): Expr {
        const expr = this.parsePrimary();

        if (this.peek().type === TokenType.INCREMENT_TOKEN || this.peek().type === TokenType.DECREMENT_TOKEN) {
            const operator = this.consume(this.peek().type);
            return new UnaryExpr(operator, expr);
        }

        return expr;
    }

    static parsePrimary(): Expr {
        const expr = this.peek();
        if (expr.type === TokenType.NUMBER_LITERAL_TOKEN) {
            return new NumberLiteralExpr(Number(this.consume(TokenType.NUMBER_LITERAL_TOKEN).value));
        }

        if (expr.type === TokenType.STRING_LITERAL_TOKEN) {
            return new StringLiteralExpr(this.consume(TokenType.STRING_LITERAL_TOKEN).value);
        }

        if (expr.type === TokenType.TEMPLATE_LITERAL_TOKEN) {
            return this.parseTemplateLiteral();
        }

        if (expr.type === TokenType.OPEN_PAREN_TOKEN) {
            return this.parseGrouping();
        }

        if (expr.type === TokenType.OPEN_CURLY_TOKEN) {
            return this.parseBlock();
        }

        if (expr.type === TokenType.EOF_TOKEN) {
            this.consume(TokenType.EOF_TOKEN);
            return new EmptyExpr();
        }

        if (expr.type === TokenType.IDENTIFIER_TOKEN) {
            const name = this.peek();
            if (name.value === 'if') {
                return this.parseIf();
            }
            if (name.value === 'var' || name.value === 'const') {
                return this.parseVariableDeclaration();
            }
            if (name.value === 'for') {
                return this.parseFor();
            }
            if (name.value === 'while' || name.value === 'until') {
                return this.parseWhileUntil();
            }
            if (name.value === 'do') {
                return this.parseDoWhileUntil();
            }
            if (name.value === 'true' || name.value === 'false') {
                return new BooleanLiteralExpr(this.consume(TokenType.IDENTIFIER_TOKEN).value === 'true');
            }
            if (name.value === 'null') {
                this.consume(TokenType.IDENTIFIER_TOKEN);
                return new NullLiteralExpr();
            }

            if (name.value === 'return') {
                this.consume(TokenType.IDENTIFIER_TOKEN);
                return new ReturnStmt(this.parseExpr());
            }

            if (name.value === 'continue') {
                this.consume(TokenType.IDENTIFIER_TOKEN);
                return new ContinueStmt();
            }

            if (name.value === 'break') {
                this.consume(TokenType.IDENTIFIER_TOKEN);
                return new BreakStmt();
            }

            if (name.value === 'func') {
                return this.parseFunctionDeclaration();
            }

            if (this.peek(1).type === TokenType.OPEN_PAREN_TOKEN) return this.parseFunctionCall();

            return new IdentifierExpr(this.consume(TokenType.IDENTIFIER_TOKEN).value);
        }

        throw new ParserError(`Expected a primary expression but got ${expr.type}`, expr);
    }

    static parseWhileUntil(): WhileUntilStmt {
        const type = this.consume(TokenType.IDENTIFIER_TOKEN);
        this.consume(TokenType.OPEN_PAREN_TOKEN, `Expected '(' after ${type.value}`);
        const condition = this.parseExpr();
        this.consume(TokenType.CLOSE_PAREN_TOKEN, `Expected ')' after ${type.value} condition`);
        const failsafe: Expr | null = this.peek().type === TokenType.OPEN_CURLY_TOKEN ? null : this.parseExpr();
        const body = this.parseBlock();

        const exprType = type.value === 'until' ? ExprType.UNTIL_STMT : ExprType.WHILE_STMT;

        return new WhileUntilStmt(exprType, condition, failsafe, body);
    }

    static parseDoWhileUntil(): DoWhileUntilStmt {
        this.consume(TokenType.IDENTIFIER_TOKEN);
        const failsafe = this.peek().type === TokenType.OPEN_CURLY_TOKEN ? null : this.parseExpr();

        const body = this.parseBlock();
        const type = this.consume(TokenType.IDENTIFIER_TOKEN, 'Expected "while" or "until" after do\'s body');
        this.consume(TokenType.OPEN_PAREN_TOKEN, `Expected '(' after ${type.value}`);
        const condition = this.parseExpr();
        this.consume(TokenType.CLOSE_PAREN_TOKEN, `Expected ')' after ${type.value} condition`);

        const exprType = type.value === 'until' ? ExprType.DO_UNTIL_STMT : ExprType.DO_WHILE_STMT;

        return new DoWhileUntilStmt(exprType, condition, failsafe, body);
    }

    static parseTemplateLiteral(): TemplateLiteralExpr {
        const expr = this.consume(TokenType.TEMPLATE_LITERAL_TOKEN);
        const value = expr.value;

        const exprs: Expr[] = [];

        if (value.includes('${')) {
            const parts = value.split('${');
            for (let i = 0; i < parts.length; i++) {
                const part = parts[i];
                if (part === '') continue;
                if (part.trim() === '') {
                    exprs.push(new StringLiteralExpr(part));
                    continue;
                }
                if (i === 0) {
                    exprs.push(new StringLiteralExpr(part));
                    continue;
                }
                const end = part.trimStart().indexOf('}');
                if (end === -1) {
                    exprs.push(new StringLiteralExpr(`\${${part}`));
                    continue;
                }
                if (end === 0) {
                    throw new ParserError('Empty expression', expr);
                }

                const literalExpr = part.slice(0, end);
                const tokens: Token[] = [];
                Lexer.tokenize(literalExpr).forEach((token) => tokens.push(token));

                const currentTokens = this.tokens;
                this.tokens = tokens;

                while (this.tokens.length) {
                    exprs.push(this.parseExpr());
                }

                this.tokens = currentTokens;

                exprs.push(new StringLiteralExpr(part.slice(end + 1)));
            }
            const filteredExprs = exprs.filter((expr) => !(expr instanceof EmptyExpr));
            return new TemplateLiteralExpr(filteredExprs);
        }
        return new TemplateLiteralExpr([new StringLiteralExpr(value)]);
    }

    static parseFunctionDeclaration(): FunctionDeclarationExpr {
        this.consume(TokenType.IDENTIFIER_TOKEN);
        const name =
            this.optional(TokenType.IDENTIFIER_TOKEN) ||
            new Token(TokenType.IDENTIFIER_TOKEN, `anonymous_${this.peek().line}_${Date.now()}_${Math.random()}`, 0);
        this.consume(TokenType.OPEN_PAREN_TOKEN);
        const params: [Token, string][] = [];
        while (this.tokens.length && this.peek().type !== TokenType.CLOSE_PAREN_TOKEN) {
            const name = this.consume(TokenType.IDENTIFIER_TOKEN, 'Missing parameter name');
            this.consume(TokenType.COLON_TOKEN, 'Missing : after parameter name');
            const type = this.consume(TokenType.IDENTIFIER_TOKEN, 'Missing type of parameter');
            params.push([name, type.value]);
            this.optional(TokenType.COMMA_TOKEN);
        }

        this.consume(TokenType.CLOSE_PAREN_TOKEN, 'Missing ) after function parameters');
        let typeOf: Token = new Token(TokenType.IDENTIFIER_TOKEN, ValueType.VOID, 0);
        if (this.peek().type === TokenType.COLON_TOKEN) {
            this.consume(TokenType.COLON_TOKEN, 'Missing : after function parameters');
            typeOf = this.consume(TokenType.IDENTIFIER_TOKEN, 'Missing return type of function');
        }

        const body = this.parseBlock();

        return new FunctionDeclarationExpr(name, params, body, typeOf);
    }

    static parseFunctionCall(): Expr {
        const name = this.consume(TokenType.IDENTIFIER_TOKEN);
        this.consume(TokenType.OPEN_PAREN_TOKEN, 'Missing ( after function name');
        const args: Expr[] = [];

        while (this.tokens.length && this.peek().type !== TokenType.CLOSE_PAREN_TOKEN) {
            args.push(this.parseExpr());
            this.optional(TokenType.COMMA_TOKEN);
        }

        this.consume(TokenType.CLOSE_PAREN_TOKEN, 'Missing ) after function arguments');

        return new FunctionCallExpr(name, args);
    }

    static parseFor(): ForStmt {
        this.consume(TokenType.IDENTIFIER_TOKEN);
        this.consume(TokenType.OPEN_PAREN_TOKEN, 'Missing ( after for');
        const initializer = this.peek().type === TokenType.SEMICOLON_TOKEN ? null : this.parseExpr();
        this.optional(TokenType.SEMICOLON_TOKEN);
        const condition = this.peek().type === TokenType.SEMICOLON_TOKEN ? null : this.parseExpr();
        this.optional(TokenType.SEMICOLON_TOKEN);
        const increment = this.peek().type === TokenType.CLOSE_PAREN_TOKEN ? null : this.parseExpr();
        this.consume(TokenType.CLOSE_PAREN_TOKEN, 'Missing ) after for');
        const failsafe = this.peek().type === TokenType.OPEN_CURLY_TOKEN ? null : this.parseExpr();
        const body = this.parseBlock();

        return new ForStmt(initializer, condition, increment, failsafe, body);
    }

    static parseVariableDeclaration(): VariableDeclarationExpr {
        const type = this.consume(TokenType.IDENTIFIER_TOKEN);
        const name = this.consume(TokenType.IDENTIFIER_TOKEN, 'Missing variable name');
        this.consume(TokenType.COLON_TOKEN, 'Missing : after variable name');
        const typeOf = this.consume(TokenType.IDENTIFIER_TOKEN, 'Missing type of variable');

        this.consume(TokenType.ASSIGNMENT_TOKEN, 'Missing = after variable declaration');
        const value = this.parseExpr();

        return new VariableDeclarationExpr(name, typeOf, value, type.value === 'const');
    }

    static parseIf(): IfStmt {
        this.consume(TokenType.IDENTIFIER_TOKEN);
        this.consume(TokenType.OPEN_PAREN_TOKEN, 'Missing ( after if');
        const condition = this.parseExpr();
        this.consume(TokenType.CLOSE_PAREN_TOKEN, "Missing ) after if's condition");
        const thenBranch = this.parseBlock();

        let elseBranch: BlockStmt | IfStmt | null = null;
        if (this.peek().type === TokenType.IDENTIFIER_TOKEN && this.peek().value === 'else') {
            this.consume(TokenType.IDENTIFIER_TOKEN);
            elseBranch =
                this.peek().type === TokenType.IDENTIFIER_TOKEN && this.peek().value === 'if'
                    ? this.parseIf()
                    : this.parseBlock();
        }

        return new IfStmt(condition, thenBranch, elseBranch);
    }

    static parseBlock(): BlockStmt {
        this.consume(TokenType.OPEN_CURLY_TOKEN, "Missing { on block's start");
        const stmts: Expr[] = [];

        while (this.tokens.length && this.peek().type !== TokenType.CLOSE_CURLY_TOKEN) {
            stmts.push(this.parseExpr());
        }

        this.consume(TokenType.CLOSE_CURLY_TOKEN, "Missing } on block's end");
        return new BlockStmt(stmts);
    }

    static parseGrouping(): Expr {
        this.consume(TokenType.OPEN_PAREN_TOKEN);
        const expr = this.parseExpr();
        this.consume(TokenType.CLOSE_PAREN_TOKEN, 'Missing closing parenthesis )');
        return expr;
    }

    static peek(index = 0): Token {
        if (this.tokens.length <= index)
            return new Token(TokenType.EOF_TOKEN, '', this.tokens[this.tokens.length - 1]?.line ?? 0);
        return this.tokens[index];
    }

    static optional(type: TokenType): Token | null {
        if (this.peek().type === type) {
            return this.tokens.shift() as Token;
        }
        return null;
    }

    static consume(type: TokenType, message?: string): Token {
        if (this.peek().type == type) return this.tokens.shift() as Token;
        throw new ParserError(message || `Expected ${type} but got ${this.peek().type}}`, this.peek());
    }
}

export default Parser;
