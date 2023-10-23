import { RuntimeValue, VoidValue } from '../Interpreter/Values';
import PrintService from '../services/print.service';
import ExprType from '../Parser/ExprType';
import { Expr } from './Expr';

export class EmptyExpr extends Expr {
    constructor() {
        super(ExprType.EMPTY_EXP);
    }

    protected override parsedValue: RuntimeValue = new VoidValue();

    public override isEvaluateImplemented: boolean = true;

    public override evaluate(): VoidValue {
        return this.parsedValue;
    }

    public override toString(): string {
        return PrintService.printPrimitiveValue(this.parsedValue);
    }
}
