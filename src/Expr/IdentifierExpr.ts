import InterpreterError from '../Errors/InterpreterError';
import Interpreter from '../Interpreter/Interpreter';
import ValueType from '../Interpreter/ValueType';
import {
    FunctionValue,
    NativeFunctionValue,
    ObjectValue,
    RuntimeValue,
    TypeValue,
    VoidValue,
} from '../Interpreter/Values';
import PrintService from '../services/print.service';
import ExprType from '../Parser/ExprType';
import { Expr } from './Expr';

export class IdentifierExpr extends Expr {
    constructor(public value: string) {
        super(ExprType.IDENTIFIER_EXPR);
    }

    protected override parsedValue: RuntimeValue = new VoidValue();

    public override isEvaluateImplemented: boolean = true;

    public override evaluate(interpreter: Interpreter) {
        let variableValue: [RuntimeValue, string, boolean] | null = null;
        let functionValue: FunctionValue | NativeFunctionValue | null = null;
        let typeValue: TypeValue | null = null;

        let flag = '';
        if (interpreter.environment.isDefinedVariable(this.value)) {
            variableValue = interpreter.environment.getVariable(this.value);
            flag = 'variable';
        } else if (interpreter.environment.isDefinedFunction(this.value)) {
            functionValue = interpreter.environment.getFunction(this.value);
            flag = 'function';
        } else if (interpreter.environment.isDefinedType(this.value)) {
            typeValue = interpreter.environment.getType(this.value);
            flag = 'type';
        }

        if (flag === 'variable' && variableValue !== null) {
            switch (variableValue[0].type) {
                case ValueType.NUMBER:
                    return (this.parsedValue = variableValue[0]);
                case ValueType.STRING:
                    return (this.parsedValue = variableValue[0]);
                case ValueType.BOOL:
                    return (this.parsedValue = variableValue[0]);
                case ValueType.NULL:
                    return (this.parsedValue = variableValue[0]);
                case ValueType.OBJECT:
                    return (this.parsedValue = variableValue[0]);
                case ValueType.TYPE:
                    return (this.parsedValue = variableValue[0]);
                case ValueType.FUNC:
                    return (this.parsedValue = variableValue[0]);
                case ValueType.NATIVE_FUNCTION:
                    return (this.parsedValue = variableValue[0]);
                case ValueType.ARRAY:
                    return (this.parsedValue = variableValue[0]);
                case ValueType.TUPLE:
                    return (this.parsedValue = variableValue[0]);
                default: {
                    const type = variableValue[1];
                    if (interpreter.environment.isDefinedType(type)) {
                        const typeValue = interpreter.environment.getType(type);
                        return (this.parsedValue = new ObjectValue(
                            (variableValue[0] as ObjectValue).value,
                            typeValue.type,
                        ));
                    }
                    throw new InterpreterError(`Invalid value type: ${variableValue[1]}`, this);
                }
            }
        } else if (flag === 'function' && functionValue !== null) {
            return (this.parsedValue = functionValue as FunctionValue | NativeFunctionValue);
        } else if (flag === 'type' && typeValue !== null) {
            return (this.parsedValue = typeValue);
        }
        throw interpreter.environment.getVariable(this.value);
    }

    public override toString(): string {
        return PrintService.print(this.parsedValue);
    }
}
