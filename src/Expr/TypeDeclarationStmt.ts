import InterpreterError from '../Errors/InterpreterError';
import Interpreter from '../Interpreter/Interpreter';
import ValueType from '../Interpreter/ValueType';
import { RuntimeValue, VoidValue } from '../Interpreter/Values';
import Token from '../Lexer/Token';
import PrintService from '../services/print.service';
import ExprType from '../Parser/ExprType';
import { Expr } from './Expr';

export class TypeDeclarationStmt extends Expr {
    constructor(public name: Token, public members: [Token, Token][]) {
        super(ExprType.TYPE_DECLARATION_STMT);
    }

    protected override parsedValue: RuntimeValue = new VoidValue();

    public override isEvaluateImplemented: boolean = true;

    public override evaluate(interpreter: Interpreter): RuntimeValue {
        const name = this.name.value;
        const members = this.members;
        const extraProperties: Record<string, string> = {};
        members.forEach((member) => {
            if ([ValueType.ANY, ValueType.NULL, ValueType.VOID].includes(member[1].value as ValueType)) {
                throw new InterpreterError(`Invalid property type: ${member[1].value}`, this);
            }
            extraProperties[member[0].value] = member[1].value;
            interpreter.environment.getType(member[1].value);
        });

        interpreter.environment.defineType(name, ValueType.TYPE, extraProperties);
        return new VoidValue();
    }

    public override toString(): string {
        return PrintService.print(this.parsedValue);
    }
}
