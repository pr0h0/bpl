import ValueType from '../Interpreter/ValueType';
import {
    AnyValue,
    ArrayValue,
    BooleanValue,
    FunctionValue,
    NativeFunctionValue,
    NullValue,
    NumberValue,
    ObjectValue,
    RuntimeValue,
    StringValue,
    TupleValue,
    TypeValue,
    VoidValue,
} from '../Interpreter/Values';

class PrintService {
    static print(value: RuntimeValue, indentation: number = 0): string {
        if (value instanceof FunctionValue || value instanceof NativeFunctionValue) {
            return PrintService.printFunction(value);
        } else if (value instanceof ObjectValue) {
            return PrintService.printObject(value, indentation);
        } else if (value instanceof ArrayValue) {
            return PrintService.printArray(value, indentation);
        } else if (value instanceof TupleValue) {
            return PrintService.printTuple(value, indentation);
        } else if (value instanceof TypeValue) {
            return PrintService.printType(value, indentation);
        } else {
            return PrintService.printPrimitiveValue(value, indentation);
        }
    }

    static getIndentation(level: number) {
        let output = '';
        for (let i = 0; i < level; i++) {
            output += '\t';
        }
        return output;
    }

    static printPrimitiveValue(value: RuntimeValue, indentation: number = 0): string {
        let output = '';
        if (value instanceof StringValue) {
            output = `"${value.value}"`;
        } else if (value instanceof NumberValue) {
            output = value.value.toString();
        } else if (value instanceof BooleanValue) {
            output = value.value.toString();
        } else if (value instanceof NullValue) {
            output = 'null';
        } else if (value instanceof VoidValue) {
            output = 'void';
        } else if (value instanceof AnyValue) {
            output = PrintService.print(value.value, indentation + 1);
        }
        return output;
    }

    static printFunction(value: FunctionValue | NativeFunctionValue): string {
        let output = '';
        output += value.type === 'func' ? 'func' : 'STL func';
        output += ` ${value.name.value}(`;
        output += value.params.map((param) => param[0].value).join(', ');
        output += '): ' + value.typeOf + '';
        output += ' { ... }';
        return output;
    }

    static printObject(value: ObjectValue, indentation: number = 0): string {
        const indent = PrintService.getIndentation(indentation + 1);

        let output = '';
        output += `${value.typeOf} {\n`;
        const ittr = value.value.entries();
        let entry: IteratorResult<[string, RuntimeValue]>;
        while ((entry = ittr.next())) {
            if (entry.done) break;
            output += `${indent}${PrintService.printPrimitiveValue(
                new StringValue(entry.value[0]),
                indentation + 1,
            )}: ${PrintService.print(entry.value[1], indentation + 1)}\n`;
        }
        output += PrintService.getIndentation(indentation) + '}';
        return output;
    }

    static printType(value: TypeValue, indentation: number = 0): string {
        const indent = PrintService.getIndentation(indentation);
        let output = '';
        output += indent;
        if (value.value === ValueType.ARRAY) {
            output += `type ${value.value} `;
            output += `of [${value.valueDefinition.$type}]`;
        } else if (value.value === ValueType.TUPLE) {
            output += `type ${value.value} `;
            output += `of (${Object.values(value.valueDefinition).join(', ')})`;
        } else {
            output += `type ${value.typeOf} {\n`;
            const entries = Object.entries(value.valueDefinition);
            while (entries.length > 0) {
                const [key, value] = entries.shift() as [string, string];
                output += `${indent}\t${PrintService.printPrimitiveValue(
                    new StringValue(key),
                    indentation + 1,
                )}: ${PrintService.print(new StringValue(value), indentation + 1)}\n`;
            }
            output += indent + '}';
        }

        return output;
    }

    static printArray(value: ArrayValue, indentation: number = 0): string {
        const join = value.value.length === 0 ? '' : ', ';
        let output = '';
        output += `${value.typeOf} [`;
        output += value.value.map((element) => PrintService.print(element, indentation + 1)).join(join);
        output += ']';
        return output;
    }

    static printTuple(value: TupleValue, indentation: number = 0): string {
        let output = '';
        output += `${value.typeOf} (`;
        output += value.value.map((element) => PrintService.print(element, indentation + 1)).join(', ');
        output += ')';
        return output;
    }
}

export default PrintService;
