import Environment from '../Environment/Environment';
import BreakStatement from '../Errors/BreakStatement';
import ContinueStatement from '../Errors/ContinueStatement';
import InterpreterError from '../Errors/InterpreterError';
import ReturnStatement from '../Errors/ReturnStatement';
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
import Token from '../Lexer/Token';
import TokenType from '../Lexer/TokenType';
import PrintService from '../services/print.service';
import ExprType from './ExprType';

export class Expr {
    constructor(public type: ExprType) {}

    protected parsedValue: RuntimeValue = new VoidValue();

    public parse(_: Interpreter): any {
        return this.parsedValue;
    }

    public isParseImplemented: boolean = false;

    public toString(): string {
        return PrintService.print(this.parsedValue || new VoidValue());
    }
}

export class EmptyExpr extends Expr {
    constructor() {
        super(ExprType.EMPTY_EXP);
    }

    protected override parsedValue: RuntimeValue = new VoidValue();

    public override isParseImplemented: boolean = true;

    public override parse(): VoidValue {
        return this.parsedValue;
    }

    public override toString(): string {
        return PrintService.printPrimitiveValue(this.parsedValue);
    }
}

export class StringLiteralExpr extends Expr {
    constructor(public value: string) {
        super(ExprType.STRING_LITERAL_EXPR);
    }

    protected override parsedValue: StringValue = new StringValue('');

    public override isParseImplemented: boolean = true;

    public override parse(): StringValue {
        return (this.parsedValue = new StringValue(this.value));
    }

    public override toString(): string {
        return PrintService.print(this.parsedValue);
    }
}

export class TemplateLiteralExpr extends Expr {
    constructor(public value: Expr[]) {
        super(ExprType.TEMPLATE_LITERAL_TOKEN);
    }

    protected override parsedValue: StringValue = new StringValue('');

    public override isParseImplemented: boolean = true;

    public override parse(interpreter: Interpreter): StringValue {
        const parts = this.value;
        const parsed: StringValue[] = parts.map((part) => interpreter.evaluateExpr(part) as StringValue);
        let result = '';
        for (const segment of parsed) {
            const value = segment.value;
            const parsedValue = value == null ? '' : value.toString();
            result += parsedValue;
        }

        return (this.parsedValue = new StringValue(result));
    }
}

export class NumberLiteralExpr extends Expr {
    constructor(public value: number) {
        super(ExprType.NUMBER_LITERAL_EXPR);
    }

    protected override parsedValue: NumberValue = new NumberValue(0);

    public override isParseImplemented: boolean = true;

    public override parse(): NumberValue {
        const value = Number(this.value.toString());
        if (isNaN(value)) {
            throw new InterpreterError('Cannot parse number literal', this);
        }
        return (this.parsedValue = new NumberValue(value));
    }
    public override toString(): string {
        return PrintService.print(this.parsedValue);
    }
}

export class BooleanLiteralExpr extends Expr {
    constructor(public value: boolean) {
        super(ExprType.BOOLEAN_LITERAL_EXPR);
    }

    protected override parsedValue: BooleanValue = new BooleanValue(false);

    public override isParseImplemented: boolean = true;

    public override parse(): BooleanValue {
        return (this.parsedValue = new BooleanValue(this.value));
    }

    public override toString(): string {
        return PrintService.print(this.parsedValue);
    }
}

export class NullLiteralExpr extends Expr {
    constructor() {
        super(ExprType.NULL_LITERAL_EXPR);
    }

    protected override parsedValue: NullValue = new NullValue();

    public override isParseImplemented: boolean = true;

    public override parse(): RuntimeValue {
        return this.parsedValue;
    }

    public override toString(): string {
        return PrintService.print(this.parsedValue);
    }
}

export class TypeLiteralExpr extends Expr {
    constructor(public value: string) {
        super(ExprType.TYPE_LITERAL_EXPR);
    }
}

export class ObjectLiteralExpr extends Expr {
    constructor(public value: [Token, Expr][]) {
        super(ExprType.OBJECT_LITERAL_EXPR);
    }

    protected override parsedValue: ObjectValue = new ObjectValue(new Map<string, RuntimeValue>(), ValueType.OBJECT);

    public override isParseImplemented: boolean = true;

