import Environment from '../Environment/Environment';
import InterpreterError from '../Errors/InterpreterError';
import { Expr } from '../Expr/Expr';
import { ObjectValue, RuntimeValue } from './Values';
import ValueType from './ValueType';

class Interpreter {
    public environment: Environment;

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

    public evaluateExpr(expr: Expr): RuntimeValue {
        if (expr.isEvaluateImplemented) return expr.evaluate(this);

        throw new InterpreterError(`Invalid expression: ${expr.constructor.name}`, expr);
    }

    public verifyObject(object: ObjectValue, type: string): void {
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
