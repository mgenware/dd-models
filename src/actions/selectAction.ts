import { throwIfFalsy } from 'throw-if-arg-empty';
import toTypeString from 'to-type-string';
import { ActionType } from './tableActions';
import { Column, Table } from '../core/core';
import { SQL, SQLVariable } from '../core/sql';
import { CoreSelectAction } from './coreSelectAction';
import { RawColumn } from './rawColumn';
import SQLConvertible from '../core/sqlConvertible';
import { sql } from '../core/sqlHelper';

export type SelectedColumn = Column | RawColumn;
export type SelectedColumnAndName = SelectedColumn | string;

export interface UnionTuple {
  action: SelectAction;
  unionAll: boolean;
}

export class OrderByColumn {
  constructor(public readonly column: SelectedColumnAndName, public readonly desc = false) {
    throwIfFalsy(column, 'column');
  }
}

export class OrderByColumnInput {
  constructor(public readonly columns: ReadonlyArray<SelectedColumnAndName>) {
    throwIfFalsy(columns, 'columns');
  }
}

export type OrderByColumnType = OrderByColumn | OrderByColumnInput;

export enum SelectActionMode {
  row,
  field,
  rowList,
  fieldList,
  page,
  exists,
}

/**
 * UNION
 *
 * `a.union(b)` returns a new action(mode=union, unionMembers=[a, b]).
 * This way a and b are untouched, and the union itself can also have
 * properties set such as ORDER BY and LIMIT OFFSET.
 *
 * Nesting:
 * `a.union(b).union(c)` returns:
 * action(mode=union, unionMembers=[
 *   action(mode=union, unionMembers=[a, b]),
 *   c,
 * ])
 *
 * In practice, union members are flattened, we will simply ignore intermediate
 * union member and use the outermost one.
 */
export class SelectAction extends CoreSelectAction {
  #havingSQLValue: SQL | null = null;
  get havingSQLValue(): SQL | null {
    return this.#havingSQLValue;
  }

  #havingValidator: ((value: SQL) => void) | null = null;
  get havingValidator(): ((value: SQL) => void) | null {
    return this.#havingValidator;
  }

  #orderByColumns: OrderByColumnType[] = [];
  get orderByColumns(): ReadonlyArray<OrderByColumnType> {
    return this.#orderByColumns;
  }

  #groupByColumns: string[] = [];
  get groupByColumns(): ReadonlyArray<string> {
    return this.#groupByColumns;
  }

  #limitValue: SQLVariable | number | undefined;
  get limitValue(): SQLVariable | number | undefined {
    return this.#limitValue;
  }

  #offsetValue: SQLVariable | number | undefined;
  get offsetValue(): SQLVariable | number | undefined {
    return this.#offsetValue;
  }

  #pagination = false;
  get pagination(): boolean {
    return this.#pagination;
  }

  #distinctFlag = false;
  get distinctFlag(): boolean {
    return this.#distinctFlag;
  }

  // Set by `union` or `unionAll`.
  #unionAllFlag = false;
  get unionAllFlag(): boolean {
    return this.#unionAllFlag;
  }

  #unionMembers: [SelectAction, SelectAction] | null = null;
  get unionMembers(): ReadonlyArray<SelectAction> | null {
    return this.#unionMembers;
  }

  #noOrderByFlag = false;
  get noOrderBy(): this {
    this.#noOrderByFlag = true;
    return this;
  }

  constructor(public readonly columns: SelectedColumn[], public readonly mode: SelectActionMode) {
    super(ActionType.select);

    // Validate individual columns.
    columns.forEach((col, idx) => {
      if (!col) {
        throw new Error(`The column at index ${idx} is null, action name "${this.__name}"`);
      }
      if (col instanceof Column === false && col instanceof RawColumn === false) {
        throw new Error(
          `The column at index ${idx} is not a valid column, got a "${toTypeString(
            col,
          )}", action name "${this.__name}"`,
        );
      }
    });
  }