    public override parse(interpreter: Interpreter): ObjectValue {
        const object: Map<string, RuntimeValue> = new Map<string, RuntimeValue>();
        this.value.forEach((pair) => {
            const [key, value] = pair;
            object.set(key.value, interpreter.evaluateExpr(value));
        });
        return (this.parsedValue = new ObjectValue(object, ValueType.OBJECT));
    }

    public override toString(): string {
        return PrintService.print(this.parsedValue);
    }
}

export class IdentifierExpr extends Expr {
    constructor(public value: string) {
        super(ExprType.IDENTIFIER_EXPR);
    }

    protected override parsedValue: RuntimeValue = new VoidValue();

    public override isParseImplemented: boolean = true;

    public override parse(interpreter: Interpreter) {
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

export class AssignmentExpr extends Expr {
    constructor(public name: Token, public value: Expr) {
        super(ExprType.ASSIGNMENT_EXPR);
    }

    protected override parsedValue: RuntimeValue = new VoidValue();

    public override isParseImplemented: boolean = true;

    public override parse(interpreter: Interpreter): RuntimeValue {
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

export class BinaryExpr extends Expr {
    constructor(public left: Expr, public operator: Token, public right: Expr) {
        super(ExprType.BINARY_EXPR);
    }

    protected override parsedValue: RuntimeValue = new VoidValue();

    public override isParseImplemented: boolean = true;

    public override parse(interpreter: Interpreter): RuntimeValue {
        const left = interpreter.evaluateExpr(this.left);
        const right = interpreter.evaluateExpr(this.right);

        if (left.type === ValueType.NUMBER && right.type === ValueType.NUMBER) {
            return (this.parsedValue = interpreter.evaluateBinaryNumberExpr(
                this,
                left as NumberValue,
                right as NumberValue,
            ));
        } else if (left.type === ValueType.STRING && right.type === ValueType.STRING) {
            return (this.parsedValue = interpreter.evaluateBinaryStringExpr(
                this.operator,
                left as StringValue,
                right as StringValue,
            ));
        } else if (left.type === ValueType.BOOL && right.type === ValueType.BOOL) {
            return (this.parsedValue = interpreter.evaluateBinaryBooleanExpr(
                this.operator,
                left as BooleanValue,
                right as BooleanValue,
            ));
        }

        throw new InterpreterError(
            `Invalid binary expression between: ${left.type} ${this.operator.value} ${right.type}`,
            this,
        );
    }

    public override toString(): string {
        return PrintService.print(this.parsedValue);
    }
}

export class UnaryExpr extends Expr {
    constructor(public operator: Token, public right: Expr) {
        super(ExprType.UNARY_EXPR);
    }

    protected override parsedValue: RuntimeValue = new VoidValue();

    public override isParseImplemented: boolean = true;

    public override parse(interpreter: Interpreter): RuntimeValue {
        const right = interpreter.evaluateExpr(this.right);
        switch (this.operator.type) {
            case TokenType.INCREMENT_TOKEN: {
                if (right.type !== ValueType.NUMBER) {
                    throw new InterpreterError(`Invalid unary expression: ${this.operator.value} ${right.type}`, this);
                }
                const variableName =
                    this.right.type === ExprType.IDENTIFIER_EXPR ? (this.right as IdentifierExpr).value : null;
                if (!variableName) {
                    throw new InterpreterError(`Invalid unary expression: ${this.operator.value} ${right.type}`, this);
                }
                const variableValue = interpreter.environment.getVariable(variableName);
                interpreter.environment.setVariable(
                    variableName,
                    new NumberValue((variableValue[0] as NumberValue).value + 1),
                );
                return (this.parsedValue = right);
            }
            case TokenType.DECREMENT_TOKEN: {
                if (right.type !== ValueType.NUMBER) {
                    throw new InterpreterError(`Invalid unary expression: ${this.operator.value} ${right.type}`, this);
                }
                const variableName =
                    this.right.type === ExprType.IDENTIFIER_EXPR ? (this.right as IdentifierExpr).value : null;
                if (!variableName) {
                    throw new InterpreterError(`Invalid unary expression: ${this.operator.value} ${right.type}`, this);
                }
                const variableValue = interpreter.environment.getVariable(variableName);
                interpreter.environment.setVariable(
                    variableName,
                    new NumberValue((variableValue[0] as NumberValue).value - 1),
                );
                return (this.parsedValue = right);
            }
            case TokenType.MINUS_TOKEN:
                if (right.type !== ValueType.NUMBER) {
                    throw new InterpreterError(`Invalid unary expression: ${this.operator.value} ${right.type}`, this);
                }
                return (this.parsedValue = new NumberValue(-(right as NumberValue).value));
            case TokenType.BANG_TOKEN:
                if (right.type !== ValueType.BOOL) {
                    throw new InterpreterError(`Invalid unary expression: ${this.operator.value} ${right.type}`, this);
                }
                return (this.parsedValue = new BooleanValue(!(right as BooleanValue).value));
            default:
                throw new InterpreterError(`Invalid unary expression: ${this.operator.value}`, this);
        }
    }

    public override toString(): string {
        return PrintService.print(this.parsedValue);
    }
}

export class GroupingExpr extends Expr {
    constructor(public expression: Expr) {
        super(ExprType.GROUPING_EXPR);
    }
}

export class FunctionCallExpr extends Expr {
    constructor(public callee: Token, public args: Expr[]) {
        super(ExprType.CALL_EXPR);
    }

    protected override parsedValue: RuntimeValue = new VoidValue();

    public override isParseImplemented: boolean = true;

    public override parse(interpreter: Interpreter): RuntimeValue {
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

export class VariableDeclarationExpr extends Expr {
    constructor(public name: Token, public typeOf: Token, public value: Expr | null, public isConst: boolean = false) {
        super(ExprType.VARIABLE_DECLARATION_EXPR);
    }

    protected override parsedValue: RuntimeValue = new VoidValue();

    public override isParseImplemented: boolean = true;

    public override parse(interpreter: Interpreter) {
        if (
            this.typeOf.value === ValueType.ANY ||
            this.typeOf.value === ValueType.VOID ||
            this.typeOf.value === ValueType.NULL
        ) {
            throw new InterpreterError(`Invalid variable type: ${this.typeOf.value}`, this);
        }
        const value = this.value ? interpreter.evaluateExpr(this.value) : new NullValue();
        const type = this.typeOf.value;

        if (value.type !== ValueType.OBJECT && value.type !== this.typeOf.value)
            throw new InterpreterError(`Invalid variable type: ${value.type} expected ${this.typeOf.value}`, this);
        if (value.type === ValueType.OBJECT && !interpreter.environment.isDefinedType(type))
            throw new InterpreterError(`Type ${type} is not defined!`, this);
        if (value.type === ValueType.OBJECT) interpreter.verifyObject(value as ObjectValue, type);
        if (value.type === ValueType.OBJECT) (value as ObjectValue).typeOf = type;

        interpreter.environment.defineVariable(this.name.value, value, this.isConst);
        return (this.parsedValue = value);
    }

    public override toString(): string {
        return PrintService.print(this.parsedValue);
    }
}

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

    public override isParseImplemented: boolean = true;

    public override parse(interpreter: Interpreter): RuntimeValue {
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

export class IfStmt extends Expr {
    constructor(public condition: Expr, public thenBranch: BlockStmt, public elseBranch: BlockStmt | IfStmt | null) {
        super(ExprType.IF_STMT);
    }

    protected override parsedValue: RuntimeValue = new VoidValue();

    public override isParseImplemented: boolean = true;

    public override parse(interpreter: Interpreter): RuntimeValue {
        const condition = interpreter.evaluateExpr(this.condition) as BooleanValue;
        if (condition.type !== ValueType.BOOL) {
            throw new InterpreterError(`Invalid if condition type: ${condition.type}`, this);
        }
        if (condition.value) {
            return (this.parsedValue = this.thenBranch.parse(interpreter));
        } else if (this.elseBranch) {
            if (this.elseBranch.type === ExprType.IF_STMT) {
                return (this.parsedValue = this.elseBranch.parse(interpreter));
            } else if (this.elseBranch.type === ExprType.BLOCK_STMT) {
                return (this.parsedValue = this.elseBranch.parse(interpreter));
            }
        }
        return (this.parsedValue = new VoidValue());
    }

    public override toString(): string {
        return PrintService.print(this.parsedValue);
    }
}

export class TernaryExpr extends Expr {
    constructor(public condition: Expr, public thenBranch: Expr, public elseBranch: Expr) {
        super(ExprType.TERNARY_EXPR);
    }

    protected override parsedValue: RuntimeValue = new VoidValue();

    public override isParseImplemented: boolean = true;

    public override parse(interpreter: Interpreter): RuntimeValue {
        const condition = interpreter.evaluateExpr(this.condition) as BooleanValue;
        if (condition.type !== ValueType.BOOL) {
            throw new InterpreterError(`Invalid ternary condition type: ${condition.type}`, this);
        }
        return (this.parsedValue = interpreter.evaluateExpr(condition.value ? this.thenBranch : this.elseBranch));
    }

    public override toString(): string {
        return PrintService.print(this.parsedValue);
    }
}

export class WhileUntilStmt extends Expr {
    constructor(
        public override type: ExprType,
        public condition: Expr,
        public failsafe: Expr | null,
        public body: Expr,
    ) {
        super(ExprType.WHILE_STMT);
    }

    protected override parsedValue: RuntimeValue = new VoidValue();

    public override isParseImplemented: boolean = true;

    public override parse(interpreter: Interpreter): RuntimeValue {
        const localInterpreter = new Interpreter(new Environment(interpreter.environment));
        let failsafe =
            Number(this.failsafe && (localInterpreter.evaluateExpr(this.failsafe) as NumberValue)?.value) || undefined;

        if (this.type === ExprType.WHILE_STMT) {
            while ((interpreter.evaluateExpr(this.condition) as BooleanValue).value === true) {
                try {
                    localInterpreter.evaluateExpr(this.body);
                    if (failsafe !== undefined && failsafe-- < 0) throw new BreakStatement(`Failsafe limit reached`);
                } catch (err) {
                    if (err instanceof BreakStatement) {
                        break;
                    } else if (err instanceof ContinueStatement) {
                        continue;
                    }
                    throw err;
                }
            }
        } else if (this.type === ExprType.UNTIL_STMT) {
            while ((interpreter.evaluateExpr(this.condition) as BooleanValue).value === false) {
                try {
                    localInterpreter.evaluateExpr(this.body);
                    if (failsafe !== undefined && failsafe-- < 0) throw new BreakStatement(`Failsafe limit reached`);
                } catch (err) {
                    if (err instanceof BreakStatement) {
                        break;
                    } else if (err instanceof ContinueStatement) {
                        continue;
                    }
                    throw err;
                }
            }
        }
        return this.parsedValue;
    }

    public override toString(): string {
        return PrintService.print(this.parsedValue);
    }
}

export class DoWhileUntilStmt extends Expr {
    constructor(
        public override type: ExprType,
        public condition: Expr,
        public failsafe: Expr | null,
        public body: Expr,
    ) {
        super(ExprType.DO_WHILE_STMT);
    }

    protected override parsedValue: RuntimeValue = new VoidValue();

    public override isParseImplemented: boolean = true;

    public override parse(interpreter: Interpreter): RuntimeValue {
        const localInterpreter = new Interpreter(new Environment(interpreter.environment));
        let failsafe =
            Number(this.failsafe && (localInterpreter.evaluateExpr(this.failsafe) as NumberValue)?.value) || undefined;

        if (this.type === ExprType.DO_WHILE_STMT) {
            do {
                try {
                    localInterpreter.evaluate(this.body);
                    if (failsafe !== undefined && failsafe-- < 0) throw new BreakStatement(`Failsafe limit reached`);
                } catch (err) {
                    if (err instanceof BreakStatement) {
                        break;
                    } else if (err instanceof ContinueStatement) {
                        continue;
                    }
                    throw err;
                }
            } while ((localInterpreter.evaluateExpr(this.condition) as BooleanValue).value === true);
        } else if (this.type === ExprType.DO_UNTIL_STMT) {
            do {
                try {
                    localInterpreter.evaluate(this.body);
                    if (failsafe !== undefined && failsafe-- < 0) throw new BreakStatement(`Failsafe limit reached`);
                } catch (err) {
                    if (err instanceof BreakStatement) {
                        break;
                    } else if (err instanceof ContinueStatement) {
                        continue;
                    }
                    throw err;
                }
            } while ((localInterpreter.evaluateExpr(this.condition) as BooleanValue).value === false);
        }
        return this.parsedValue;
    }
}

export class ForStmt extends Expr {
    constructor(
        public initializer: Expr | null,
        public condition: Expr | null,
        public increment: Expr | null,
        public failsafe: Expr | null,
        public body: Expr,
    ) {
        super(ExprType.FOR_STMT);
    }

    protected override parsedValue: RuntimeValue = new VoidValue();

    public override isParseImplemented: boolean = true;

    public override parse(interpreter: Interpreter): RuntimeValue {
        const localInterpreter = new Interpreter(new Environment(interpreter.environment));
        let failsafe =
            Number(this.failsafe && (localInterpreter.evaluateExpr(this.failsafe) as NumberValue)?.value) || undefined;

        if (this.initializer) {
            localInterpreter.evaluateExpr(this.initializer);
        }

        while (true) {
            if (this.condition) {
                const condition = localInterpreter.evaluateExpr(this.condition) as BooleanValue;
                if (condition.value !== true) {
                    break;
                }
            }
            try {
                localInterpreter.evaluateExpr(this.body);
                if (failsafe !== undefined && failsafe-- < 0) throw new BreakStatement('Failsafe limit reached');
            } catch (err) {
                if (err instanceof BreakStatement) {
                    break;
                } else if (err instanceof ContinueStatement) {
                    continue;
                } else if (err instanceof ReturnStatement) {
                    throw err;
                }
            }
            if (this.increment) {
                localInterpreter.evaluateExpr(this.increment);
            }
        }
        return this.parsedValue;
    }

    public override toString(): string {
        return PrintService.print(this.parsedValue);
    }
}

export class BlockStmt extends Expr {
    constructor(public statements: Expr[]) {
        super(ExprType.BLOCK_STMT);
    }

    protected override parsedValue: RuntimeValue = new VoidValue();

    public override isParseImplemented: boolean = true;

    public override parse(interpreter: Interpreter): RuntimeValue {
        const localInterpreter = new Interpreter(new Environment(interpreter.environment));
        for (const expr of this.statements) {
            localInterpreter.evaluateExpr(expr);
        }
        return new VoidValue();
    }

    public override toString(): string {
        return PrintService.print(this.parsedValue);
    }
}

export class ReturnStmt extends Expr {
    constructor(public value: Expr) {
        super(ExprType.RETURN_STMT);
    }

    protected override parsedValue: RuntimeValue = new VoidValue();

    public override isParseImplemented: boolean = true;

    public override parse(interpreter: Interpreter): RuntimeValue {
        const value = interpreter.evaluateExpr(this.value);
        this.parsedValue = value;
        throw new ReturnStatement(value);
    }

    public override toString(): string {
        return PrintService.print(this.parsedValue);
    }
}

export class BreakStmt extends Expr {
    constructor() {
        super(ExprType.BREAK_STMT);
    }

    protected override parsedValue: RuntimeValue = new VoidValue();

    public override isParseImplemented: boolean = true;

    public override parse(): RuntimeValue {
        throw new BreakStatement();
    }

    public override toString(): string {
        return PrintService.print(this.parsedValue);
    }
}

export class ContinueStmt extends Expr {
    constructor() {
        super(ExprType.CONTINUE_STMT);
    }

    protected override parsedValue: RuntimeValue = new VoidValue();

    public override isParseImplemented: boolean = true;

    public override parse(): RuntimeValue {
        throw new ContinueStatement();
    }

    public override toString(): string {
        return PrintService.print(this.parsedValue);
    }
}

export class TypeDeclarationStmt extends Expr {
    constructor(public name: Token, public members: [Token, Token][]) {
        super(ExprType.TYPE_DECLARATION_STMT);
    }

    protected override parsedValue: RuntimeValue = new VoidValue();

    public override isParseImplemented: boolean = true;

    public override parse(interpreter: Interpreter): RuntimeValue {
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

export class ObjectAccessExpr extends Expr {
    constructor(public object: Expr, public name: Token) {
        super(ExprType.OBJECT_ACCESS_EXPR);
    }

    protected override parsedValue: RuntimeValue = new VoidValue();

    public override isParseImplemented: boolean = true;

    public override parse(interpreter: Interpreter): RuntimeValue {
        const object = interpreter.evaluateExpr(this.object) as ObjectValue;
        const property = this.name.value;
        if (!object.value.has(property)) {
            throw new InterpreterError(`Invalid property access: ${property}`, this);
        }
        this.parsedValue = object.value.get(property) as RuntimeValue;
        return this.parsedValue;
    }

    public override toString(): string {
        return PrintService.print(this.parsedValue);
    }
}
