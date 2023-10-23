import ExprType from '../Parser/ExprType';
import { Expr } from './Expr';

export class TypeLiteralExpr extends Expr {
    constructor(public value: string) {
        super(ExprType.TYPE_LITERAL_EXPR);
    }
}