  orderByAsc(column: SelectedColumnAndName): this {
    throwIfFalsy(column, 'column');
    this.#orderByColumns.push(new OrderByColumn(column, false));
    return this;
  }

  orderByDesc(column: SelectedColumnAndName): this {
    throwIfFalsy(column, 'column');
    this.#orderByColumns.push(new OrderByColumn(column, true));
    return this;
  }

  orderByInput(...columns: SelectedColumnAndName[]): this {
    this.#orderByColumns.push(new OrderByColumnInput(columns));
    return this;
  }

  groupBy(...columns: SelectedColumnAndName[]): this {
    throwIfFalsy(columns, 'columns');
    for (const column of columns) {
      let name: string;
      if (column instanceof Column) {
        name = column.getDBName();
      } else if (column instanceof RawColumn) {
        if (!column.selectedName) {
          throw new Error(`Unexpected empty selected name in ${column.toString()}`);
        }
        name = column.selectedName;
      } else {
        name = column;
      }
      this.#groupByColumns.push(name);
    }
    return this;
  }

  paginate(): this {
    if (this.mode !== SelectActionMode.rowList) {
      throw new Error(`Unsupported mode for \`paginate\`: ${this.mode}`);
    }
    this.#pagination = true;
    return this;
  }

  limit(limit: SQLVariable | number): this {
    this.setLimitValue(limit);
    return this;
  }

  offset(offset: SQLVariable | number): this {
    this.setOffsetValue(offset);
    return this;
  }

  havingSQL(value: SQL): this {
    throwIfFalsy(value, 'value');
    if (!this.groupByColumns) {
      throw new Error('You have to call `having` after `groupBy`');
    }
    if (this.havingValidator) {
      this.havingValidator(value);
    }

    if (this.havingSQLValue) {
      throw new Error('`having` is called twice');
    }
    this.#havingSQLValue = value;
    return this;
  }

  having(literals: TemplateStringsArray, ...params: SQLConvertible[]): this {
    this.havingSQL(sql(literals, ...params));
    return this;
  }

  distinct(): this {
    this.#distinctFlag = true;
    return this;
  }

  validate(groupTable: Table) {
    super.validate(groupTable);

    const { mode } = this;
    const selectCollection = mode === SelectActionMode.rowList || mode === SelectActionMode.page;
    if (selectCollection && !this.orderByColumns.length && !this.#noOrderByFlag) {
      throw new Error('An ORDER BY clause is required when selecting multiple rows');
    }
  }

  union(next: SelectAction, pageMode?: boolean): SelectAction {
    return this.unionCore(next, false, pageMode ?? false);
  }

  unionAll(next: SelectAction, pageMode?: boolean): SelectAction {
    return this.unionCore(next, true, pageMode ?? false);
  }

  private unionCore(action: SelectAction, unionAll: boolean, pageMode: boolean): SelectAction {
    throwIfFalsy(action, 'action');
    const newAction = new SelectAction(
      [],
      pageMode ? SelectActionMode.page : SelectActionMode.rowList,
    );
    if (this.__sqlTable) {
      newAction.from(this.__sqlTable);
    }
    newAction.#unionAllFlag = unionAll;
    newAction.#unionMembers = [this, action];
    return newAction;
  }

  private setLimitValue(limit: SQLVariable | number) {
    if (this.limitValue !== undefined) {
      throw new Error(`LIMIT has been set to ${this.limitValue}`);
    }
    this.#limitValue = limit;
  }

  private setOffsetValue(offset: SQLVariable | number) {
    if (this.limitValue === undefined) {
      throw new Error('OFFSET cannot be set before LIMIT');
    }
    if (this.offsetValue !== undefined) {
      throw new Error(`OFFSET has been set to ${this.offsetValue}`);
    }
    this.#offsetValue = offset;
  }
}
