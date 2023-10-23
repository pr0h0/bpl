import Environment from '../Environment/Environment';
import InterpreterError from '../Errors/InterpreterError';
import { Expr } from '../Expr/Expr';
import { RuntimeValue } from './Values';

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
}

export default Interpreter;
