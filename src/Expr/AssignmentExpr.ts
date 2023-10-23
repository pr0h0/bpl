import Interpreter from '../Interpreter/Interpreter';
import { RuntimeValue, VoidValue } from '../Interpreter/Values';
import Token from '../Lexer/Token';
import PrintService from '../services/print.service';
import ExprType from '../Parser/ExprType';
import { Expr } from './Expr';
import { VariableDeclarationExpr } from './VariableDeclarationExpr';
import TokenType from '../Lexer/TokenType';

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

        VariableDeclarationExpr.verifyType(
            interpreter,
            value,
            value.type,
            new Token(TokenType.IDENTIFIER_TOKEN, variable[1]),
            this,
        );

        interpreter.environment.setVariable(variableName, value);
        return (this.parsedValue = value);
    }

    public override toString(): string {
        return PrintService.print(this.parsedValue);
    }
}
