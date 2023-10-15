import { RuntimeValue } from "../Interpreter/Values";

class ReturnStatement extends Error {
  constructor(public value: RuntimeValue) {
    super("Invalid return statement");
  }
}

export default ReturnStatement;
