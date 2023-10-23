import InterpreterError from '../Errors/InterpreterError';
import Interpreter from '../Interpreter/Interpreter';
import { RuntimeValue, VoidValue } from '../Interpreter/Values';
import Token from '../Lexer/Token';
import PrintService from '../services/print.service';
import ExprType from '../Parser/ExprType';
import { Expr } from './Expr';

export class AssignmentExpr extends Expr {
    constructor(public name: Token, public value: Expr) {
        super(ExprType.ASSIGNMENT_EXPR);
    }

    protected override parsedValue: RuntimeValue = new VoidValue();

    public override isEvaluateImplemented: boolean = true;

    public override evaluate(interpreter: Interpreter): RuntimeValue {
        const value = interpreter.evaluateExpr(this.value);
        const variableName = this.name.value;

        const variable = interpreter.environment.getVariable(variableName);

        if (value.type !== variable[1]) {
            throw new InterpreterError(`Invalid assignment type: ${value.type} expected ${variable[1]}`, this);
        }

        interpreter.environment.setVariable(variableName, value);
        return (this.parsedValue = value);
    }

    public override toString(): string {
        return PrintService.print(this.parsedValue);
    }
}
