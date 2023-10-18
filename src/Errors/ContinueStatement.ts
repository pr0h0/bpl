class ContinueStatement extends Error {
    constructor(message?: string) {
        super(message || 'Invalid continue statement');
    }
}

export default ContinueStatement;
