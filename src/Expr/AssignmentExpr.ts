import InterpreterError from '../Errors/InterpreterError';
import Interpreter from '../Interpreter/Interpreter';
import { ArrayValue, NumberValue, ObjectValue, RuntimeValue, TupleValue, VoidValue } from '../Interpreter/Values';
import ValueType from '../Interpreter/ValueType';
import Token from '../Lexer/Token';
import TokenType from '../Lexer/TokenType';
import ExprType from '../Parser/ExprType';
import PrintService from '../services/print.service';
import { ArrayAccessExpr } from './ArrayAccessExpr';
import { Expr } from './Expr';
import { IdentifierExpr } from './IdentifierExpr';
import { ObjectAccessExpr } from './ObjectAccessExpr';
import { VariableDeclarationExpr } from './VariableDeclarationExpr';

export class AssignmentExpr extends Expr {
    constructor(public target: Expr, public value: Expr) {
        super(ExprType.ASSIGNMENT_EXPR);
    }

    protected override parsedValue: RuntimeValue = new VoidValue();

    public override isEvaluateImplemented: boolean = true;

    public override evaluate(interpreter: Interpreter): RuntimeValue {
        const value = interpreter.evaluateExpr(this.value);

        if (this.target instanceof IdentifierExpr) {
            const variable = interpreter.environment.getVariable(this.target.value);

            let requiredType = '';
            const type = interpreter.environment.getType((variable[0] as ObjectValue).typeOf || variable[0].type);
            if (type.value === ValueType.OBJECT || type.value === ValueType.ARRAY || type.value === ValueType.TUPLE) {
                requiredType = type.typeOf;
            } else {
                requiredType = type.value;
            }

            VariableDeclarationExpr.verifyType(
                interpreter,
                value,
                requiredType,
                new Token(TokenType.IDENTIFIER_TOKEN, variable[1]),
                this,
            );

            interpreter.environment.setVariable(this.target.value, value);
            return (this.parsedValue = value);
        }

        if (this.target instanceof ArrayAccessExpr) {
            const array = interpreter.environment.getVariable(this.target.array) as [
                ArrayValue | TupleValue,
                string,
                boolean,
            ];
            const index = interpreter.evaluateExpr(this.target.index);

            if (!(array[0] instanceof ArrayValue) && !(array[0] instanceof TupleValue)) {
                throw new InterpreterError('Invalid assignment target', this);
            }

            if (!(index instanceof NumberValue)) {
                throw new InterpreterError('Invalid assignment target', this);
            }

            let requiredType = '';
            if (array[0] instanceof TupleValue) {
                requiredType = (array[0] as TupleValue).value[index.value].type;
            } else {
                const type = interpreter.environment.getType(array[0].typeOf);
                requiredType = type.valueDefinition.$type;
            }
            array[0] instanceof ArrayValue ? array[0].value[0].type : array[0].typeOf[(index as NumberValue).value],
                VariableDeclarationExpr.verifyType(
                    interpreter,
                    value,
                    requiredType,
                    new Token(TokenType.IDENTIFIER_TOKEN, value.type),
                    this,
                );

            array[0].value[index.value] = value;
            return (this.parsedValue = value);
        }

        if (this.target instanceof ObjectAccessExpr) {
            const object = interpreter.evaluateExpr(this.target.object) as ObjectValue;
            const property = this.target.name.value;

            if (object.type !== ValueType.OBJECT) {
                throw new InterpreterError('Invalid assignment target', this);
            }

            if (!object.value.has(property)) {
                throw new InterpreterError('Invalid assignment target', this);
            }

            VariableDeclarationExpr.verifyType(
                interpreter,
                value,
                object.value.get(property)!.type,
                new Token(TokenType.IDENTIFIER_TOKEN, value.type),
                this,
            );

            object.value.set(property, value);
            return (this.parsedValue = value);
        }

        throw new InterpreterError('Invalid assignment target', this);
    }

    public override toString(): string {
        return PrintService.print(this.parsedValue);
    }
}
