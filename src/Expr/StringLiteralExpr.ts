import { StringValue } from '../Interpreter/Values';
import PrintService from '../services/print.service';
import ExprType from '../Parser/ExprType';
import { Expr } from './Expr';

export class StringLiteralExpr extends Expr {
    constructor(public value: string) {
        super(ExprType.STRING_LITERAL_EXPR);
    }

    protected override parsedValue: StringValue = new StringValue('');

    public override isEvaluateImplemented: boolean = true;

    public override evaluate(): StringValue {
        return (this.parsedValue = new StringValue(this.value));
    }

    public override toString(): string {
        return PrintService.print(this.parsedValue);
    }
}
