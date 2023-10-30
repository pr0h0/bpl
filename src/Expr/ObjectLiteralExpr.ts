import Interpreter from '../Interpreter/Interpreter';
import ValueType from '../Interpreter/ValueType';
import { ObjectValue, RuntimeValue } from '../Interpreter/Values';
import Token from '../Lexer/Token';
import PrintService from '../services/print.service';
import ExprType from '../Parser/ExprType';
import { Expr } from './Expr';

export class ObjectLiteralExpr extends Expr {
    constructor(public value: [Token, Expr][]) {
        super(ExprType.OBJECT_LITERAL_EXPR);
    }

    protected override parsedValue: ObjectValue = new ObjectValue(new Map<string, RuntimeValue>(), ValueType.OBJECT);

    public override isEvaluateImplemented: boolean = true;

    public override evaluate(interpreter: Interpreter): ObjectValue {
        const object: Map<string, RuntimeValue> = new Map<string, RuntimeValue>();
        this.value.forEach((pair) => {
            const [key, value] = pair;
            object.set(key.value, value.evaluate(interpreter));
        });
        return (this.parsedValue = new ObjectValue(object, ValueType.OBJECT));
    }

    public override toString(): string {
        return PrintService.print(this.parsedValue);
    }
}
