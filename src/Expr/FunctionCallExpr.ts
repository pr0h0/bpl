import Environment from '../Environment/Environment';
import BreakStatement from '../Errors/BreakStatement';
import ContinueStatement from '../Errors/ContinueStatement';
import InterpreterError from '../Errors/InterpreterError';
import ReturnStatement from '../Errors/ReturnStatement';
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
import Token from '../Lexer/Token';
import PrintService from '../services/print.service';
import ExprType from '../Parser/ExprType';
import { Expr } from './Expr';

export class FunctionCallExpr extends Expr {
    constructor(public callee: Token, public args: Expr[]) {
        super(ExprType.CALL_EXPR);
    }

    protected override parsedValue: RuntimeValue = new VoidValue();

    public override isEvaluateImplemented: boolean = true;

    public override evaluate(interpreter: Interpreter): RuntimeValue {
        const func = interpreter.environment.getFunction(this.callee.value) as FunctionValue | NativeFunctionValue;
        const env = new Environment(func.closure || interpreter.environment);
        const localInterpreter = new Interpreter(env);
        const returnType = func.typeOf as ValueType;

        try {
            if (this.args.length !== func.params.length) {
                throw new InterpreterError(
                    `Invalid number of arguments: ${this.args.length} expected ${func.params.length}`,
                    this,
                );
            }

            this.args.forEach((arg, index) => {
                const value = interpreter.evaluateExpr(arg);
                if (
                    (func.isNative &&
                        func.params[index][1] !== ValueType.ANY &&
                        func.params[index][1] !== value.type) ||
                    (!func.isNative &&
                        (func.params[index][1] !== value.type ||
                            (func.params[index][1] !== ValueType.OBJECT && func.params[index][1] !== value.type) ||
                            (func.params[index][1] === ValueType.OBJECT &&
                                (value as ObjectValue).typeOf !== func.params[index][1] &&
                                interpreter.verifyObject(value as ObjectValue, func.params[index][1]) !== undefined)))
                ) {
                    throw new InterpreterError(
                        `Invalid argument type: ${value.type} expected ${func.params[index][1]}`,
                        arg,
                    );
                }
                if (value.type === ValueType.FUNC) {
                    env.defineFunction(func.params[index][0].value, value as FunctionValue);
                } else if (value.type === ValueType.NATIVE_FUNCTION) {
                    env.defineNativeFunction(func.params[index][0].value, value as NativeFunctionValue);
                } else if (value.type === ValueType.TYPE) {
                    env.defineType(
                        func.params[index][0].value,
                        (value as TypeValue).value,
                        (value as TypeValue).valueDefinition,
                    );
                } else {
                    env.defineVariable(func.params[index][0].value, value, false);
                }
            });

            if (func.isNative) {
                return (this.parsedValue = (func as NativeFunctionValue).body(
                    this.args.map((arg) => interpreter.evaluateExpr(arg)),
                ));
            }

            localInterpreter.evaluate((func as FunctionValue).body);
        } catch (err) {
            if (err instanceof ReturnStatement) {
                if (returnType === ValueType.VOID)
                    throw new InterpreterError('Function of type VOID cannot return a value', this);
                if (
                    (err.value.type !== ValueType.OBJECT && returnType !== err.value.type) ||
                    (err.value.type === ValueType.OBJECT &&
                        (err.value as ObjectValue).typeOf !== returnType &&
                        interpreter.verifyObject(err.value as ObjectValue, returnType) !== undefined)
                )
                    throw new InterpreterError(
                        `Invalid return type: ${err.value.type}, but expected ${returnType}`,
                        this,
                    );
                return (this.parsedValue = err.value);
            } else if (err instanceof BreakStatement) {
                throw new InterpreterError('Break statement outside of loop', this);
            } else if (err instanceof ContinueStatement) {
                throw new InterpreterError('Continue statement outside of loop', this);
            }
            throw err;
        }
        return (this.parsedValue = new VoidValue());
    }

    public override toString(): string {
        return PrintService.print(this.parsedValue);
    }
}
