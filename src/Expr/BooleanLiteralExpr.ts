import { BooleanValue } from '../Interpreter/Values';
import PrintService from '../services/print.service';
import ExprType from '../Parser/ExprType';
import { Expr } from './Expr';

export class BooleanLiteralExpr extends Expr {
    constructor(public value: boolean) {
        super(ExprType.BOOLEAN_LITERAL_EXPR);
    }

    protected override parsedValue: BooleanValue = new BooleanValue(false);

    public override isEvaluateImplemented: boolean = true;

    public override evaluate(): BooleanValue {
        return (this.parsedValue = new BooleanValue(this.value));
    }

    public override toString(): string {
        return PrintService.print(this.parsedValue);
    }
}
