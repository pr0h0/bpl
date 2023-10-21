import Environment from '../Environment/Environment';
import BreakStatement from '../Errors/BreakStatement';
import ContinueStatement from '../Errors/ContinueStatement';
import InterpreterError from '../Errors/InterpreterError';
import ReturnStatement from '../Errors/ReturnStatement';
import Token from '../Lexer/Token';
import TokenType from '../Lexer/TokenType';
import {
    AssignmentExpr,
    BinaryExpr,
    BlockStmt,
    BooleanLiteralExpr,
    BreakStmt,
    ContinueStmt,
    DoWhileUntilStmt,
    EmptyExpr,
    Expr,
    ForStmt,
    FunctionCallExpr,
    FunctionDeclarationExpr,
    IdentifierExpr,
    IfStmt,
    NullLiteralExpr,
    NumberLiteralExpr,
    ObjectLiteralExpr,
    ReturnStmt,
    StringLiteralExpr,
    TemplateLiteralExpr,
    TernaryExpr,
    TypeDeclarationStmt,
    UnaryExpr,
    VariableDeclarationExpr,
    WhileUntilStmt,
} from '../Parser/Expr';
import ExprType from '../Parser/ExprType';
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
} from './Values';
import ValueType from './ValueType';

class Interpreter {
    private environment: Environment;

    constructor(env?: Environment) {
        this.environment = env || new Environment();
    }
    public evaluate(stmt: Expr | Expr[]): RuntimeValue | RuntimeValue[] {
        if (Array.isArray(stmt)) {
            const outputs = [];
            for (const expr of stmt) {
                outputs.push(this.evaluateExpr(expr));
            }
            return outputs;
        } else {
            return this.evaluateExpr(stmt);
        }
    }

    private evaluateExpr(expr: Expr): RuntimeValue {
        if (expr instanceof NumberLiteralExpr) {
            return this.evaluateNumberLiteral(expr);
        } else if (expr instanceof StringLiteralExpr) {
            return this.evaluateStringLiteral(expr);
        } else if (expr instanceof BooleanLiteralExpr) {
            return this.evaluateBooleanLiteral(expr);
        } else if (expr instanceof NullLiteralExpr) {
            return this.evaluateNullLiteral(expr);
        } else if (expr instanceof ObjectLiteralExpr) {
            return this.evaluateObjectLiteralExpr(expr);
        } else if (expr instanceof EmptyExpr) {
            return new VoidValue();
        } else if (expr instanceof BinaryExpr) {
            return this.evaluateBinaryExpr(expr);
        } else if (expr instanceof BlockStmt) {
            return this.evaluateBlockStmt(expr);
        } else if (expr instanceof IfStmt) {
            return this.evaluateIfStmt(expr);
        } else if (expr instanceof ReturnStmt) {
            return this.evaluateReturnStmt(expr);
        } else if (expr instanceof BreakStmt) {
            return this.evaluateBreakStmt(expr);
        } else if (expr instanceof ContinueStmt) {
            return this.evaluateContinueStmt(expr);
        } else if (expr instanceof VariableDeclarationExpr) {
            return this.evaluateVariableDeclarationExpr(expr);
        } else if (expr instanceof IdentifierExpr) {
            return this.evaluateIdentifierExpr(expr);
        } else if (expr instanceof FunctionCallExpr) {
            return this.evaluateFunctionCallExpr(expr);
        } else if (expr instanceof ForStmt) {
            return this.evaluateForStmt(expr);
        } else if (expr instanceof UnaryExpr) {
            return this.evaluateUnaryExpr(expr);
        } else if (expr instanceof FunctionDeclarationExpr) {
            return this.evaluateFunctionDeclarationExpr(expr);
        } else if (expr instanceof TernaryExpr) {
            return this.evaluateTernaryExpr(expr);
        } else if (expr instanceof AssignmentExpr) {
            return this.evaluateAssignmentExpr(expr);
        } else if (expr instanceof TemplateLiteralExpr) {
            return this.evaluateTemplateLiteralExpr(expr);
        } else if (expr instanceof WhileUntilStmt) {
            return this.evaluateWhileUntilStmt(expr);
        } else if (expr instanceof DoWhileUntilStmt) {
            return this.evaluateDoWhileUntilStmt(expr);
        } else if (expr instanceof TypeDeclarationStmt) {
            return this.evaluateTypeDeclarationStmt(expr);
        }

        throw new InterpreterError(`Invalid expression: ${expr.constructor.name}`, expr);
    }

