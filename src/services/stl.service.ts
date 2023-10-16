import Environment from "../Environment/Environment";
import ValueType from "../Interpreter/ValueType";
import {
  NativeFunctionValue,
  NumberValue,
  RuntimeValue,
  StringValue,
  VoidValue,
} from "../Interpreter/Values";
import Token from "../Lexer/Token";
import TokenType from "../Lexer/TokenType";
import InputService from "./input.service";

class STLService {
  public static populateWithSTLFunctions(environment: Environment): void {
    environment.defineNativeFunction(
      "print",
      new NativeFunctionValue(
        new Token(TokenType.IDENTIFIER_TOKEN, "print", 0),
        [[new Token(TokenType.IDENTIFIER_TOKEN, "value", 0), ValueType.ANY]],
        (args: RuntimeValue[]) => {
          console.log((args[0] as StringValue).value);
          return new VoidValue();
        },
        ValueType.VOID,
        true
      )
    );

    environment.defineNativeFunction(
      "input",
      new NativeFunctionValue(
        new Token(TokenType.IDENTIFIER_TOKEN, "input", 0),
        [[new Token(TokenType.IDENTIFIER_TOKEN, "prompt", 0), ValueType.ANY]],
        (args: RuntimeValue[] = []) => {
          return new StringValue(
            InputService.getUserInputSync((args[0] as StringValue)?.value) || ""
          );
        },
        ValueType.STRING,
        true
      )
    );

    environment.defineNativeFunction(
      "time",
      new NativeFunctionValue(
        new Token(TokenType.IDENTIFIER_TOKEN, "time", 0),
        [],
        () => new NumberValue(Date.now()),
        ValueType.NUMBER,
        true
      )
    );
  }

  public static populateWithSTLTypes(environment: Environment): void {
    environment.defineType("STRING", ValueType.STRING);
    environment.defineType("NUMBER", ValueType.NUMBER);
    environment.defineType("BOOL", ValueType.BOOL);
    environment.defineType("NULL", ValueType.NULL);
    environment.defineType("VOID", ValueType.VOID);
    environment.defineType("ANY", ValueType.ANY);
  }

  public static populateWithSTLVariables(environment: Environment): void {
    environment.defineVariable("PI", new NumberValue(Math.PI), true);
    environment.defineVariable("version", new StringValue("0.0.1"), true);
  }
}

export default STLService;
