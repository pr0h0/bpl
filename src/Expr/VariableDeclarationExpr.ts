import InterpreterError from '../Errors/InterpreterError';
import Interpreter from '../Interpreter/Interpreter';
import ValueType from '../Interpreter/ValueType';
import { ArrayValue, NullValue, ObjectValue, RuntimeValue, TupleValue, VoidValue } from '../Interpreter/Values';
import Token from '../Lexer/Token';
import PrintService from '../services/print.service';
import ExprType from '../Parser/ExprType';
import { Expr } from './Expr';

export class VariableDeclarationExpr extends Expr {
    constructor(public name: Token, public typeOf: Token, public value: Expr | null, public isConst: boolean = false) {
        super(ExprType.VARIABLE_DECLARATION_EXPR);
    }

    protected override parsedValue: RuntimeValue = new VoidValue();

    public override isEvaluateImplemented: boolean = true;

    public override evaluate(interpreter: Interpreter) {
        if (
            this.typeOf.value === ValueType.ANY ||
            this.typeOf.value === ValueType.VOID ||
            this.typeOf.value === ValueType.NULL
        ) {
            throw new InterpreterError(`Invalid variable type: ${this.typeOf.value}`, this);
        }
        const value = this.value ? interpreter.evaluateExpr(this.value) : new NullValue();
        const type = this.typeOf.value;
        VariableDeclarationExpr.verifyType(interpreter, value, type, this.typeOf, this);

        interpreter.environment.defineVariable(this.name.value, value, this.isConst);
        return (this.parsedValue = value);
    }

    public override toString(): string {
        return PrintService.print(this.parsedValue);
    }

    public static verifyType(interpreter: Interpreter, value: RuntimeValue, type: string, typeOf: Token, expr: Expr) {
        if (!interpreter.environment.isDefinedType(type))
            throw new InterpreterError(`Type ${type} is not defined!`, expr);
        if (value instanceof ObjectValue) {
            ObjectValue.verifyObject(interpreter, value, type);
            value.typeOf = type;
            return;
        }
        if (value instanceof ArrayValue) {
            ArrayValue.verifyArray(interpreter, value, type);
            value.typeOf = type;
            return;
        }
        if (value instanceof TupleValue) {
            TupleValue.verifyTuple(interpreter, value, type);
            return;
        }
        if (value.type !== typeOf.value) {
            throw new InterpreterError(`Invalid variable type: ${value.type} expected ${typeOf.value}`, expr);
        }
    }
}
