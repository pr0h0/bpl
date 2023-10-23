import ContinueStatement from '../Errors/ContinueStatement';
import { RuntimeValue, VoidValue } from '../Interpreter/Values';
import PrintService from '../services/print.service';
import ExprType from '../Parser/ExprType';
import { Expr } from './Expr';

export class ContinueStmt extends Expr {
    constructor() {
        super(ExprType.CONTINUE_STMT);
    }

    protected override parsedValue: RuntimeValue = new VoidValue();

    public override isEvaluateImplemented: boolean = true;

    public override evaluate(): RuntimeValue {
        throw new ContinueStatement();
    }

    public override toString(): string {
        return PrintService.print(this.parsedValue);
    }
}
