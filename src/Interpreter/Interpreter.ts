import Environment from "../Environment/Environment";
import BreakStatement from "../Errors/BreakStatement";
import ContinueStatement from "../Errors/ContinueStatement";
import InterpreterError from "../Errors/InterpreterError";
import ReturnStatement from "../Errors/ReturnStatement";
import Token from "../Lexer/Token";
import TokenType from "../Lexer/TokenType";
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
  TerinaryExpr,
  UnaryExpr,
  VariableDeclarationExpr,
  WhileUntilStmt,
} from "../Parser/Expr";
import ExprType from "../Parser/ExprType";
import {
  BooleanValue,
  CustomValue,
  FunctionValue,
  NativeFunctionValue,
  NullValue,
  NumberValue,
  RuntimeValue,
  StringValue,
  TypeValue,
  VoidValue,
} from "./Values";
import ValueType from "./ValueType";

class Interpreter {
  private environment: Environment;

  constructor(env?: Environment) {
    this.environment = env || new Environment();
  }
  public evaluate(stmt: Expr | Expr[]): RuntimeValue | RuntimeValue[] {
    if (Array.isArray(stmt)) {
      const outputs = [];
      for (const expr of stmt) {
        outputs.push(this.evaluateExpr(expr));
      }
      return outputs;
    } else {
      return this.evaluateExpr(stmt);
    }
  }

  private evaluateExpr(expr: Expr): RuntimeValue {
    if (expr instanceof NumberLiteralExpr) {
      return this.evaluateNumberLiteral(expr);
    } else if (expr instanceof StringLiteralExpr) {
      return this.evaluateStringLiteral(expr);
    } else if (expr instanceof BooleanLiteralExpr) {
      return this.evaluateBooleanLiteral(expr);
    } else if (expr instanceof NullLiteralExpr) {
      return this.evaluateNullLiteral(expr);
    } else if (expr instanceof EmptyExpr) {
      return new VoidValue();
    } else if (expr instanceof BinaryExpr) {
      return this.evaluateBinaryExpr(expr);
    } else if (expr instanceof BlockStmt) {
      return this.evaluateBlockStmt(expr);
    } else if (expr instanceof IfStmt) {
      return this.evaluateIfStmt(expr);
    } else if (expr instanceof ReturnStmt) {
      return this.evaluateReturnStmt(expr);
    } else if (expr instanceof BreakStmt) {
      return this.evaluateBreakStmt(expr);
    } else if (expr instanceof ContinueStmt) {
      return this.evaluateContinueStmt(expr);
    } else if (expr instanceof VariableDeclarationExpr) {
      return this.evaluateVariableDeclarationExpr(expr);
    } else if (expr instanceof IdentifierExpr) {
      return this.evaluateIdentifierExpr(expr);
    } else if (expr instanceof FunctionCallExpr) {
      return this.evaluateFunctionCallExpr(expr);
    } else if (expr instanceof ForStmt) {
      return this.evaluateForStmt(expr);
    } else if (expr instanceof UnaryExpr) {
      return this.evaluateUnaryExpr(expr);
    } else if (expr instanceof FunctionDeclarationExpr) {
      return this.evaluateFunctionDeclarationExpr(expr);
    } else if (expr instanceof TerinaryExpr) {
      return this.evaluateTerinaryExpr(expr);
    } else if (expr instanceof AssignmentExpr) {
      return this.evaluateAssignmentExpr(expr);
    } else if (expr instanceof TemplateLiteralExpr) {
      return this.evaluateTemplateLiteralExpr(expr);
    } else if (expr instanceof WhileUntilStmt) {
      return this.evaluateWhileUntilStmt(expr);
    } else if (expr instanceof DoWhileUntilStmt) {
      return this.evaluateDoWhileUntilStmt(expr);
    }

    throw new InterpreterError(
      `Invalid expression: ${expr.constructor.name}`,
      expr
    );
  }

