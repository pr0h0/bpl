class ContinueStatement extends Error {
  constructor() {
    super("Invalid continue statement");
  }
}

export default ContinueStatement;
