import Environment from '../Environment/Environment';
import BreakStatement from '../Errors/BreakStatement';
import ContinueStatement from '../Errors/ContinueStatement';
import InterpreterError from '../Errors/InterpreterError';
import ReturnStatement from '../Errors/ReturnStatement';
import Interpreter from '../Interpreter/Interpreter';
import {
    FunctionValue,
    NativeFunctionValue,
    ObjectValue,
    RuntimeValue,
    TypeValue,
    VoidValue,
} from '../Interpreter/Values';
import ValueType from '../Interpreter/ValueType';
import Token from '../Lexer/Token';
import ExprType from '../Parser/ExprType';
import PrintService from '../services/print.service';
import { Expr } from './Expr';
import { VariableDeclarationExpr } from './VariableDeclarationExpr';

export class FunctionCallExpr extends Expr {
    constructor(public callee: Token, public args: Expr[]) {
        super(ExprType.CALL_EXPR);
    }

    protected override parsedValue: RuntimeValue = new VoidValue();

    public override isEvaluateImplemented: boolean = true;

    public override evaluate(interpreter: Interpreter): RuntimeValue {
        const func = interpreter.environment.getFunction(this.callee.value) as FunctionValue | NativeFunctionValue;
        const closureEnv = new Environment(func.closure || new Environment());
        const scopeEnv = new Environment(interpreter.environment);

        const callingScopeInterpretter = new Interpreter(scopeEnv);
        const functionDefinitionInterpreter = new Interpreter(closureEnv);

        const returnType = func.typeOf as ValueType;

        try {
            if (this.args.length !== func.params.length) {
                throw new InterpreterError(
                    `Invalid number of arguments: ${this.args.length} expected ${func.params.length}`,
                    this,
                );
            }

            FunctionCallExpr.verifyFunctionCall(
                callingScopeInterpretter,
                functionDefinitionInterpreter,
                func,
                this.args,
            );

            if (func instanceof NativeFunctionValue) {
                return (this.parsedValue = (func as NativeFunctionValue).body(
                    this.args.map((arg) => arg.evaluate(callingScopeInterpretter)),
                ));
            }

            (func as FunctionValue).body.evaluate(functionDefinitionInterpreter);
        } catch (err) {
            if (err instanceof ReturnStatement) {
                if (returnType === ValueType.VOID)
                    throw new InterpreterError('Function of type VOID cannot return a value', this);
                if (
                    (err.value.type !== ValueType.OBJECT && returnType !== err.value.type) ||
                    (err.value.type === ValueType.OBJECT &&
                        (err.value as ObjectValue).typeOf !== returnType &&
                        ObjectValue.verifyObject(callingScopeInterpretter, err.value as ObjectValue, returnType) !==
                            undefined)
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

    public static verifyFunctionCall(
        callScopeInterpreter: Interpreter,
        funcitonDefinitionInterpreter: Interpreter,
        func: FunctionValue | NativeFunctionValue,
        args: Expr[],
    ): void {
        args.forEach((arg, index) => {
            const value = arg.evaluate(callScopeInterpreter);
            const type =
                func.params[index][1] === ValueType.ANY
                    ? new TypeValue(ValueType.ANY, ValueType.ANY, {})
                    : callScopeInterpreter.environment.getType(func.params[index][1]);

            if (func instanceof NativeFunctionValue) {
                if (func.params[index][1] !== ValueType.ANY) {
                    VariableDeclarationExpr.verifyType(callScopeInterpreter, value, type.typeOf, value.type, arg);
                }
                return;
            }

            if (func instanceof FunctionValue) {
                VariableDeclarationExpr.verifyType(callScopeInterpreter, value, type.typeOf, value.typeOf, arg);
            }

            if (value.type === ValueType.FUNC) {
                funcitonDefinitionInterpreter.environment.defineFunction(
                    func.params[index][0].value,
                    value as FunctionValue,
                );
            } else if (value.type === ValueType.NATIVE_FUNCTION) {
                funcitonDefinitionInterpreter.environment.defineNativeFunction(
                    func.params[index][0].value,
                    value as NativeFunctionValue,
                );
            } else if (value.type === ValueType.TYPE) {
                funcitonDefinitionInterpreter.environment.defineType(
                    func.params[index][0].value,
                    (value as TypeValue).value,
                    (value as TypeValue).valueDefinition,
                );
            } else {
                funcitonDefinitionInterpreter.environment.defineVariable(func.params[index][0].value, value, false);
            }
        });
    }
}
