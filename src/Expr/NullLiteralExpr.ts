import { NullValue, RuntimeValue } from '../Interpreter/Values';
import PrintService from '../services/print.service';
import ExprType from '../Parser/ExprType';
import { Expr } from './Expr';

export class NullLiteralExpr extends Expr {
    constructor() {
        super(ExprType.NULL_LITERAL_EXPR);
    }

    protected override parsedValue: NullValue = new NullValue();

    public override isEvaluateImplemented: boolean = true;

    public override evaluate(): RuntimeValue {
        return this.parsedValue;
    }

    public override toString(): string {
        return PrintService.print(this.parsedValue);
    }
}
