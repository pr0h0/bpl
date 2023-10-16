import Token from "../Lexer/Token";
import ExprType from "./ExprType";

export class Expr {
  constructor(public type: ExprType) {}
}

export class EmptyExpr extends Expr {
  constructor() {
    super(ExprType.EMPTY_EXP);
  }
}

export class StringLiteralExpr extends Expr {
  constructor(public value: string) {
    super(ExprType.STRING_LITERAL_EXPR);
  }
}

export class TemplateLiteralExpr extends Expr {
  constructor(public value: Expr[]) {
    super(ExprType.TEMPLATE_LITERAL_TOKEN);
  }
}

export class NumberLiteralExpr extends Expr {
  constructor(public value: number) {
    super(ExprType.NUMBER_LITERAL_EXPR);
  }
}

export class BooleanLiteralExpr extends Expr {
  constructor(public value: boolean) {
    super(ExprType.BOOLEAN_LITERAL_EXPR);
  }
}

export class NullLiteralExpr extends Expr {
  constructor() {
    super(ExprType.NULL_LITERAL_EXPR);
  }
}

export class TypeLiteralExpr extends Expr {
  constructor(public value: string) {
    super(ExprType.TYPE_LITERAL_EXPR);
  }
}

export class IdentifierExpr extends Expr {
  constructor(public value: string) {
    super(ExprType.IDENTIFIER_EXPR);
  }
}

export class AssignmentExpr extends Expr {
  constructor(public name: Token, public value: Expr) {
    super(ExprType.ASSIGNMENT_EXPR);
  }
}

export class BinaryExpr extends Expr {
  constructor(public left: Expr, public operator: Token, public right: Expr) {
    super(ExprType.BINARY_EXPR);
  }
}

export class UnaryExpr extends Expr {
  constructor(public operator: Token, public right: Expr) {
    super(ExprType.UNARY_EXPR);
  }
}

export class GroupingExpr extends Expr {
  constructor(public expression: Expr) {
    super(ExprType.GROUPING_EXPR);
  }
}

export class FunctionCallExpr extends Expr {
  constructor(public callee: Token, public args: Expr[]) {
    super(ExprType.CALL_EXPR);
  }
}

export class Stmt extends Expr {
  constructor(type: ExprType) {
    super(type);
  }
}

export class VariableDeclarationExpr extends Stmt {
  constructor(
    public name: Token,
    public typeOf: Token,
    public value: Expr | null,
    public isConst: boolean = false
  ) {
    super(ExprType.VARIABLE_DECLARATION_EXPR);
  }
}

export class FunctionDeclarationExpr extends Stmt {
  constructor(
    public name: Token,
    public params: [Token, string][],
    public body: BlockStmt,
    public returnType: Token
  ) {
    super(ExprType.FUNCTION_DECLARATION_EXPR);
  }
}

export class IfStmt extends Stmt {
  constructor(
    public condition: Expr,
    public thenBranch: BlockStmt,
    public elseBranch: BlockStmt | IfStmt | null
  ) {
    super(ExprType.IF_STMT);
  }
}

export class TerinaryExpr extends Expr {
  constructor(
    public condition: Expr,
    public thenBranch: Expr,
    public elseBranch: Expr
  ) {
    super(ExprType.TERINARY_EXPR);
  }
}

export class WhileStmt extends Stmt {
  constructor(public condition: Expr, public body: Stmt) {
    super(ExprType.WHILE_STMT);
  }
}

export class ForStmt extends Stmt {
  constructor(
    public initializer: Stmt,
    public condition: Expr,
    public increment: Expr,
    public body: Stmt
  ) {
    super(ExprType.FOR_STMT);
  }
}

export class BlockStmt extends Stmt {
  constructor(public statements: Stmt[]) {
    super(ExprType.BLOCK_STMT);
  }
}

export class ReturnStmt extends Stmt {
  constructor(public value: Expr) {
    super(ExprType.RETURN_STMT);
  }
}

export class BreakStmt extends Stmt {
  constructor() {
    super(ExprType.BREAK_STMT);
  }
}

export class ContinueStmt extends Stmt {
  constructor() {
    super(ExprType.CONTINUE_STMT);
  }
}

export class TypeDeclarationStmt extends Stmt {
  constructor(public name: Token, public members: [Token, Token][]) {
    super(ExprType.TYPE_DECLARATION_STMT);
  }
}
