import Token from "../Lexer/Token";
import { BlockStmt } from "../Parser/Expr";
import ValueType from "./ValueType";

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
    this.value = this.value?.toString().replace(/\\n/g, "\n");
    this.value = this.value.replace(/\\t/g, "\t");
    this.value = this.value.replace(/\\r/g, "\r");
    this.value = this.value.replace(/\\'/g, "'");
    this.value = this.value.replace(/\\"/g, '"');
    this.value = this.value.replace(/\\\\/g, "\\");
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
    public isNative: boolean = false
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
    public isNative: boolean = true
  ) {
    super(ValueType.NATIVE_FUNCTION);
  }
}

// TODO: Add support for array values
export class ArrayValue extends RuntimeValue {
  constructor(public value: RuntimeValue[], public typeOf: string) {
    super(ValueType.ARRAY);
  }
}

// TODO: Add support for object values
export class ObjectValue extends RuntimeValue {
  constructor(public value: Map<string, RuntimeValue>, public typeOf: string) {
    super(ValueType.OBJECT);
  }
}

export class CustomValue extends RuntimeValue {
  constructor(public value: RuntimeValue, public typeOf: string) {
    super(ValueType.CUSTOM);
  }
}

export class TypeValue extends RuntimeValue {
  constructor(public value: ValueType, public valueDefinition: any) {
    super(ValueType.TYPE);
  }
}
