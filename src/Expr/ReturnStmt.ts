import ReturnStatement from '../Errors/ReturnStatement';
import Interpreter from '../Interpreter/Interpreter';
import { RuntimeValue, VoidValue } from '../Interpreter/Values';
import PrintService from '../services/print.service';
import ExprType from '../Parser/ExprType';
import { Expr } from './Expr';

export class ReturnStmt extends Expr {
    constructor(public value: Expr) {
        super(ExprType.RETURN_STMT);
    }

    protected override parsedValue: RuntimeValue = new VoidValue();

    public override isEvaluateImplemented: boolean = true;

    public override evaluate(interpreter: Interpreter): RuntimeValue {
        const value = interpreter.evaluateExpr(this.value);
        this.parsedValue = value;
        throw new ReturnStatement(value);
    }

    public override toString(): string {
        return PrintService.print(this.parsedValue);
    }
}
