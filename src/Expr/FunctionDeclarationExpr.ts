import InterpreterError from '../Errors/InterpreterError';
import Interpreter from '../Interpreter/Interpreter';
import ValueType from '../Interpreter/ValueType';
import { FunctionValue, RuntimeValue, VoidValue } from '../Interpreter/Values';
import Token from '../Lexer/Token';
import PrintService from '../services/print.service';
import ExprType from '../Parser/ExprType';
import { Expr } from './Expr';
import { BlockStmt } from './BlockStmt';

export class FunctionDeclarationExpr extends Expr {
    constructor(
        public name: Token,
        public params: [Token, string][],
        public body: BlockStmt,
        public returnType: Token,
    ) {
        super(ExprType.FUNCTION_DECLARATION_EXPR);
    }

    protected override parsedValue: RuntimeValue = new VoidValue();

    public override isEvaluateImplemented: boolean = true;

    public override evaluate(interpreter: Interpreter): RuntimeValue {
        this.params.forEach((param) => {
            const [name, type] = param;
            if (this.params.filter((param) => param[0].value === name.value).length > 1) {
                throw new InterpreterError(`Duplicate parameter name: ${name.value}`, this);
            }

            if (type === ValueType.VOID || type === ValueType.ANY || type === ValueType.NULL) {
                throw new InterpreterError(`Invalid parameter type: ${type}`, this);
            }
            interpreter.environment.getType(type);
        });

        if (this.returnType.value === ValueType.ANY || this.returnType.value === ValueType.NULL) {
            throw new InterpreterError(`Invalid function return type: ${this.returnType.value}`, this);
        }
        const func = new FunctionValue(
            this.name,
            this.params,
            this.body,
            this.returnType.value,
            false,
            interpreter.environment,
        );

        interpreter.environment.defineFunction(this.name.value, func);
        return func;
    }

    public override toString(): string {
        return PrintService.print(this.parsedValue);
    }
}