    private evaluateObjectLiteralExpr(expr: ObjectLiteralExpr): RuntimeValue {
        const object: Map<string, RuntimeValue> = new Map<string, RuntimeValue>();
        expr.value.forEach((pair) => {
            const [key, value] = pair;
            object.set(key.value, this.evaluateExpr(value));
        });
        return new ObjectValue(object, ValueType.OBJECT);
    }

    private evaluateTypeDeclarationStmt(stmt: TypeDeclarationStmt): RuntimeValue {
        const name = stmt.name.value;
        const members = stmt.members;
        const extraProperties: Record<string, string> = {};
        members.forEach((member) => {
            if ([ValueType.ANY, ValueType.NULL, ValueType.VOID].includes(member[1].value as ValueType)) {
                throw new InterpreterError(`Invalid property type: ${member[1].value}`, stmt);
            }
            extraProperties[member[0].value] = member[1].value;
            this.environment.getType(member[1].value);
        });

        this.environment.defineType(name, ValueType.TYPE, extraProperties);
        return new VoidValue();
    }

    private evaluateWhileUntilStmt(stmt: WhileUntilStmt): RuntimeValue {
        const interpreter = new Interpreter(new Environment(this.environment));
        let failsafe =
            Number(stmt.failsafe && (interpreter.evaluateExpr(stmt.failsafe) as NumberValue)?.value) || undefined;

        if (stmt.type === ExprType.WHILE_STMT) {
            while ((this.evaluateExpr(stmt.condition) as BooleanValue).value === true) {
                try {
                    interpreter.evaluateExpr(stmt.body);
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
        } else if (stmt.type === ExprType.UNTIL_STMT) {
            while ((this.evaluateExpr(stmt.condition) as BooleanValue).value === false) {
                try {
                    interpreter.evaluateExpr(stmt.body);
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
        return new VoidValue();
    }

    private evaluateDoWhileUntilStmt(stmt: DoWhileUntilStmt): RuntimeValue {
        const interpreter = new Interpreter(new Environment(this.environment));
        let failsafe =
            Number(stmt.failsafe && (interpreter.evaluateExpr(stmt.failsafe) as NumberValue)?.value) || undefined;

        if (stmt.type === ExprType.DO_WHILE_STMT) {
            do {
                try {
                    interpreter.evaluate(stmt.body);
                    if (failsafe !== undefined && failsafe-- < 0) throw new BreakStatement(`Failsafe limit reached`);
                } catch (err) {
                    if (err instanceof BreakStatement) {
                        break;
                    } else if (err instanceof ContinueStatement) {
                        continue;
                    }
                    throw err;
                }
            } while ((interpreter.evaluateExpr(stmt.condition) as BooleanValue).value === true);
        } else if (stmt.type === ExprType.DO_UNTIL_STMT) {
            do {
                try {
                    interpreter.evaluate(stmt.body);
                    if (failsafe !== undefined && failsafe-- < 0) throw new BreakStatement(`Failsafe limit reached`);
                } catch (err) {
                    if (err instanceof BreakStatement) {
                        break;
                    } else if (err instanceof ContinueStatement) {
                        continue;
                    }
                    throw err;
                }
            } while ((interpreter.evaluateExpr(stmt.condition) as BooleanValue).value === false);
        }
        return new VoidValue();
    }

    private evaluateTemplateLiteralExpr(expr: TemplateLiteralExpr): RuntimeValue {
        const parts = expr.value;
        const parsed: StringValue[] = parts.map((part) => this.evaluateExpr(part) as StringValue);
        let result = '';
        for (const segment of parsed) {
            const value = segment.value;
            const parsedValue = value == null ? '' : value.toString();
            result += parsedValue;
        }

        return new StringValue(result);
    }

    private evaluateAssignmentExpr(expr: AssignmentExpr): RuntimeValue {
        const value = this.evaluateExpr(expr.value);
        const variableName = expr.name.value;

        const variable = this.environment.getVariable(variableName);

        if (value.type !== variable[1]) {
            throw new InterpreterError(`Invalid assignment type: ${value.type} expected ${variable[1]}`, expr);
        }

        this.environment.setVariable(variableName, value);
        return value;
    }

    private evaluateTernaryExpr(expr: TernaryExpr): RuntimeValue {
        const condition = this.evaluateExpr(expr.condition) as BooleanValue;
        if (condition.type !== ValueType.BOOL) {
            throw new InterpreterError(`Invalid if condition type: ${condition.type}`, expr);
        }
        return this.evaluateExpr(condition.value ? expr.thenBranch : expr.elseBranch);
    }

    private evaluateFunctionDeclarationExpr(expr: FunctionDeclarationExpr): RuntimeValue {
        expr.params.forEach((param) => {
            const [name, type] = param;
            if (expr.params.filter((param) => param[0].value === name.value).length > 1) {
                throw new InterpreterError(`Duplicate parameter name: ${name.value}`, expr);
            }

            if (type === ValueType.VOID || type === ValueType.ANY || type === ValueType.NULL) {
                throw new InterpreterError(`Invalid parameter type: ${type}`, expr);
            }
            this.environment.getType(type);
        });

        if (expr.returnType.value === ValueType.ANY || expr.returnType.value === ValueType.NULL) {
            throw new InterpreterError(`Invalid function return type: ${expr.returnType.value}`, expr);
        }
        const func = new FunctionValue(
            expr.name,
            expr.params,
            expr.body,
            expr.returnType.value,
            false,
            this.environment,
        );

        this.environment.defineFunction(expr.name.value, func);
        return func;
    }
    private evaluateUnaryExpr(expr: UnaryExpr): RuntimeValue {
        const right = this.evaluateExpr(expr.right);
        switch (expr.operator.type) {
            case TokenType.INCREMENT_TOKEN: {
                if (right.type !== ValueType.NUMBER) {
                    throw new InterpreterError(`Invalid unary expression: ${expr.operator.value} ${right.type}`, expr);
                }
                const variableName =
                    expr.right.type === ExprType.IDENTIFIER_EXPR ? (expr.right as IdentifierExpr).value : null;
                if (!variableName) {
                    throw new InterpreterError(`Invalid unary expression: ${expr.operator.value} ${right.type}`, expr);
                }
                const variableValue = this.environment.getVariable(variableName);
                this.environment.setVariable(
                    variableName,
                    new NumberValue((variableValue[0] as NumberValue).value + 1),
                );
                return new NumberValue((right as NumberValue).value + 1);
            }
            case TokenType.DECREMENT_TOKEN: {
                if (right.type !== ValueType.NUMBER) {
                    throw new InterpreterError(`Invalid unary expression: ${expr.operator.value} ${right.type}`, expr);
                }
                const variableName =
                    expr.right.type === ExprType.IDENTIFIER_EXPR ? (expr.right as IdentifierExpr).value : null;
                if (!variableName) {
                    throw new InterpreterError(`Invalid unary expression: ${expr.operator.value} ${right.type}`, expr);
                }
                const variableValue = this.environment.getVariable(variableName);
                this.environment.setVariable(
                    variableName,
                    new NumberValue((variableValue[0] as NumberValue).value - 1),
                );
                return new NumberValue((right as NumberValue).value - 1);
            }
            case TokenType.MINUS_TOKEN:
                if (right.type !== ValueType.NUMBER) {
                    throw new InterpreterError(`Invalid unary expression: ${expr.operator.value} ${right.type}`, expr);
                }
                return new NumberValue(-(right as NumberValue).value);
            case TokenType.BANG_TOKEN:
                if (right.type !== ValueType.BOOL) {
                    throw new InterpreterError(`Invalid unary expression: ${expr.operator.value} ${right.type}`, expr);
                }
                return new BooleanValue(!(right as BooleanValue).value);
            default:
                throw new InterpreterError(`Invalid unary expression: ${expr.operator.value}`, expr);
        }
    }
    private evaluateForStmt(stmt: ForStmt): RuntimeValue {
        const interpreter = new Interpreter(new Environment(this.environment));
        let failsafe =
            Number(stmt.failsafe && (interpreter.evaluateExpr(stmt.failsafe) as NumberValue)?.value) || undefined;

        if (stmt.initializer) {
            interpreter.evaluateExpr(stmt.initializer);
        }

        while (true) {
            if (stmt.condition) {
                const condition = interpreter.evaluateExpr(stmt.condition) as BooleanValue;
                if (condition.value !== true) {
                    break;
                }
            }
            try {
                interpreter.evaluateExpr(stmt.body);
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
            if (stmt.increment) {
                interpreter.evaluateExpr(stmt.increment);
            }
        }
        return new VoidValue();
    }
    private evaluateFunctionCallExpr(expr: FunctionCallExpr): RuntimeValue {
        const func = this.environment.getFunction(expr.callee.value) as FunctionValue | NativeFunctionValue;
        const env = new Environment(func.closure || this.environment);
        const interpreter = new Interpreter(env);
        const returnType = func.typeOf as ValueType;

        try {
            if (expr.args.length !== func.params.length) {
                throw new InterpreterError(
                    `Invalid number of arguments: ${expr.args.length} expected ${func.params.length}`,
                    expr,
                );
            }

            expr.args.forEach((arg, index) => {
                const value = this.evaluateExpr(arg);
                if (
                    (func.isNative &&
                        func.params[index][1] !== ValueType.ANY &&
                        func.params[index][1] !== value.type) ||
                    (!func.isNative &&
                        (func.params[index][1] !== value.type ||
                            (func.params[index][1] !== ValueType.OBJECT && func.params[index][1] !== value.type) ||
                            (func.params[index][1] === ValueType.OBJECT &&
                                (value as ObjectValue).typeOf !== func.params[index][1] &&
                                this.verifyObject(value as ObjectValue, func.params[index][1]) !== undefined)))
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

            if (func.isNative)
                return (func as NativeFunctionValue).body(expr.args.map((arg) => this.evaluateExpr(arg)));

            interpreter.evaluate((func as FunctionValue).body);
        } catch (err) {
            if (err instanceof ReturnStatement) {
                if (returnType === ValueType.VOID)
                    throw new InterpreterError('Function of type VOID cannot return a value', expr);
                if (
                    (err.value.type !== ValueType.OBJECT && returnType !== err.value.type) ||
                    (err.value.type === ValueType.OBJECT &&
                        (err.value as ObjectValue).typeOf !== returnType &&
                        this.verifyObject(err.value as ObjectValue, returnType) !== undefined)
                )
                    throw new InterpreterError(
                        `Invalid return type: ${err.value.type}, but expected ${returnType}`,
                        expr,
                    );
                return err.value;
            } else if (err instanceof BreakStatement) {
                throw new InterpreterError('Break statement outside of loop', expr);
            } else if (err instanceof ContinueStatement) {
                throw new InterpreterError('Continue statement outside of loop', expr);
            }
            throw err;
        }
        return new VoidValue();
    }
    private evaluateIdentifierExpr(expr: IdentifierExpr): RuntimeValue {
        let variableValue: [RuntimeValue, string, boolean] | null = null;
        let functionValue: FunctionValue | NativeFunctionValue | null = null;
        let typeValue: TypeValue | null = null;

        let flag = '';
        if (this.environment.isDefinedVariable(expr.value)) {
            variableValue = this.environment.getVariable(expr.value);
            flag = 'variable';
        } else if (this.environment.isDefinedFunction(expr.value)) {
            functionValue = this.environment.getFunction(expr.value);
            flag = 'function';
        } else if (this.environment.isDefinedType(expr.value)) {
            typeValue = this.environment.getType(expr.value);
            flag = 'type';
        }

        if (flag === 'variable' && variableValue !== null) {
            switch (variableValue[0].type) {
                case ValueType.NUMBER:
                    return new NumberValue((variableValue[0] as NumberValue).value);
                case ValueType.STRING:
                    return new StringValue((variableValue[0] as StringValue).value);
                case ValueType.BOOL:
                    return new BooleanValue((variableValue[0] as BooleanValue).value);
                case ValueType.NULL:
                    return new NullValue();
                case ValueType.OBJECT:
                    return new ObjectValue((variableValue[0] as ObjectValue).value, variableValue[1]);
                case ValueType.TYPE:
                    return new TypeValue(
                        (variableValue[0] as TypeValue).value,
                        variableValue[1],
                        (variableValue[0] as TypeValue).valueDefinition,
                    );
                case ValueType.FUNC:
                    return new FunctionValue(
                        (variableValue[0] as FunctionValue).name,
                        (variableValue[0] as FunctionValue).params,
                        (variableValue[0] as FunctionValue).body,
                        (variableValue[0] as FunctionValue).typeOf,
                    );
                case ValueType.NATIVE_FUNCTION:
                    return new NativeFunctionValue(
                        (variableValue[0] as NativeFunctionValue).name,
                        (variableValue[0] as NativeFunctionValue).params,
                        (variableValue[0] as NativeFunctionValue).body,
                        (variableValue[0] as NativeFunctionValue).typeOf,
                    );
                default: {
                    const type = variableValue[1];
                    if (this.environment.isDefinedType(type)) {
                        const typeValue = this.environment.getType(type);
                        return new ObjectValue((variableValue[0] as ObjectValue).value, typeValue.type);
                    }
                    throw new InterpreterError(`Invalid value type: ${variableValue[1]}`, expr);
                }
            }
        } else if (flag === 'function' && functionValue !== null) {
            return functionValue as FunctionValue | NativeFunctionValue;
        } else if (flag === 'type' && typeValue !== null) {
            return typeValue;
        }
        throw this.environment.getVariable(expr.value);
    }
    private evaluateVariableDeclarationExpr(expr: VariableDeclarationExpr): RuntimeValue {
        if (
            expr.typeOf.value === ValueType.ANY ||
            expr.typeOf.value === ValueType.VOID ||
            expr.typeOf.value === ValueType.NULL
        ) {
            throw new InterpreterError(`Invalid variable type: ${expr.typeOf.value}`, expr);
        }
        const value = expr.value ? this.evaluateExpr(expr.value) : new NullValue();
        const type = expr.typeOf.value;

        if (value.type !== ValueType.OBJECT && value.type !== expr.typeOf.value)
            throw new InterpreterError(`Invalid variable type: ${value.type} expected ${expr.typeOf.value}`, expr);
        if (value.type === ValueType.OBJECT && !this.environment.isDefinedType(type))
            throw new InterpreterError(`Type ${type} is not defined!`, expr);
        if (value.type === ValueType.OBJECT) this.verifyObject(value as ObjectValue, type);
        if (value.type === ValueType.OBJECT) (value as ObjectValue).typeOf = type;

        this.environment.defineVariable(expr.name.value, value, expr.isConst);
        return value;
    }
    private evaluateContinueStmt(_stmt: Expr): RuntimeValue {
        throw new ContinueStatement();
    }
    private evaluateBreakStmt(_stmt: Expr): RuntimeValue {
        throw new BreakStatement();
    }
    private evaluateReturnStmt(stmt: ReturnStmt): RuntimeValue {
        const value = this.evaluateExpr(stmt.value);
        throw new ReturnStatement(value);
    }
    private evaluateIfStmt(stmt: IfStmt): RuntimeValue {
        const condition = this.evaluateExpr(stmt.condition) as BooleanValue;
        if (condition.type !== ValueType.BOOL) {
            throw new InterpreterError(`Invalid if condition type: ${condition.type}`, stmt);
        }
        if (condition.value) {
            return this.evaluateBlockStmt(stmt.thenBranch);
        } else if (stmt.elseBranch) {
            if (stmt.elseBranch.type === ExprType.IF_STMT) {
                return this.evaluateIfStmt(stmt.elseBranch as IfStmt);
            } else if (stmt.elseBranch.type === ExprType.BLOCK_STMT) {
                return this.evaluateBlockStmt(stmt.elseBranch as BlockStmt);
            }
        }
        return new VoidValue();
    }
    private evaluateBlockStmt(stmt: BlockStmt): RuntimeValue {
        const interpreter = new Interpreter(new Environment(this.environment));
        for (const expr of stmt.statements) {
            interpreter.evaluateExpr(expr);
        }
        return new VoidValue();
    }
    private evaluateBinaryNumberExpr(
        expr: BinaryExpr,
        left: NumberValue,
        right: NumberValue,
    ): NumberValue | BooleanValue {
        switch (expr.operator.type) {
            case TokenType.PLUS_TOKEN:
                return new NumberValue(left.value + right.value);
            case TokenType.MINUS_TOKEN:
                return new NumberValue(left.value - right.value);
            case TokenType.STAR_TOKEN:
                return new NumberValue(left.value * right.value);
            case TokenType.SLASH_TOKEN:
                if (right.value === 0) throw new InterpreterError(`Division by zero`, null);
                return new NumberValue(left.value / right.value);
            case TokenType.MODULO_TOKEN:
                if (right.value === 0) throw new InterpreterError(`Modulo by zero`, null);
                return new NumberValue(left.value % right.value);
            case TokenType.EXPONENT_TOKEN:
                return new NumberValue(left.value ** right.value);
            case TokenType.EQUAL_TOKEN:
                return new BooleanValue(left.value === right.value);
            case TokenType.NOT_EQUAL_TOKEN:
                return new BooleanValue(left.value !== right.value);
            case TokenType.GREATER_THEN_TOKEN:
                return new BooleanValue(left.value > right.value);
            case TokenType.GREATER_OR_EQUAL_TOKEN:
                return new BooleanValue(left.value >= right.value);
            case TokenType.LESS_THEN_TOKEN:
                return new BooleanValue(left.value < right.value);
            case TokenType.LESS_OR_EQUAL_TOKEN:
                return new BooleanValue(left.value <= right.value);
            default:
                throw new InterpreterError(`Invalid binary number expression: ${expr.operator.type}`, expr);
        }
    }
    private evaluateBinaryStringExpr(
        operator: Token,
        left: StringValue,
        right: StringValue,
    ): StringValue | BooleanValue {
        switch (operator.type) {
            case TokenType.PLUS_TOKEN:
                return new StringValue(left.value + right.value);
            case TokenType.EQUAL_TOKEN:
                return new BooleanValue(left.value === right.value);
            // case TokenType.BANG_EQUAL_TOKEN:
            //   return new BooleanValue(left.value !== right.value);
            case TokenType.GREATER_THEN_TOKEN:
                return new BooleanValue(left.value > right.value);
            case TokenType.GREATER_OR_EQUAL_TOKEN:
                return new BooleanValue(left.value >= right.value);
            case TokenType.LESS_THEN_TOKEN:
                return new BooleanValue(left.value < right.value);
            case TokenType.LESS_OR_EQUAL_TOKEN:
                return new BooleanValue(left.value <= right.value);
            default:
                throw new InterpreterError(`Invalid binary string expression: ${operator.type}`, null);
        }
    }
    private evaluateBinaryBooleanExpr(operator: Token, left: BooleanValue, right: BooleanValue): BooleanValue {
        switch (operator.type) {
            case TokenType.EQUAL_TOKEN:
                return new BooleanValue(left.value === right.value);
            // case TokenType.BANG_EQUAL_TOKEN:
            //   return new BooleanValue(left.value !== right.value);
            case TokenType.AND_TOKEN:
                return new BooleanValue(left.value && right.value);
            case TokenType.OR_TOKEN:
                return new BooleanValue(left.value || right.value);
            default:
                throw new InterpreterError(`Invalid binary boolean expression: ${operator.type}`, null);
        }
    }
    private evaluateBinaryExpr(expr: BinaryExpr): RuntimeValue {
        const left = this.evaluateExpr(expr.left);
        const right = this.evaluateExpr(expr.right);

        if (left.type === ValueType.NUMBER && right.type === ValueType.NUMBER) {
            return this.evaluateBinaryNumberExpr(expr, left as NumberValue, right as NumberValue);
        } else if (left.type === ValueType.STRING && right.type === ValueType.STRING) {
            return this.evaluateBinaryStringExpr(expr.operator, left as StringValue, right as StringValue);
        } else if (left.type === ValueType.BOOL && right.type === ValueType.BOOL) {
            return this.evaluateBinaryBooleanExpr(expr.operator, left as BooleanValue, right as BooleanValue);
        }

        throw new InterpreterError(
            `Invalid binary expression between: ${left.type} ${expr.operator.value} ${right.type}`,
            expr,
        );
    }
    private evaluateNullLiteral(_expr: NullLiteralExpr): RuntimeValue {
        return new NullValue();
    }
    private evaluateBooleanLiteral(expr: BooleanLiteralExpr): RuntimeValue {
        return new BooleanValue(expr.value);
    }
    private evaluateStringLiteral(expr: StringLiteralExpr): StringValue {
        return new StringValue(expr.value);
    }
    private evaluateNumberLiteral(expr: NumberLiteralExpr): NumberValue {
        if (expr.value.toString().includes('.')) {
            return new NumberValue(parseFloat(expr.value.toString()));
        }
        return new NumberValue(parseInt(expr.value.toString()));
    }

    private verifyObject(object: ObjectValue, type: string): void {
        const typeValue = this.environment.getType(type);
        const typeDefinition = typeValue.valueDefinition;
        const objectDefinition = object.value;
        const objectKeys = Array.from(objectDefinition.keys());
        const typeKeys = Object.keys(typeDefinition);
        const missingKeys = typeKeys.filter((key) => !objectKeys.includes(key));
        const extraKeys = objectKeys.filter((key) => !typeKeys.includes(key));
        if (missingKeys.length > 0) {
            throw new InterpreterError(`Object is missing keys: ${missingKeys.join(', ')} from type ${type}`, null);
        }
        if (extraKeys.length > 0) {
            throw new InterpreterError(`Object has extra keys: ${extraKeys.join(', ')} from type ${type}`, null);
        }
        objectDefinition.forEach((value, key) => {
            const type = typeDefinition[key];
            if (
                (value.type !== ValueType.OBJECT && value.type !== type) ||
                (value.type === ValueType.OBJECT && (value as ObjectValue).typeOf !== type)
            ) {
                throw new InterpreterError(
                    `Invalid object property '${key}' type: ${value.type} expected ${type}`,
                    null,
                );
            }
            if (value.type === ValueType.OBJECT) {
                this.verifyObject(value as ObjectValue, type);
            }
        });

        if (object.typeOf !== type) object.typeOf = type;
    }
}

export default Interpreter;
