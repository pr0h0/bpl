import Environment from '../Environment/Environment';
import Interpreter from '../Interpreter/Interpreter';
import { RuntimeValue, VoidValue } from '../Interpreter/Values';
import PrintService from '../services/print.service';
import ExprType from '../Parser/ExprType';
import { Expr } from './Expr';

export class BlockStmt extends Expr {
    constructor(public statements: Expr[]) {
        super(ExprType.BLOCK_STMT);
    }

    protected override parsedValue: RuntimeValue = new VoidValue();

    public override isEvaluateImplemented: boolean = true;

    public override evaluate(interpreter: Interpreter): RuntimeValue {
        const localInterpreter = new Interpreter(new Environment(interpreter.environment));
        for (const expr of this.statements) {
            localInterpreter.evaluateExpr(expr);
        }
        return new VoidValue();
    }

    public override toString(): string {
        return PrintService.print(this.parsedValue);
    }
}
