import ParserError from '../Errors/ParserError';
import {
    ArrayLiteralExpr,
    ArrayTypeDeclarationStmt,
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
    ObjectAccessExpr,
    ObjectLiteralExpr,
    ObjectTypeDeclarationStmt,
    ReturnStmt,
    StringLiteralExpr,
    TemplateLiteralExpr,
    TernaryExpr,
    TupleLiteralExpr,
    TupleTypeDeclarationStmt,
    UnaryExpr,
    VariableDeclarationExpr,
    WhileUntilStmt,
} from '../Expr';
import ValueType from '../Interpreter/ValueType';
import Lexer from '../Lexer/Lexer';
import Token from '../Lexer/Token';
import TokenType from '../Lexer/TokenType';
import ExprType from './ExprType';

class Parser {
    private tokens: Token[] = [];
    private index: number = 0;

    parse(tokens: Token[]): Expr[] {
        this.tokens = tokens;
        const stmts: Expr[] = [];

        while (!this.isEOF()) {
            stmts.push(this.parseExpr());
        }
        return stmts;
    }

    parseExpr(): Expr {
        const expr = this.parseAssignment();

        this.optional(TokenType.SEMICOLON_TOKEN);

        return expr;
    }

    parseAssignment(): Expr {
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

    parseTernary(): Expr {
        let expr = this.parseLogical();

        if (this.optional(TokenType.QUESTION_MARK_TOKEN)) {
            const thenBranch = this.parseExpr();
            this.consume(TokenType.COLON_TOKEN, 'Expected ":" after ternary expression');
            const elseBranch = this.parseExpr();

            expr = new TernaryExpr(expr, thenBranch, elseBranch);
        }

        return expr;
    }

    parseLogical(): Expr {
        let expr = this.parseComparison();

        while (!this.isEOF() && (this.peek().type === TokenType.AND_TOKEN || this.peek().type === TokenType.OR_TOKEN)) {
            const operator = this.consume(this.peek().type);
            const right = this.parseComparison();
            expr = new BinaryExpr(expr, operator, right);
        }

        return expr;
    }

    parseComparison(): Expr {
        let expr = this.parseAddition();

        while (
            (!this.isEOF() && this.peek().type === TokenType.EQUAL_TOKEN) ||
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

    parseAddition(): Expr {
        let expr = this.parseMultiplication();

        while (
            !this.isEOF() &&
            (this.peek().type === TokenType.PLUS_TOKEN || this.peek().type === TokenType.MINUS_TOKEN)
        ) {
            const operator = this.consume(this.peek().type);
            const right = this.parseMultiplication();
            expr = new BinaryExpr(expr, operator, right);
        }

        return expr;
    }

    parseMultiplication(): Expr {
        let expr = this.parseUnary();

        while (
            !this.isEOF() &&
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

    parseUnary(): Expr {
        const expr = this.parsePrimary();

        if (this.peek().type === TokenType.INCREMENT_TOKEN || this.peek().type === TokenType.DECREMENT_TOKEN) {
            const operator = this.consume(this.peek().type);
            return new UnaryExpr(operator, expr);
        }

        return expr;
    }

    parsePrimary(): Expr {
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
            return this.parseGroupingOrTupleLiteral();
        }

        if (expr.type === TokenType.OPEN_CURLY_TOKEN) {
            return this.parseObjectLiteral();
        }

        if (expr.type === TokenType.OPEN_BRACKET_TOKEN) {
            return this.parseArrayLiteral();
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

            if (name.value === 'type') {
                return this.parseTypeDeclaration();
            }

            if (this.peek(1).type === TokenType.OPEN_PAREN_TOKEN) return this.parseFunctionCall();
            if (this.peek(1).type == TokenType.DOT_TOKEN) return this.parseObjectAccess();

            return new IdentifierExpr(this.consume(TokenType.IDENTIFIER_TOKEN).value);
        }

        throw new ParserError(`Expected a primary expression but got ${expr.type}`, expr);
    }

    parseArrayLiteral(): Expr {
        this.consume(TokenType.OPEN_BRACKET_TOKEN);
        const values: Expr[] = [];
        while (!this.isEOF() && this.peek().type !== TokenType.CLOSE_BRACKET_TOKEN) {
            values.push(this.parseExpr());
            this.optional(TokenType.COMMA_TOKEN);
        }
        this.consume(TokenType.CLOSE_BRACKET_TOKEN, 'Missing ] after array values');
        return new ArrayLiteralExpr(values);
    }

    parseObjectAccess(): Expr {
        const name = this.consume(TokenType.IDENTIFIER_TOKEN);
        this.consume(TokenType.DOT_TOKEN);
        const field = this.consume(TokenType.IDENTIFIER_TOKEN);
        return new ObjectAccessExpr(new IdentifierExpr(name.value), field);
    }

    parseTypeDeclaration(): Expr {
        this.consume(TokenType.IDENTIFIER_TOKEN);
        const name = this.consume(TokenType.IDENTIFIER_TOKEN, 'Missing type name');
        if (this.peek().type === TokenType.OPEN_CURLY_TOKEN) {
            return this.parseObjectTypeDeclaration(name);
        }
        if (this.peek().type === TokenType.OPEN_BRACKET_TOKEN) {
            return this.parseArrayTypeDeclaration(name);
        }

        if (this.peek().type === TokenType.OPEN_PAREN_TOKEN) {
            return this.parseTupleTypeDeclaration(name);
        }

        throw new ParserError('Invalid type declaration', this.peek());
    }

    private parseTupleTypeDeclaration(name: Token) {
        this.consume(TokenType.OPEN_PAREN_TOKEN, 'Missing ( after type name');
        const types: Token[] = [];
        while (!this.isEOF() && this.peek().type !== TokenType.CLOSE_PAREN_TOKEN) {
            const type = this.consume(TokenType.IDENTIFIER_TOKEN, 'Missing type');
            types.push(type);
            this.optional(TokenType.COMMA_TOKEN);
        }
        this.consume(TokenType.CLOSE_PAREN_TOKEN, 'Missing ) after type parameters');
        if (types.length < 2) throw new ParserError('Tuple must have at least 2 types', this.peek());
        return new TupleTypeDeclarationStmt(name, types);
    }

    private parseArrayTypeDeclaration(name: Token) {
        this.consume(TokenType.OPEN_BRACKET_TOKEN, 'Missing [ after type name');
        const type = this.consume(TokenType.IDENTIFIER_TOKEN, 'Missing type of array');
        this.consume(TokenType.CLOSE_BRACKET_TOKEN, 'Missing ] after type of array');
        return new ArrayTypeDeclarationStmt(name, type);
    }

    private parseObjectTypeDeclaration(name: Token) {
        this.consume(TokenType.OPEN_CURLY_TOKEN, 'Missing { after type name');
        const fields: [Token, Token][] = [];
        while (!this.isEOF() && this.peek().type !== TokenType.CLOSE_CURLY_TOKEN) {
            const name = this.consume(TokenType.IDENTIFIER_TOKEN, 'Missing field name');
            this.consume(TokenType.COLON_TOKEN, 'Missing : after field name');
            const type = this.consume(TokenType.IDENTIFIER_TOKEN, 'Missing type of field');
            fields.push([name, type]);
            this.optional(TokenType.COMMA_TOKEN);
        }
        this.consume(TokenType.CLOSE_CURLY_TOKEN, 'Missing } after type fields');
        return new ObjectTypeDeclarationStmt(name, fields);
    }

    parseWhileUntil(): WhileUntilStmt {
        const type = this.consume(TokenType.IDENTIFIER_TOKEN);
        this.consume(TokenType.OPEN_PAREN_TOKEN, `Expected '(' after ${type.value}`);
        const condition = this.parseExpr();
        this.consume(TokenType.CLOSE_PAREN_TOKEN, `Expected ')' after ${type.value} condition`);
        const failsafe: Expr | null = this.peek().type === TokenType.OPEN_CURLY_TOKEN ? null : this.parseExpr();
        const body = this.parseBlock();

        const exprType = type.value === 'until' ? ExprType.UNTIL_STMT : ExprType.WHILE_STMT;

        return new WhileUntilStmt(exprType, condition, failsafe, body);
    }

    parseDoWhileUntil(): DoWhileUntilStmt {
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

    parseTemplateLiteral(): TemplateLiteralExpr {
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
                const tokens: Token[] = new Lexer().tokenize(literalExpr);

                exprs.push(...new Parser().parse(tokens));

                exprs.push(new StringLiteralExpr(part.slice(end + 1)));
            }
            const filteredExprs = exprs.filter((expr) => !(expr instanceof EmptyExpr));
            return new TemplateLiteralExpr(filteredExprs);
        }
        return new TemplateLiteralExpr([new StringLiteralExpr(value)]);
    }

    parseFunctionDeclaration(): FunctionDeclarationExpr {
        this.consume(TokenType.IDENTIFIER_TOKEN);
        const name =
            this.optional(TokenType.IDENTIFIER_TOKEN) ||
            new Token(TokenType.IDENTIFIER_TOKEN, `anonymous_${this.peek().line}_${Date.now()}_${Math.random()}`, 0);
        this.consume(TokenType.OPEN_PAREN_TOKEN);
        const params: [Token, string][] = [];
        while (!this.isEOF() && this.peek().type !== TokenType.CLOSE_PAREN_TOKEN) {
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

    parseFunctionCall(): Expr {
        const name = this.consume(TokenType.IDENTIFIER_TOKEN);
        this.consume(TokenType.OPEN_PAREN_TOKEN, 'Missing ( after function name');
        const args: Expr[] = [];

        while (!this.isEOF() && this.peek().type !== TokenType.CLOSE_PAREN_TOKEN) {
            args.push(this.parseExpr());
            this.optional(TokenType.COMMA_TOKEN);
        }

        this.consume(TokenType.CLOSE_PAREN_TOKEN, 'Missing ) after function arguments');

        return new FunctionCallExpr(name, args);
    }

    parseFor(): ForStmt {
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

    parseVariableDeclaration(): VariableDeclarationExpr {
        const type = this.consume(TokenType.IDENTIFIER_TOKEN);
        const name = this.consume(TokenType.IDENTIFIER_TOKEN, 'Missing variable name');
        this.consume(TokenType.COLON_TOKEN, 'Missing : after variable name');
        const typeOf = this.consume(TokenType.IDENTIFIER_TOKEN, 'Missing type of variable');

        this.consume(TokenType.ASSIGNMENT_TOKEN, 'Missing = after variable declaration');
        const value = this.peek().type === TokenType.OPEN_CURLY_TOKEN ? this.parseObjectLiteral() : this.parseExpr();

        return new VariableDeclarationExpr(name, typeOf, value, type.value === 'const');
    }

    parseObjectLiteral(): Expr {
        this.consume(TokenType.OPEN_CURLY_TOKEN);
        const fields: [Token, Expr][] = [];
        while (!this.isEOF() && this.peek().type !== TokenType.CLOSE_CURLY_TOKEN) {
            const name = this.consume(TokenType.IDENTIFIER_TOKEN, 'Missing field name');
            this.consume(TokenType.COLON_TOKEN, 'Missing : after field name');
            const value = this.parseExpr();
            fields.push([name, value]);
            this.optional(TokenType.COMMA_TOKEN);
        }
        this.consume(TokenType.CLOSE_CURLY_TOKEN, 'Missing } after object fields');
        return new ObjectLiteralExpr(fields);
    }

    parseIf(): IfStmt {
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

    parseBlock(): BlockStmt {
        this.consume(TokenType.OPEN_CURLY_TOKEN, "Missing { on block's start");
        const stmts: Expr[] = [];

        while (!this.isEOF() && this.peek().type !== TokenType.CLOSE_CURLY_TOKEN) {
            stmts.push(this.parseExpr());
        }

        this.consume(TokenType.CLOSE_CURLY_TOKEN, "Missing } on block's end");
        return new BlockStmt(stmts);
    }

    parseGroupingOrTupleLiteral(): Expr {
        this.consume(TokenType.OPEN_PAREN_TOKEN);
        const expr = this.parseExpr();
        if (this.peek().type === TokenType.COMMA_TOKEN) {
            const values: Expr[] = [expr];
            while (!this.isEOF() && this.peek().type !== TokenType.CLOSE_PAREN_TOKEN) {
                this.consume(TokenType.COMMA_TOKEN);
                values.push(this.parseExpr());
            }
            this.consume(TokenType.CLOSE_PAREN_TOKEN, 'Missing closing parenthesis )');
            return new TupleLiteralExpr(values);
        }
        this.consume(TokenType.CLOSE_PAREN_TOKEN, 'Missing closing parenthesis )');
        return expr;
    }

    peek(index = 0): Token {
        if (this.tokens.length <= this.index + index)
            return new Token(TokenType.EOF_TOKEN, '', this.tokens[this.tokens.length - 1]?.line ?? 0);
        return this.tokens[this.index + index];
    }

    optional(type: TokenType): Token | null {
        if (this.peek().type === type) {
            return this.tokens[this.index++] as Token;
        }
        return null;
    }

    consume(type: TokenType, message?: string): Token {
        if (this.peek().type == type) return this.optional(type) as Token;
        throw new ParserError(message || `Expected ${type} but got ${this.peek().type}}`, this.peek());
    }

    isEOF(): boolean {
        return this.peek().type === TokenType.EOF_TOKEN || this.index >= this.tokens.length;
    }
}

export default Parser;
