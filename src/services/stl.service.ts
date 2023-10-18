import Environment from '../Environment/Environment';
import InterpreterError from '../Errors/InterpreterError';
import {
    BooleanValue,
    NativeFunctionValue,
    NullValue,
    NumberValue,
    RuntimeValue,
    StringValue,
    VoidValue,
} from '../Interpreter/Values';
import ValueType from '../Interpreter/ValueType';
import Token from '../Lexer/Token';
import TokenType from '../Lexer/TokenType';
import InputService from './input.service';

class STLService {
    public static populateWithSTLFunctions(environment: Environment): void {
        environment.defineNativeFunction(
            'print',
            new NativeFunctionValue(
                new Token(TokenType.IDENTIFIER_TOKEN, 'print', 0),
                [[new Token(TokenType.IDENTIFIER_TOKEN, 'value', 0), ValueType.ANY]],
                (args: RuntimeValue[]) => {
                    console.log((args[0] as StringValue).value);
                    return new VoidValue();
                },
                ValueType.VOID,
                true,
            ),
        );

        environment.defineNativeFunction(
            'input',
            new NativeFunctionValue(
                new Token(TokenType.IDENTIFIER_TOKEN, 'input', 0),
                [[new Token(TokenType.IDENTIFIER_TOKEN, 'prompt', 0), ValueType.ANY]],
                (args: RuntimeValue[] = []) => {
                    const userInput = InputService.getUserInputSync((args[0] as StringValue)?.value?.toString()) || '';
                    return new StringValue(userInput);
                },
                ValueType.STRING,
                true,
            ),
        );

        environment.defineNativeFunction(
            'time',
            new NativeFunctionValue(
                new Token(TokenType.IDENTIFIER_TOKEN, 'time', 0),
                [],
                () => new NumberValue(Date.now()),
                ValueType.NUMBER,
                true,
            ),
        );

        environment.defineNativeFunction(
            'evalJS',
            new NativeFunctionValue(
                new Token(TokenType.IDENTIFIER_TOKEN, 'evalJS'),
                [[new Token(TokenType.IDENTIFIER_TOKEN, 'code', 0), ValueType.STRING]],
                (args: RuntimeValue[]) => {
                    const code = (args[0] as StringValue).value;
                    return new StringValue(eval(code));
                },
                ValueType.ANY,
                true,
            ),
        );

        environment.defineNativeFunction(
            'convert',
            new NativeFunctionValue(
                new Token(TokenType.IDENTIFIER_TOKEN, 'convert', 0),
                [
                    [new Token(TokenType.IDENTIFIER_TOKEN, 'value', 0), ValueType.ANY],
                    [new Token(TokenType.IDENTIFIER_TOKEN, 'type', 0), ValueType.ANY],
                ],
                (args: RuntimeValue[]) => {
                    const value = args[0] as StringValue;
                    const fromType = value.type;
                    const toType = (args[1] as StringValue).value;

                    if (fromType === toType) return value;
                    if (fromType === ValueType.NULL || toType === ValueType.NULL) return new NullValue();

                    // string to
                    if (
                        [ValueType.ANY, ValueType.STRING].includes(fromType as ValueType) &&
                        toType === ValueType.NUMBER
                    ) {
                        const newValue = Number(value.value);
                        if (isNaN(newValue))
                            throw new InterpreterError(`Cannot convert ${value.value} to number`, null);
                        return new NumberValue(Number(value.value));
                    }
                    if (
                        [ValueType.ANY, ValueType.STRING].includes(fromType as ValueType) &&
                        toType === ValueType.BOOL
                    ) {
                        return new BooleanValue(Boolean(value.value));
                    }

                    // number to
                    if (
                        [ValueType.ANY, ValueType.NUMBER].includes(fromType as ValueType) &&
                        toType === ValueType.STRING
                    ) {
                        return new StringValue(String(value.value));
                    }
                    if (
                        [ValueType.ANY, ValueType.NUMBER].includes(fromType as ValueType) &&
                        toType === ValueType.BOOL
                    ) {
                        return new BooleanValue(Boolean(value.value));
                    }

                    // bool to
                    if (
                        [ValueType.ANY, ValueType.BOOL].includes(fromType as ValueType) &&
                        toType === ValueType.STRING
                    ) {
                        return new StringValue(value.value ? 'true' : 'false');
                    }
                    if (
                        [ValueType.ANY, ValueType.BOOL].includes(fromType as ValueType) &&
                        toType === ValueType.NUMBER
                    ) {
                        return new NumberValue(Number(value.value));
                    }

                    throw new InterpreterError(`Cannot convert ${fromType} to ${toType}`, null);
                },
                ValueType.ANY,
            ),
        );

        environment.defineNativeFunction(
            'typeof',
            new NativeFunctionValue(
                new Token(TokenType.IDENTIFIER_TOKEN, 'typeof'),
                [[new Token(TokenType.IDENTIFIER_TOKEN, 'value', 0), ValueType.ANY]],
                (args: RuntimeValue[]) => new StringValue(args[0].type),
                ValueType.STRING,
            ),
        );
    }

    public static populateWithSTLTypes(environment: Environment): void {
        environment.defineType('STRING', ValueType.STRING);
        environment.defineType('NUMBER', ValueType.NUMBER);
        environment.defineType('BOOL', ValueType.BOOL);
        environment.defineType('NULL', ValueType.NULL);
        environment.defineType('VOID', ValueType.VOID);
        environment.defineType('ANY', ValueType.ANY);
    }

    public static populateWithSTLVariables(environment: Environment): void {
        environment.defineVariable('PI', new NumberValue(Math.PI), true);
        environment.defineVariable('version', new StringValue('0.0.1'), true);
    }
}

export default STLService;
