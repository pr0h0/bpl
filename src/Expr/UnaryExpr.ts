import InterpreterError from '../Errors/InterpreterError';
import Interpreter from '../Interpreter/Interpreter';
import ValueType from '../Interpreter/ValueType';
import { BooleanValue, NumberValue, RuntimeValue, VoidValue } from '../Interpreter/Values';
import Token from '../Lexer/Token';
import TokenType from '../Lexer/TokenType';
import PrintService from '../services/print.service';
import ExprType from '../Parser/ExprType';
import { IdentifierExpr } from './IdentifierExpr';
import { Expr } from './Expr';

export class UnaryExpr extends Expr {
    constructor(public operator: Token, public right: Expr) {
        super(ExprType.UNARY_EXPR);
    }

    protected override parsedValue: RuntimeValue = new VoidValue();

    public override isEvaluateImplemented: boolean = true;

    public override evaluate(interpreter: Interpreter): RuntimeValue {
        const right = interpreter.evaluateExpr(this.right);
        switch (this.operator.type) {
            case TokenType.INCREMENT_TOKEN: {
                if (right.type !== ValueType.NUMBER) {
                    throw new InterpreterError(`Invalid unary expression: ${this.operator.value} ${right.type}`, this);
                }
                const variableName =
                    this.right.type === ExprType.IDENTIFIER_EXPR ? (this.right as IdentifierExpr).value : null;
                if (!variableName) {
                    throw new InterpreterError(`Invalid unary expression: ${this.operator.value} ${right.type}`, this);
                }
                const variableValue = interpreter.environment.getVariable(variableName);
                interpreter.environment.setVariable(
                    variableName,
                    new NumberValue((variableValue[0] as NumberValue).value + 1),
                );
                return (this.parsedValue = right);
            }
            case TokenType.DECREMENT_TOKEN: {
                if (right.type !== ValueType.NUMBER) {
                    throw new InterpreterError(`Invalid unary expression: ${this.operator.value} ${right.type}`, this);
                }
                const variableName =
                    this.right.type === ExprType.IDENTIFIER_EXPR ? (this.right as IdentifierExpr).value : null;
                if (!variableName) {
                    throw new InterpreterError(`Invalid unary expression: ${this.operator.value} ${right.type}`, this);
                }
                const variableValue = interpreter.environment.getVariable(variableName);
                interpreter.environment.setVariable(
                    variableName,
                    new NumberValue((variableValue[0] as NumberValue).value - 1),
                );
                return (this.parsedValue = right);
            }
            case TokenType.MINUS_TOKEN:
                if (right.type !== ValueType.NUMBER) {
                    throw new InterpreterError(`Invalid unary expression: ${this.operator.value} ${right.type}`, this);
                }
                return (this.parsedValue = new NumberValue(-(right as NumberValue).value));
            case TokenType.BANG_TOKEN:
                if (right.type !== ValueType.BOOL) {
                    throw new InterpreterError(`Invalid unary expression: ${this.operator.value} ${right.type}`, this);
                }
                return (this.parsedValue = new BooleanValue(!(right as BooleanValue).value));
            default:
                throw new InterpreterError(`Invalid unary expression: ${this.operator.value}`, this);
        }
    }

    public override toString(): string {
        return PrintService.print(this.parsedValue);
    }
}
