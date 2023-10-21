class EnvironmentError extends Error {
    constructor(message: string) {
        super(message);
        this.name = 'EnvironmentError';
    }

    public override toString() {
        return `EnvironmentError::${this.message}\n\n${this.stack}`;
    }
}

export default EnvironmentError;
