import { RuntimeValue } from '../Interpreter/Values';

class ReturnStatement extends Error {
    constructor(public value: RuntimeValue, message?: string) {
        super(message || 'Invalid return statement');
    }
}

export default ReturnStatement;
