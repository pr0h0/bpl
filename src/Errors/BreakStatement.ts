class BreakStatement extends Error {
    constructor(message?: string) {
        super(message || 'Invalid break statement');
    }
}

export default BreakStatement;
