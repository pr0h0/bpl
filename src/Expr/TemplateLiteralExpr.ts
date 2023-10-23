import Interpreter from '../Interpreter/Interpreter';
import { StringValue } from '../Interpreter/Values';
import ExprType from '../Parser/ExprType';
import { Expr } from './Expr';

export class TemplateLiteralExpr extends Expr {
    constructor(public value: Expr[]) {
        super(ExprType.TEMPLATE_LITERAL_TOKEN);
    }

    protected override parsedValue: StringValue = new StringValue('');

    public override isEvaluateImplemented: boolean = true;

    public override evaluate(interpreter: Interpreter): StringValue {
        const parts = this.value;
        const parsed: StringValue[] = parts.map((part) => interpreter.evaluateExpr(part) as StringValue);
        let result = '';
        for (const segment of parsed) {
            const value = segment.value;
            const parsedValue = value == null ? '' : value.toString();
            result += parsedValue;
        }

        return (this.parsedValue = new StringValue(result));
    }
}
