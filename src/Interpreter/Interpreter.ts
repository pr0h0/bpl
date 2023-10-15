import Environment from "../Environment/Environment";
import BreakStatement from "../Errors/BreakStatement";
import ContinueStatement from "../Errors/ContinueStatement";
import InterpreterError from "../Errors/InterpreterError";
import ReturnStatement from "../Errors/ReturnStatement";
import Token from "../Lexer/Token";
import TokenType from "../Lexer/TokenType";
import {
  BinaryExpr,
  BlockStmt,
  BooleanLiteralExpr,
  BreakStmt,
  ContinueStmt,
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
  UnaryExpr,
  VariableDeclarationExpr,
} from "../Parser/Expr";
import ExprType from "../Parser/ExprType";
import PrimitiveTypes from "./PrimitiveTypes";
import ValueType from "./ValueType";
import {
  BooleanValue,
  CustomValue,
  FunctionValue,
  NullValue,
  NumberValue,
  RuntimeValue,
  StringValue,
} from "./Values";

class Interpreter {
  private environment: Environment;

  constructor(env?: Environment) {
    this.environment = env || new Environment();
  }
  public evaluate(stmt: Expr | Expr[]): void {
    if (Array.isArray(stmt)) {
      for (const expr of stmt) {
        this.evaluateExpr(expr);
        // if (value.type !== ValueType.VOID) console.log(value);
      }
    } else {
      this.evaluateExpr(stmt);
      // console.log(value);
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
      return new RuntimeValue(ValueType.VOID);
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
    } else if(expr instanceof FunctionDeclarationExpr) {
      return this.evaluateFunctionDeclarationExpr(expr);
    }

    throw new Error(`Invalid expression: ${expr.constructor.name}`);
  }

  private evaluateFunctionDeclarationExpr(expr: FunctionDeclarationExpr): RuntimeValue {
    const func = new FunctionValue(
      expr.name,
      expr.params,
      expr.body,
      expr.returnType.value
    );

    this.environment.defineFunction(expr.name.value, func);
    console.log('function defined', expr.name.value)
    return new RuntimeValue(ValueType.VOID);
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
          new NumberValue(
            (variableValue[0] as NumberValue).value + 1,
            variableValue[1]
          )
        );
        return new NumberValue((right as NumberValue).value + 1, right.type);
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
          new NumberValue(
            (variableValue[0] as NumberValue).value - 1,
            variableValue[1]
          )
        );
        return new NumberValue((right as NumberValue).value - 1, right.type);
      }
      case TokenType.MINUS_TOKEN:
        if (right.type !== ValueType.NUMBER) {
          throw new InterpreterError(
            `Invalid unary expression: ${expr.operator.value} ${right.type}`,
            expr
          );
        }
        return new NumberValue(-(right as NumberValue).value, right.type);
      case TokenType.BANG_TOKEN:
        if (right.type !== ValueType.BOOLEAN) {
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
    let count = 0;
    while (true) {
      if (count++ > 1000) throw new InterpreterError("Infinite loop", stmt);
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
    return new RuntimeValue(ValueType.VOID);
  }
  private evaluateFunctionCallExpr(expr: FunctionCallExpr): RuntimeValue {
    try {
      const env = new Environment(this.environment);
      const interpreter = new Interpreter(env);
      const func = this.environment.getFunction(expr.callee.value);
      expr.args.forEach((arg, index) => {
        const value = this.evaluateExpr(arg);
        if (value.type.toLowerCase() !== func.params[index][1]) {
          throw new InterpreterError(
            `Invalid argument type: ${value.type} expected ${func.params[index][1]}`,
            arg
          );
        }
        env.defineVariable(
          func.params[index][0].value,
          value,
          false
        );
      });

      interpreter.evaluate(func.body);
    } catch (err) {
      if (err instanceof ReturnStatement) {
        return err.value;
      }
      throw err;
    }
    return new RuntimeValue(ValueType.VOID);
  }
  private evaluateIdentifierExpr(expr: IdentifierExpr): RuntimeValue {
    const value = this.environment.getVariable(expr.value);
    switch (value[1]) {
      case ValueType.NUMBER:
        return new NumberValue((value[0] as NumberValue).value, value[1]);
      case ValueType.STRING:
        return new StringValue((value[0] as StringValue).value);
      case ValueType.BOOLEAN:
        return new BooleanValue((value[0] as BooleanValue).value);
      case ValueType.NULL:
        return new NullValue();
      case ValueType.CUSTOM:
        return new CustomValue(value[0], (value[0] as CustomValue).typeOf);
      default:
        throw new InterpreterError(`Invalid value type: ${value[1]}`, expr);
    }
  }
  private evaluateVariableDeclarationExpr(
    expr: VariableDeclarationExpr
  ): RuntimeValue {
    let value;
    if (expr.value) {
      value = this.evaluateExpr(expr.value);
    } else {
      value = new NullValue();
    }

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
    if (condition.type !== ValueType.BOOLEAN) {
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
    return new RuntimeValue(ValueType.VOID);
  }
  private evaluateBlockStmt(stmt: BlockStmt): RuntimeValue {
    const interpreter = new Interpreter(new Environment(this.environment));
    for (const expr of stmt.statements) {
      interpreter.evaluateExpr(expr);
    }
    return new RuntimeValue(ValueType.VOID);
  }
  private evaluateBinaryNumberExpr(
    operator: Token,
    left: NumberValue,
    right: NumberValue
  ): NumberValue | BooleanValue {
    switch (operator.type) {
      case TokenType.PLUS_TOKEN:
        return new NumberValue(left.value + right.value, PrimitiveTypes.INT);
      case TokenType.MINUS_TOKEN:
        return new NumberValue(left.value - right.value, PrimitiveTypes.INT);
      case TokenType.STAR_TOKEN:
        return new NumberValue(left.value * right.value, PrimitiveTypes.INT);
      case TokenType.SLASH_TOKEN:
        if (right.value === 0)
          throw new InterpreterError(`Division by zero`, null);
        return new NumberValue(left.value / right.value, PrimitiveTypes.INT);
      case TokenType.MODULO_TOKEN:
        if (right.value === 0)
          throw new InterpreterError(`Modulo by zero`, null);
        return new NumberValue(left.value % right.value, PrimitiveTypes.INT);
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
        throw new Error(`Invalid binary number expression: ${operator.type}`);
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
        throw new Error(`Invalid binary string expression: ${operator.type}`);
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
        throw new Error(`Invalid binary boolean expression: ${operator.type}`);
    }
  }
  private evaluateBinaryExpr(expr: BinaryExpr): RuntimeValue {
    const left = this.evaluateExpr(expr.left);
    const right = this.evaluateExpr(expr.right);

    if (left.type === ValueType.NUMBER && right.type === ValueType.NUMBER) {
      return this.evaluateBinaryNumberExpr(
        expr.operator,
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
    } else if (
      left.type === ValueType.BOOLEAN &&
      right.type === ValueType.BOOLEAN
    ) {
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
      return new NumberValue(
        parseFloat(expr.value.toString()),
        PrimitiveTypes.FLOAT
      );
    }
    return new NumberValue(parseInt(expr.value.toString()), PrimitiveTypes.INT);
  }
}

export default Interpreter;
