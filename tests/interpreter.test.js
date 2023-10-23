const Interpreter = require('../dist/Interpreter/Interpreter').default;
const Environment = require('../dist/Environment/Environment').default;
const Values = require('../dist/Interpreter/Values');
const ValueType = require('../dist/Interpreter/ValueType').default;
const Expr = require('../dist/Expr/index');

describe('Interpreter', () => {
    let interpreter;
    let env;

    beforeEach(() => {
        env = new Environment();
        interpreter = new Interpreter(env);
    });

    test('should evaluate a number literal expression', () => {
        const expr = new Expr.NumberLiteralExpr(42);
        const result = interpreter.evaluateExpr(expr);
        expect(result).toEqual(new Values.NumberValue(42));
    });

    test('should evaluate a string literal expression', () => {
        const expr = new Expr.StringLiteralExpr('hello');
        const result = interpreter.evaluateExpr(expr);
        expect(result).toEqual(new Values.StringValue('hello'));
    });

    test('should evaluate a boolean literal expression', () => {
        const expr = new Expr.BooleanLiteralExpr(true);
        const result = interpreter.evaluateExpr(expr);
        expect(result).toEqual(new Values.BooleanValue(true));
    });

    test('should evaluate a null literal expression', () => {
        const expr = new Expr.NullLiteralExpr();
        const result = interpreter.evaluateExpr(expr);
        expect(result).toEqual(new Values.NullValue());
    });

    test('should evaluate an object literal expression', () => {
        const expr = new Expr.ObjectLiteralExpr([
            [new Expr.StringLiteralExpr('name'), new Expr.StringLiteralExpr('John')],
            [new Expr.StringLiteralExpr('age'), new Expr.NumberLiteralExpr(42)],
        ]);
        const result = interpreter.evaluateExpr(expr);
        const expected = new Values.ObjectValue(
            new Map([
                ['name', new Values.StringValue('John')],
                ['age', new Values.NumberValue(42)],
            ]),
            ValueType.OBJECT,
        );
        expect(result).toEqual(expected);
    });

    test('should evaluate an empty expression', () => {
        const expr = new Expr.EmptyExpr();
        const result = interpreter.evaluateExpr(expr);
        expect(result).toEqual(new Values.VoidValue());
    });

    // Add more tests for the remaining expression types
});