  private evaluateWhileUntilStmt(stmt: WhileUntilStmt): RuntimeValue {
    const interpreter = new Interpreter(new Environment(this.environment));
    if (stmt.type === ExprType.WHILE_STMT) {
      while ((this.evaluateExpr(stmt.condition) as BooleanValue).value) {
        try {
          interpreter.evaluateExpr(stmt.body);
        } catch (err) {
          if (err instanceof BreakStatement) {
            break;
          } else if (err instanceof ContinueStatement) {
            continue;
          }
          throw err;
        }
      }
    } else if (stmt.type === ExprType.UNTIL_STMT) {
      while (!(this.evaluateExpr(stmt.condition) as BooleanValue).value) {
        try {
          interpreter.evaluateExpr(stmt.body);
        } catch (err) {
          if (err instanceof BreakStatement) {
            break;
          } else if (err instanceof ContinueStatement) {
            continue;
          }
          throw err;
        }
      }
    }
    return new VoidValue();
  }

  private evaluateDoWhileUntilStmt(stmt: DoWhileUntilStmt): RuntimeValue {
    const interpreter = new Interpreter(new Environment(this.environment));
    if (stmt.type === ExprType.DO_WHILE_STMT) {
      do {
        try {
          interpreter.evaluate(stmt.body);
        } catch (err) {
          if (err instanceof BreakStatement) {
            break;
          } else if (err instanceof ContinueStatement) {
            continue;
          }
          throw err;
        }
      } while (
        (interpreter.evaluateExpr(stmt.condition) as BooleanValue).value
      );
    } else if (stmt.type === ExprType.DO_UNTIL_STMT) {
      do {
        try {
          interpreter.evaluate(stmt.body);
        } catch (err) {
          if (err instanceof BreakStatement) {
            break;
          } else if (err instanceof ContinueStatement) {
            continue;
          }
          throw err;
        }
      } while (
        !(interpreter.evaluateExpr(stmt.condition) as BooleanValue).value
      );
    }
    return new VoidValue();
  }

  private evaluateTemplateLiteralExpr(expr: TemplateLiteralExpr): RuntimeValue {
    const parts = expr.value;
    const parsed: StringValue[] = parts.map(
      (part) => this.evaluateExpr(part) as StringValue
    );
    let result = "";
    for (let i = 0; i < parsed.length; i++) {
      const value = parsed[i].value;
      const parsedValue =
        value === undefined || value === null ? "" : value.toString();
      result += parsedValue;
    }

    return new StringValue(result);
  }

  private evaluateAssignmentExpr(expr: AssignmentExpr): RuntimeValue {
    const value = this.evaluateExpr(expr.value);
    const variableName = expr.name.value;

    const variable = this.environment.getVariable(variableName);

    if (value.type !== variable[1]) {
      throw new InterpreterError(
        `Invalid assignment type: ${value.type} expected ${variable[1]}`,
        expr
      );
    }

    this.environment.setVariable(variableName, value);
    return value;
  }

  private evaluateTerinaryExpr(expr: TerinaryExpr): RuntimeValue {
    const condition = this.evaluateExpr(expr.condition) as BooleanValue;
    if (condition.type !== ValueType.BOOL) {
      throw new InterpreterError(
        `Invalid if condition type: ${condition.type}`,
        expr
      );
    }
    return this.evaluateExpr(
      condition.value ? expr.thenBranch : expr.elseBranch
    );
  }

