import InterpreterError from '../Errors/InterpreterError';
import Interpreter from '../Interpreter/Interpreter';
import ValueType from '../Interpreter/ValueType';
import {
    BooleanValue,
    FunctionValue,
    NativeFunctionValue,
    NullValue,
    NumberValue,
    ObjectValue,
    RuntimeValue,
    StringValue,
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
                    return (this.parsedValue = new NumberValue((variableValue[0] as NumberValue).value));
                case ValueType.STRING:
                    return (this.parsedValue = new StringValue((variableValue[0] as StringValue).value));
                case ValueType.BOOL:
                    return (this.parsedValue = new BooleanValue((variableValue[0] as BooleanValue).value));
                case ValueType.NULL:
                    return (this.parsedValue = new NullValue());
                case ValueType.OBJECT:
                    return (this.parsedValue = new ObjectValue(
                        (variableValue[0] as ObjectValue).value,
                        variableValue[1],
                    ));
                case ValueType.TYPE:
                    return (this.parsedValue = new TypeValue(
                        (variableValue[0] as TypeValue).value,
                        variableValue[1],
                        (variableValue[0] as TypeValue).valueDefinition,
                    ));
                case ValueType.FUNC:
                    return (this.parsedValue = new FunctionValue(
                        (variableValue[0] as FunctionValue).name,
                        (variableValue[0] as FunctionValue).params,
                        (variableValue[0] as FunctionValue).body,
                        (variableValue[0] as FunctionValue).typeOf,
                    ));
                case ValueType.NATIVE_FUNCTION:
                    return (this.parsedValue = new NativeFunctionValue(
                        (variableValue[0] as NativeFunctionValue).name,
                        (variableValue[0] as NativeFunctionValue).params,
                        (variableValue[0] as NativeFunctionValue).body,
                        (variableValue[0] as NativeFunctionValue).typeOf,
                    ));
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
