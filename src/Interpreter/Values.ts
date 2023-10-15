import Token from "../Lexer/Token";
import { BlockStmt } from "../Parser/Expr";
import ValueType from "./ValueType";

export class RuntimeValue {
  constructor(public type: string) {}
}

export class StringValue extends RuntimeValue {
  constructor(public value: string) {
    super(ValueType.STRING);
  }
}

export class NumberValue extends RuntimeValue {
  constructor(public value: number, public typeOf: string) {
    super(ValueType.NUMBER);
  }
}

export class BooleanValue extends RuntimeValue {
  constructor(public value: boolean) {
    super(ValueType.BOOLEAN);
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
    public typeOf: string
  ) {
    super(ValueType.FUNCTION);
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
