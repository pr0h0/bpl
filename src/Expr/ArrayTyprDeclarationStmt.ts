import Interpreter from '../Interpreter/Interpreter';
import ValueType from '../Interpreter/ValueType';
import { RuntimeValue, VoidValue } from '../Interpreter/Values';
import Token from '../Lexer/Token';
import ExprType from '../Parser/ExprType';
import PrintService from '../services/print.service';
import { Expr } from './Expr';

export class ArrayTypeDeclarationStmt extends Expr {
    constructor(public name: Token, public typeOf: Token) {
        super(ExprType.TYPE_DECLARATION_STMT);
    }

    public override isEvaluateImplemented: boolean = true;
    public override parsedValue: RuntimeValue = new VoidValue();

    public override evaluate(interpreter: Interpreter): VoidValue {
        const name = this.name;
        const type = this.typeOf;

        interpreter.environment.defineType(name.value, ValueType.ARRAY, { $type: type.value });

        return this.parsedValue;
    }

    public override toString(): string {
        return PrintService.print(this.parsedValue);
    }
}
