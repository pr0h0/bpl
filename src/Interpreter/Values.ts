import Environment from '../Environment/Environment';
import Token from '../Lexer/Token';
import { BlockStmt } from '../Expr/BlockStmt';
import ValueType from './ValueType';
import InterpreterError from '../Errors/InterpreterError';
import Interpreter from './Interpreter';

export class RuntimeValue {
    constructor(public type: string) {}
}

export class AnyValue extends RuntimeValue {
    constructor(public value: RuntimeValue) {
        super(ValueType.ANY);
    }
}

export class VoidValue extends RuntimeValue {
    constructor() {
        super(ValueType.VOID);
    }
}
export class StringValue extends RuntimeValue {
    constructor(public value: string) {
        super(ValueType.STRING);
        this.value = this.value?.toString().replace(/\\n/g, '\n');
        this.value = this.value.replace(/\\t/g, '\t');
        this.value = this.value.replace(/\\r/g, '\r');
        this.value = this.value.replace(/\\'/g, "'");
        this.value = this.value.replace(/\\"/g, '"');
        this.value = this.value.replace(/\\\\/g, '\\');
    }
}

export class NumberValue extends RuntimeValue {
    constructor(public value: number) {
        super(ValueType.NUMBER);
    }
}

export class BooleanValue extends RuntimeValue {
    constructor(public value: boolean) {
        super(ValueType.BOOL);
    }
}

export class NullValue extends RuntimeValue {
    constructor() {
        super(ValueType.NULL);
    }
}

export class FunctionValue extends RuntimeValue {
    constructor(
        public name: Token,
        public params: [Token, string][],
        public body: BlockStmt,
        public typeOf: string,
        public isNative: boolean = false,
        public closure: Environment | null = null,
    ) {
        super(ValueType.FUNC);
    }
}

export class NativeFunctionValue extends RuntimeValue {
    constructor(
        public name: Token,
        public params: [Token, string][],
        public body: (args: RuntimeValue[]) => RuntimeValue,
        public typeOf: string,
        public isNative: boolean = true,
        public closure: Environment | null = null,
    ) {
        super(ValueType.NATIVE_FUNCTION);
    }
}

export class ArrayValue extends RuntimeValue {
    constructor(public value: RuntimeValue[], public typeOf: string) {
        super(ValueType.ARRAY);
    }

    static verifyArray(interpreter: Interpreter, value: ArrayValue, type: string) {
        const typeValue = interpreter.environment.getType(type);
        if (value.value.length === 0) return;

        value.value.forEach((element) => {
            if (element instanceof ObjectValue) {
                ObjectValue.verifyObject(interpreter, element, typeValue.typeOf);
                return;
            }
            if (element instanceof ArrayValue) {
                ArrayValue.verifyArray(interpreter, element, typeValue.typeOf);
                return;
            }
            if (element instanceof TupleValue) {
                TupleValue.verifyTuple(interpreter, element, typeValue.typeOf);
                return;
            }

            if (element.type !== typeValue.valueDefinition.$type)
                throw new InterpreterError(`Invalid array element type: ${element.type} expected ${type}`, null);
        });
    }
}

export class TupleValue extends RuntimeValue {
    constructor(public value: RuntimeValue[], public typeOf: string | string[]) {
        super(ValueType.TUPLE);
    }
    static verifyTuple(interpreter: Interpreter, value: TupleValue, type: string) {
        const typeValue = interpreter.environment.getType(type);
        if (value.value.length !== Object.keys(typeValue.valueDefinition).length) {
            throw new InterpreterError(
                `Invalid tuple length: ${value.value.length} expected ${Object.keys(typeValue.valueDefinition).length}`,
                null,
            );
        }

        value.value.forEach((element, index) => {
            if (element instanceof ObjectValue) {
                ObjectValue.verifyObject(interpreter, element, typeValue.typeOf);
                return;
            }
            if (element instanceof ArrayValue) {
                ArrayValue.verifyArray(interpreter, element, typeValue.typeOf);
                return;
            }
            if (element instanceof TupleValue) {
                TupleValue.verifyTuple(interpreter, element, typeValue.typeOf);
                return;
            }

            if (element.type !== typeValue.valueDefinition[index])
                throw new InterpreterError(
                    `Invalid tuple element type: ${element.type} expected ${typeValue.valueDefinition[index]}`,
                    null,
                );
        });
    }
}

export class ObjectValue extends RuntimeValue {
    constructor(public value: Map<string, RuntimeValue>, public typeOf: string) {
        super(ValueType.OBJECT);
    }

    public static verifyObject(interpreter: Interpreter, object: ObjectValue, type: string): void {
        const typeValue = interpreter.environment.getType(type);
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
            if (value instanceof TupleValue) {
                TupleValue.verifyTuple(interpreter, value, type);
                return;
            }
            if (value instanceof ArrayValue) {
                ArrayValue.verifyArray(interpreter, value, type);
                return;
            }
            if (value instanceof ObjectValue) {
                ObjectValue.verifyObject(interpreter, value, type);
                return;
            }
            if (value.type !== type) {
                throw new InterpreterError(`Invalid object property type: ${value.type} expected ${type}`, null);
            }
        });

        if (object.typeOf !== type) object.typeOf = type;
    }
}

export class TypeValue extends RuntimeValue {
    constructor(public value: ValueType, public typeOf: string, public valueDefinition: Record<string, string>) {
        super(ValueType.TYPE);
    }
}
