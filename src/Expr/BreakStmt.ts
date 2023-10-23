import BreakStatement from '../Errors/BreakStatement';
import { RuntimeValue, VoidValue } from '../Interpreter/Values';
import PrintService from '../services/print.service';
import ExprType from '../Parser/ExprType';
import { Expr } from './Expr';

export class BreakStmt extends Expr {
    constructor() {
        super(ExprType.BREAK_STMT);
    }

    protected override parsedValue: RuntimeValue = new VoidValue();

    public override isEvaluateImplemented: boolean = true;

    public override evaluate(): RuntimeValue {
        throw new BreakStatement();
    }

    public override toString(): string {
        return PrintService.print(this.parsedValue);
    }
}