  private evaluateFunctionDeclarationExpr(
    expr: FunctionDeclarationExpr
  ): RuntimeValue {
    const func = new FunctionValue(
      expr.name,
      expr.params,
      expr.body,
      expr.returnType.value
    );

    this.environment.defineFunction(expr.name.value, func);
    return new VoidValue();
  }
  private evaluateUnaryExpr(expr: UnaryExpr): RuntimeValue {
    const right = this.evaluateExpr(expr.right);
    switch (expr.operator.type) {
      case TokenType.INCREMENT_TOKEN: {
        if (right.type !== ValueType.NUMBER) {
          throw new InterpreterError(
            `Invalid unary expression: ${expr.operator.value} ${right.type}`,
            expr
          );
        }
        const variableName =
          expr.right.type === ExprType.IDENTIFIER_EXPR
            ? (expr.right as IdentifierExpr).value
            : null;
        if (!variableName) {
          throw new InterpreterError(
            `Invalid unary expression: ${expr.operator.value} ${right.type}`,
            expr
          );
        }
        const variableValue = this.environment.getVariable(variableName);
        this.environment.setVariable(
          variableName,
          new NumberValue((variableValue[0] as NumberValue).value + 1)
        );
        return new NumberValue((right as NumberValue).value + 1);
      }
      case TokenType.DECREMENT_TOKEN: {
        if (right.type !== ValueType.NUMBER) {
          throw new InterpreterError(
            `Invalid unary expression: ${expr.operator.value} ${right.type}`,
            expr
          );
        }
        const variableName =
          expr.right.type === ExprType.IDENTIFIER_EXPR
            ? (expr.right as IdentifierExpr).value
            : null;
        if (!variableName) {
          throw new InterpreterError(
            `Invalid unary expression: ${expr.operator.value} ${right.type}`,
            expr
          );
        }
        const variableValue = this.environment.getVariable(variableName);
        this.environment.setVariable(
          variableName,
          new NumberValue((variableValue[0] as NumberValue).value - 1)
        );
        return new NumberValue((right as NumberValue).value - 1);
      }
      case TokenType.MINUS_TOKEN:
        if (right.type !== ValueType.NUMBER) {
          throw new InterpreterError(
            `Invalid unary expression: ${expr.operator.value} ${right.type}`,
            expr
          );
        }
        return new NumberValue(-(right as NumberValue).value);
      case TokenType.BANG_TOKEN:
        if (right.type !== ValueType.BOOL) {
          throw new InterpreterError(
            `Invalid unary expression: ${expr.operator.value} ${right.type}`,
            expr
          );
        }
        return new BooleanValue(!(right as BooleanValue).value);
      default:
        throw new InterpreterError(
          `Invalid unary expression: ${expr.operator.value}`,
          expr
        );
    }
  }
  private evaluateForStmt(stmt: ForStmt): RuntimeValue {
    const interpreter = new Interpreter(new Environment(this.environment));
    if (stmt.initializer) {
      interpreter.evaluateExpr(stmt.initializer);
    }
    while (true) {
      if (stmt.condition) {
        const condition = interpreter.evaluateExpr(
          stmt.condition
        ) as BooleanValue;
        if (!condition.value) {
          break;
        }
      }
      try {
        interpreter.evaluateExpr(stmt.body);
      } catch (err) {
        if (err instanceof BreakStatement) {
          break;
        } else if (err instanceof ContinueStatement) {
          continue;
        } else if (err instanceof ReturnStatement) {
          throw err;
        }
      }
      if (stmt.increment) {
        interpreter.evaluateExpr(stmt.increment);
      }
    }
    return new VoidValue();
  }
  private evaluateFunctionCallExpr(expr: FunctionCallExpr): RuntimeValue {
    try {
      const env = new Environment(this.environment);
      const interpreter = new Interpreter(env);
      const func = this.environment.getFunction(expr.callee.value) as
        | FunctionValue
        | NativeFunctionValue;

      expr.args.forEach((arg, index) => {
        const value = this.evaluateExpr(arg);
        if (
          func.params[index][1] !== ValueType.ANY &&
          value.type !== func.params[index][1]
        ) {
          throw new InterpreterError(
            `Invalid argument type: ${value.type} expected ${func.params[index][1]}`,
            arg
          );
        }
        env.defineVariable(func.params[index][0].value, value, false);
      });

      if (func.isNative)
        return (func as NativeFunctionValue).body(
          expr.args.map((arg) => this.evaluateExpr(arg))
        );

      interpreter.evaluate((func as FunctionValue).body);
    } catch (err) {
      if (err instanceof ReturnStatement) {
        return err.value;
      }
      throw err;
    }
    return new VoidValue();
  }
  private evaluateIdentifierExpr(expr: IdentifierExpr): RuntimeValue {
    let variableValue: [RuntimeValue, string, boolean] | null = null;
    let functionValue: FunctionValue | NativeFunctionValue | null = null;
    let typeValue: TypeValue | null = null;

    let flag = "";
    if (this.environment.isDefinedVariable(expr.value)) {
      variableValue = this.environment.getVariable(expr.value);
      flag = "variable";
    } else if (this.environment.isDefinedFunction(expr.value)) {
      functionValue = this.environment.getFunction(expr.value);
      flag = "function";
    } else if (this.environment.isDefinedType(expr.value)) {
      typeValue = this.environment.getType(expr.value);
      flag = "type";
    }

    if (flag === "variable" && variableValue !== null) {
      switch (variableValue[1]) {
        case ValueType.NUMBER:
          return new NumberValue((variableValue[0] as NumberValue).value);
        case ValueType.STRING:
          return new StringValue((variableValue[0] as StringValue).value);
        case ValueType.BOOL:
          return new BooleanValue((variableValue[0] as BooleanValue).value);
        case ValueType.NULL:
          return new NullValue();
        case ValueType.CUSTOM:
          return new CustomValue(
            variableValue[0],
            (variableValue[0] as CustomValue).typeOf
          );
        default:
          throw new InterpreterError(
            `Invalid value type: ${variableValue[1]}`,
            expr
          );
      }
    } else if (flag === "function" && functionValue !== null) {
      return functionValue as FunctionValue | NativeFunctionValue;
    } else if (flag === "type" && typeValue !== null) {
      return typeValue;
    } else {
      throw this.environment.getVariable(expr.value);
    }
  }
  private evaluateVariableDeclarationExpr(
    expr: VariableDeclarationExpr
  ): RuntimeValue {
    const value = expr.value ? this.evaluateExpr(expr.value) : new NullValue();

    if (value.type !== expr.typeOf.value)
      throw new InterpreterError(
        `Invalid variable type: ${value.type} expected ${expr.typeOf.value}`,
        expr
      );

    this.environment.defineVariable(expr.name.value, value, expr.isConst);
    return value;
  }
  private evaluateContinueStmt(_stmt: Expr): RuntimeValue {
    throw new ContinueStatement();
  }
  private evaluateBreakStmt(_stmt: Expr): RuntimeValue {
    throw new BreakStatement();
  }
  private evaluateReturnStmt(stmt: ReturnStmt): RuntimeValue {
    const value = this.evaluateExpr(stmt.value);
    throw new ReturnStatement(value);
  }
  private evaluateIfStmt(stmt: IfStmt): RuntimeValue {
    const condition = this.evaluateExpr(stmt.condition) as BooleanValue;
    if (condition.type !== ValueType.BOOL) {
      throw new InterpreterError(
        `Invalid if condition type: ${condition.type}`,
        stmt
      );
    }
    if (condition.value) {
      return this.evaluateBlockStmt(stmt.thenBranch);
    } else if (stmt.elseBranch) {
      if (stmt.elseBranch.type === ExprType.IF_STMT) {
        return this.evaluateIfStmt(stmt.elseBranch as IfStmt);
      } else if (stmt.elseBranch.type === ExprType.BLOCK_STMT) {
        return this.evaluateBlockStmt(stmt.elseBranch as BlockStmt);
      }
    }
    return new VoidValue();
  }
  private evaluateBlockStmt(stmt: BlockStmt): RuntimeValue {
    const interpreter = new Interpreter(new Environment(this.environment));
    for (const expr of stmt.statements) {
      interpreter.evaluateExpr(expr);
    }
    return new VoidValue();
  }
  private evaluateBinaryNumberExpr(
    expr: BinaryExpr,
    left: NumberValue,
    right: NumberValue
  ): NumberValue | BooleanValue {
    switch (expr.operator.type) {
      case TokenType.PLUS_TOKEN:
        return new NumberValue(left.value + right.value);
      case TokenType.MINUS_TOKEN:
        return new NumberValue(left.value - right.value);
      case TokenType.STAR_TOKEN:
        return new NumberValue(left.value * right.value);
      case TokenType.SLASH_TOKEN:
        if (right.value === 0)
          throw new InterpreterError(`Division by zero`, null);
        return new NumberValue(left.value / right.value);
      case TokenType.MODULO_TOKEN:
        if (right.value === 0)
          throw new InterpreterError(`Modulo by zero`, null);
        return new NumberValue(left.value % right.value);
      case TokenType.EQUAL_TOKEN:
        return new BooleanValue(left.value === right.value);
      // case TokenType.BANG_EQUAL_TOKEN:
      //   return new BooleanValue(left.value !== right.value);
      case TokenType.GREATER_THEN_TOKEN:
        return new BooleanValue(left.value > right.value);
      case TokenType.GREATER_OR_EQUAL_TOKEN:
        return new BooleanValue(left.value >= right.value);
      case TokenType.LESS_THEN_TOKEN:
        return new BooleanValue(left.value < right.value);
      case TokenType.LESS_OR_EQUAL_TOKEN:
        return new BooleanValue(left.value <= right.value);
      default:
        throw new InterpreterError(
          `Invalid binary number expression: ${expr.operator.type}`,
          expr
        );
    }
  }
  private evaluateBinaryStringExpr(
    operator: Token,
    left: StringValue,
    right: StringValue
  ): StringValue | BooleanValue {
    switch (operator.type) {
      case TokenType.PLUS_TOKEN:
        return new StringValue(left.value + right.value);
      case TokenType.EQUAL_TOKEN:
        return new BooleanValue(left.value === right.value);
      // case TokenType.BANG_EQUAL_TOKEN:
      //   return new BooleanValue(left.value !== right.value);
      case TokenType.GREATER_THEN_TOKEN:
        return new BooleanValue(left.value > right.value);
      case TokenType.GREATER_OR_EQUAL_TOKEN:
        return new BooleanValue(left.value >= right.value);
      case TokenType.LESS_THEN_TOKEN:
        return new BooleanValue(left.value < right.value);
      case TokenType.LESS_OR_EQUAL_TOKEN:
        return new BooleanValue(left.value <= right.value);
      default:
        throw new InterpreterError(
          `Invalid binary string expression: ${operator.type}`,
          null
        );
    }
  }
  private evaluateBinaryBooleanExpr(
    operator: Token,
    left: BooleanValue,
    right: BooleanValue
  ): BooleanValue {
    switch (operator.type) {
      case TokenType.EQUAL_TOKEN:
        return new BooleanValue(left.value === right.value);
      // case TokenType.BANG_EQUAL_TOKEN:
      //   return new BooleanValue(left.value !== right.value);
      case TokenType.AND_TOKEN:
        return new BooleanValue(left.value && right.value);
      case TokenType.OR_TOKEN:
        return new BooleanValue(left.value || right.value);
      default:
        throw new InterpreterError(
          `Invalid binary boolean expression: ${operator.type}`,
          null
        );
    }
  }
  private evaluateBinaryExpr(expr: BinaryExpr): RuntimeValue {
    const left = this.evaluateExpr(expr.left);
    const right = this.evaluateExpr(expr.right);

    if (left.type === ValueType.NUMBER && right.type === ValueType.NUMBER) {
      return this.evaluateBinaryNumberExpr(
        expr,
        left as NumberValue,
        right as NumberValue
      );
    } else if (
      left.type === ValueType.STRING &&
      right.type === ValueType.STRING
    ) {
      return this.evaluateBinaryStringExpr(
        expr.operator,
        left as StringValue,
        right as StringValue
      );
    } else if (left.type === ValueType.BOOL && right.type === ValueType.BOOL) {
      return this.evaluateBinaryBooleanExpr(
        expr.operator,
        left as BooleanValue,
        right as BooleanValue
      );
    }

    throw new InterpreterError(
      `Invalid binary expression between: ${left.type} ${expr.operator.value} ${right.type}`,
      expr
    );
  }
  private evaluateNullLiteral(_expr: NullLiteralExpr): RuntimeValue {
    return new NullValue();
  }
  private evaluateBooleanLiteral(expr: BooleanLiteralExpr): RuntimeValue {
    return new BooleanValue(expr.value);
  }
  private evaluateStringLiteral(expr: StringLiteralExpr): StringValue {
    return new StringValue(expr.value);
  }
  private evaluateNumberLiteral(expr: NumberLiteralExpr): NumberValue {
    if (expr.value.toString().includes(".")) {
      return new NumberValue(parseFloat(expr.value.toString()));
    }
    return new NumberValue(parseInt(expr.value.toString()));
  }
}

export default Interpreter;
