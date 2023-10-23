import ExprType from '../Parser/ExprType';
import { Expr } from './Expr';

export class GroupingExpr extends Expr {
    constructor(public expression: Expr) {
        super(ExprType.GROUPING_EXPR);
    }
}
