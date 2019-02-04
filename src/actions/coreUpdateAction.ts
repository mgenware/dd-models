import { Action } from './action';
import { Column } from '../core/core';
import { SQL, SQLConvertible, toSQL } from '../core/sql';
import { throwIfFalsy } from 'throw-if-arg-empty';

export default class CoreUpdateAction extends Action {
  setters = new Map<Column, SQL>();

  set(column: Column, value: SQLConvertible): this {
    throwIfFalsy(column, 'column');
    throwIfFalsy(value, 'value');
    this.setters.set(column, toSQL(value));
    return this;
  }

  setInputs(...columns: Column[]): this {
    throwIfFalsy(columns, 'columns');
    for (const col of columns) {
      this.setters.set(col, col.toInputSQL());
    }
    return this;
  }
}
