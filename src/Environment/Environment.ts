import EnvironmentError from '../Errors/EnvironmentError';
import PrimitiveTypes from '../Interpreter/PrimitiveTypes';
import { FunctionValue, NativeFunctionValue, ObjectValue, RuntimeValue, TypeValue } from '../Interpreter/Values';
import ValueType from '../Interpreter/ValueType';
import STLService from '../services/stl.service';

class Environment {
    constructor(public parent?: Environment) {
        if (!parent) {
            STLService.populateWithSTLVariables(this);
            STLService.populateWithSTLTypes(this);
            STLService.populateWithSTLFunctions(this);
        }
    }

    private variables: Map<string, [RuntimeValue, string, boolean]> = new Map();
    private consts: Set<string> = new Set();
    private types: Map<string, TypeValue> = new Map();
    private functions: Map<string, any> = new Map();

    private allTogethers: Set<string> = new Set();

    public defineVariable(name: string, value: RuntimeValue, isConst: boolean = false): void {
        if (this.allTogethers.has(name) || this.isDefinedType(name))
            throw new EnvironmentError(`Name ${name} is already defined!`);
        if (Object.values(PrimitiveTypes).includes(name as PrimitiveTypes)) {
            throw new EnvironmentError(`Variable ${name} is already defined as a primitive type!`);
        }
        if (value.type === ValueType.OBJECT) {
            const type = (value as ObjectValue).typeOf;
            if (!this.isDefinedType(type)) throw new EnvironmentError(`Type ${type} is not defined!`);
        }

        let type = value.type;
        if (type === ValueType.OBJECT) {
            type = (value as ObjectValue).typeOf;
        }
        this.variables.set(name, [value, type, isConst]);
        if (isConst) this.consts.add(name);
        this.allTogethers.add(name);
    }

    public defineType(name: string, value: ValueType, extraProperties?: Record<string, ValueType>): void {
        if (this.isDefined(name)) throw new EnvironmentError(`Name ${name} is already taken!`);

        this.types.set(name, new TypeValue(value, extraProperties));
        this.allTogethers.add(name);
    }

    public defineNativeFunction(name: string, value: NativeFunctionValue): void {
        if (this.allTogethers.has(name)) throw new EnvironmentError(`Name ${name} is already defined!`);
        if (Object.values(PrimitiveTypes).includes(name as PrimitiveTypes))
            throw new EnvironmentError(`Function ${name} is already defined as a primitive type!`);

        this.functions.set(name, value);
        this.allTogethers.add(name);
    }

    public defineFunction(name: string, value: FunctionValue): void {
        if (this.allTogethers.has(name)) throw new EnvironmentError(`Name ${name} is already defined!`);
        if (Object.values(PrimitiveTypes).includes(name as PrimitiveTypes))
            throw new EnvironmentError(`Function ${name} is already defined as a primitive type!`);

        this.functions.set(name, value);
        this.allTogethers.add(name);
    }

    public isDefined(name: string): boolean {
        return this.allTogethers.has(name) || Boolean(this.parent?.isDefined(name));
    }

    public isDefinedVariable(name: string): boolean {
        return this.variables.has(name) || Boolean(this.parent?.isDefinedVariable(name));
    }

    public isDefinedType(name: string): boolean {
        return this.types.has(name) || Boolean(this.parent?.isDefinedType(name));
    }

    public isDefinedFunction(name: string): boolean {
        return this.functions.has(name) || Boolean(this.parent?.isDefinedFunction(name));
    }

    public getVariable(name: string): [RuntimeValue, string, boolean] {
        if (!this.isDefinedVariable(name)) throw new EnvironmentError(`Variable ${name} is not defined!`);
        return this.variables.get(name) || (this.parent?.getVariable(name) as [RuntimeValue, string, boolean]);
    }

    public getType(name: string): any {
        if (!this.isDefinedType(name)) throw new EnvironmentError(`Type ${name} is not defined!`);
        return this.types.get(name) || this.parent?.getType(name);
    }

    public getFunction(name: string): FunctionValue | NativeFunctionValue {
        const isDefinedAsFunction = this.isDefinedFunction(name);
        const isDefinedAsVariable = this.isDefinedVariable(name);
        if (!isDefinedAsFunction && !isDefinedAsVariable)
            throw new EnvironmentError(`Function ${name} is not defined!`);
        if (isDefinedAsFunction) return this.functions.get(name) || this.parent?.getFunction(name);
        const func = this.getVariable(name) || this.parent?.getVariable(name);
        if (func[1] !== ValueType.FUNC && func[1] !== ValueType.NATIVE_FUNCTION)
            throw new EnvironmentError(`Variable ${name} is not a function!`);
        return func[0] as FunctionValue | NativeFunctionValue;
    }

    public isConst(name: string): boolean {
        if (!this.isDefinedVariable(name)) throw new EnvironmentError(`Variable ${name} is not defined!`);
        return this.consts.has(name);
    }

    public setVariable(name: string, value: RuntimeValue): void {
        if (!this.isDefinedVariable(name)) throw new EnvironmentError(`Variable ${name} is not defined!`);
        if (this.isDefinedFunction(name)) throw new EnvironmentError(`Variable ${name} is a function!`);
        if (this.isDefinedType(name)) throw new EnvironmentError(`Variable ${name} is a type!`);
        if (this.isConst(name)) throw new EnvironmentError(`Variable ${name} is a const!`);

        if (Object.values(PrimitiveTypes).includes(name as PrimitiveTypes)) {
            throw new EnvironmentError(`Variable ${name} is already defined as a primitive type!`);
        }
        if (value.type === ValueType.OBJECT) {
            const type = (value as ObjectValue).typeOf;
            if (!this.isDefinedType(type)) throw new EnvironmentError(`Type ${type} is not defined!`);
        }

        let type = value.type;
        if (type === ValueType.OBJECT) {
            type = (value as ObjectValue).typeOf;
        }
        if (this.variables.get(name)) {
            this.variables.set(name, [value, type, this.isConst(name)]);
            return;
        }
        this.parent?.setVariable(name, value);
    }
}

export default Environment;
