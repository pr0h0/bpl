import InterpreterError from '../Errors/InterpreterError';
import Interpreter from '../Interpreter/Interpreter';
import { BooleanValue, NumberValue, RuntimeValue, StringValue, VoidValue } from '../Interpreter/Values';
import Token from '../Lexer/Token';
import PrintService from '../services/print.service';
import ExprType from '../Parser/ExprType';
import { Expr } from './Expr';
import TokenType from '../Lexer/TokenType';

export class BinaryExpr extends Expr {
    constructor(public left: Expr, public operator: Token, public right: Expr) {
        super(ExprType.BINARY_EXPR);
    }

    protected override parsedValue: RuntimeValue = new VoidValue();

    public override isEvaluateImplemented: boolean = true;

    public override evaluate(interpreter: Interpreter): RuntimeValue {
        const left = this.left.evaluate(interpreter);
        const right = this.right.evaluate(interpreter);

        if (left instanceof NumberValue && right instanceof NumberValue) {
            return (this.parsedValue = BinaryNumberNumberInterpreter.evaluate(interpreter, this, left, right));
        } else if (left instanceof StringValue && right instanceof StringValue) {
            return (this.parsedValue = BinaryStringStringInterpreter.evaluate(interpreter, this, left, right));
        } else if (left instanceof BooleanValue && right instanceof BooleanValue) {
            return (this.parsedValue = BinaryBoolBoolInterpreter.evaluate(interpreter, this, left, right));
        }

        throw new InterpreterError(
            `Invalid binary expression between: ${left.type} ${this.operator.value} ${right.type}`,
            this,
        );
    }

    public override toString(): string {
        return PrintService.print(this.parsedValue);
    }
}

class BinaryBoolBoolInterpreter {
    public static evaluate(_: Interpreter, expr: BinaryExpr, left: BooleanValue, right: BooleanValue): BooleanValue {
        switch (expr.operator.type) {
            case TokenType.EQUAL_TOKEN:
                return new BooleanValue(left.value === right.value);
            case TokenType.NOT_EQUAL_TOKEN:
                return new BooleanValue(left.value !== right.value);
            case TokenType.AND_TOKEN:
                return new BooleanValue(left.value && right.value);
            case TokenType.OR_TOKEN:
                return new BooleanValue(left.value || right.value);
            default:
                throw new InterpreterError(`Invalid binary boolean expression: ${expr.operator.type}`, null);
        }
    }
}

class BinaryStringStringInterpreter {
    public static evaluate(
        _: Interpreter,
        expr: BinaryExpr,
        left: StringValue,
        right: StringValue,
    ): StringValue | BooleanValue {
        switch (expr.operator.type) {
            case TokenType.PLUS_TOKEN:
                return new StringValue(left.value + right.value);
            case TokenType.EQUAL_TOKEN:
                return new BooleanValue(left.value === right.value);
            case TokenType.NOT_EQUAL_TOKEN:
                return new BooleanValue(left.value !== right.value);
            case TokenType.GREATER_THEN_TOKEN:
                return new BooleanValue(left.value > right.value);
            case TokenType.GREATER_OR_EQUAL_TOKEN:
                return new BooleanValue(left.value >= right.value);
            case TokenType.LESS_THEN_TOKEN:
                return new BooleanValue(left.value < right.value);
            case TokenType.LESS_OR_EQUAL_TOKEN:
                return new BooleanValue(left.value <= right.value);
            default:
                throw new InterpreterError(`Invalid binary string expression: ${expr.operator.type}`, null);
        }
    }
}

class BinaryNumberNumberInterpreter {
    public static evaluate(
        _: Interpreter,
        expr: BinaryExpr,
        left: NumberValue,
        right: NumberValue,
    ): NumberValue | BooleanValue {
        switch (expr.operator.type) {
            case TokenType.PLUS_TOKEN:
                return new NumberValue(left.value + right.value);
            case TokenType.MINUS_TOKEN:
                return new NumberValue(left.value - right.value);
            case TokenType.STAR_TOKEN:
                return new NumberValue(left.value * right.value);
            case TokenType.SLASH_TOKEN:
                if (right.value === 0) throw new InterpreterError(`Division by zero`, null);
                return new NumberValue(left.value / right.value);
            case TokenType.MODULO_TOKEN:
                if (right.value === 0) throw new InterpreterError(`Modulo by zero`, null);
                return new NumberValue(left.value % right.value);
            case TokenType.EXPONENT_TOKEN:
                return new NumberValue(left.value ** right.value);
            case TokenType.EQUAL_TOKEN:
                return new BooleanValue(left.value === right.value);
            case TokenType.NOT_EQUAL_TOKEN:
                return new BooleanValue(left.value !== right.value);
            case TokenType.GREATER_THEN_TOKEN:
                return new BooleanValue(left.value > right.value);
            case TokenType.GREATER_OR_EQUAL_TOKEN:
                return new BooleanValue(left.value >= right.value);
            case TokenType.LESS_THEN_TOKEN:
                return new BooleanValue(left.value < right.value);
            case TokenType.LESS_OR_EQUAL_TOKEN:
                return new BooleanValue(left.value <= right.value);
            default:
                throw new InterpreterError(`Invalid binary number expression: ${expr.operator.type}`, expr);
        }
    }
}
