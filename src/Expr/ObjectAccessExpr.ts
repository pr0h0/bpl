import InterpreterError from '../Errors/InterpreterError';
import Interpreter from '../Interpreter/Interpreter';
import { ObjectValue, RuntimeValue, VoidValue } from '../Interpreter/Values';
import Token from '../Lexer/Token';
import ExprType from '../Parser/ExprType';
import PrintService from '../services/print.service';
import { Expr } from './Expr';

export class ObjectAccessExpr extends Expr {
    constructor(public object: Expr, public name: Token) {
        super(ExprType.OBJECT_ACCESS_EXPR);
    }

    protected override parsedValue: RuntimeValue = new VoidValue();

    public override isEvaluateImplemented: boolean = true;

    public override evaluate(interpreter: Interpreter): RuntimeValue {
        const object = this.object.evaluate(interpreter) as ObjectValue;
        const property = this.name.value;
        if (!object.value.has(property)) {
            throw new InterpreterError(`Invalid property access: ${property}`, this);
        }
        return (this.parsedValue = object.value.get(property) as RuntimeValue);
    }

    public override toString(): string {
        return PrintService.print(this.parsedValue);
    }
}
