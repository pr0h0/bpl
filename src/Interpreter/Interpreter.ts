import Environment from '../Environment/Environment';
import InterpreterError from '../Errors/InterpreterError';
import Token from '../Lexer/Token';
import TokenType from '../Lexer/TokenType';
import { BinaryExpr, Expr } from '../Parser/Expr';
import { BooleanValue, NumberValue, ObjectValue, RuntimeValue, StringValue } from './Values';
import ValueType from './ValueType';

class Interpreter {
    public environment: Environment;

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

    public evaluateExpr(expr: Expr): RuntimeValue {
        if (expr.isParseImplemented) {
            return expr.parse(this);
        }

        throw new InterpreterError(`Invalid expression: ${expr.constructor.name}`, expr);
    }

    public evaluateBinaryNumberExpr(
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
    public evaluateBinaryStringExpr(
        operator: Token,
        left: StringValue,
        right: StringValue,
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
                throw new InterpreterError(`Invalid binary string expression: ${operator.type}`, null);
        }
    }
    public evaluateBinaryBooleanExpr(operator: Token, left: BooleanValue, right: BooleanValue): BooleanValue {
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
                throw new InterpreterError(`Invalid binary boolean expression: ${operator.type}`, null);
        }
    }

    public verifyObject(object: ObjectValue, type: string): void {
        const typeValue = this.environment.getType(type);
        const typeDefinition = typeValue.valueDefinition;
        const objectDefinition = object.value;
        const objectKeys = Array.from(objectDefinition.keys());
        const typeKeys = Object.keys(typeDefinition);
        const missingKeys = typeKeys.filter((key) => !objectKeys.includes(key));
        const extraKeys = objectKeys.filter((key) => !typeKeys.includes(key));
        if (missingKeys.length > 0) {
            throw new InterpreterError(`Object is missing keys: ${missingKeys.join(', ')} from type ${type}`, null);
        }
        if (extraKeys.length > 0) {
            throw new InterpreterError(`Object has extra keys: ${extraKeys.join(', ')} from type ${type}`, null);
        }
        objectDefinition.forEach((value, key) => {
            const type = typeDefinition[key];
            if (
                (value.type !== ValueType.OBJECT && value.type !== type) ||
                (value.type === ValueType.OBJECT && (value as ObjectValue).typeOf !== type)
            ) {
                throw new InterpreterError(
                    `Invalid object property '${key}' type: ${value.type} expected ${type}`,
                    null,
                );
            }
            if (value.type === ValueType.OBJECT) {
                this.verifyObject(value as ObjectValue, type);
            }
        });

        if (object.typeOf !== type) object.typeOf = type;
    }
}

export default Interpreter;
