import Interpreter from '../Interpreter/Interpreter';
import { RuntimeValue, VoidValue } from '../Interpreter/Values';
import PrintService from '../services/print.service';
import ExprType from '../Parser/ExprType';

export class Expr {
    constructor(public type: ExprType) {}

    protected parsedValue: RuntimeValue = new VoidValue();

    public isEvaluateImplemented: boolean = false;

    public evaluate(_: Interpreter): any {
        return this.parsedValue;
    }

    public toString(): string {
        return PrintService.print(this.parsedValue);
    }
}
