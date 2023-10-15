class EnvironmentError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "EnvironmentError";
  }

  public override toString() {
    return `EnvironmentError::${this.message}`;
  }
}

export default EnvironmentError;