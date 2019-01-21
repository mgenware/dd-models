import { throwIfFalsy } from 'throw-if-arg-empty';
import { Column, sql } from './core';
import dt from './dt';
import * as call from './sqlCall';
import toTypeString from 'to-type-string';

export function fk(column: Column): Column {
  throwIfFalsy(column, 'column');
  if (!Object.isFrozen(column)) {
    throw new Error(
      `The column "${toTypeString(
        column,
      )}" doesn't seem to be a valid column because it is frozen`,
    );
  }
  return Column.spawnForeignColumn(column, null);
}

export function varChar(length: number, defaultValue?: string): Column {
  const col = Column.fromTypes(dt.varChar);
  col.props.length = length;
  col.props.default = defaultValue;
  return col;
}

export function char(length: number, defaultValue?: string): Column {
  const col = Column.fromTypes(dt.char);
  col.props.length = length;
  col.props.default = defaultValue;
  return col;
}

function _int(type: string, unsigned: boolean, def?: number): Column {
  const col = Column.fromTypes(type);
  col.props.unsigned = unsigned;
  col.props.default = def;
  return col;
}

export function int(defaultValue?: number): Column {
  return _int(dt.int, false, defaultValue);
}

export function unsignedInt(defaultValue?: number): Column {
  return _int(dt.int, true, defaultValue);
}

export function bigInt(defaultValue?: number): Column {
  return _int(dt.bigInt, false, defaultValue);
}

export function unsignedBigInt(defaultValue?: number): Column {
  return _int(dt.bigInt, true, defaultValue);
}

export function smallInt(defaultValue?: number): Column {
  return _int(dt.smallInt, false, defaultValue);
}

export function unsignedSmallInt(defaultValue?: number): Column {
  return _int(dt.smallInt, true, defaultValue);
}

export function tinyInt(defaultValue?: number): Column {
  return _int(dt.tinyInt, false, defaultValue);
}

export function unsignedTinyInt(defaultValue?: number): Column {
  return _int(dt.tinyInt, true, defaultValue);
}

export function float(defaultValue?: number): Column {
  return _int(dt.float, true, defaultValue);
}

export function double(defaultValue?: number): Column {
  return _int(dt.double, true, defaultValue);
}

export function unique(col: Column): Column {
  throwIfFalsy(col, 'col');
  col.props.unique = true;
  return col;
}

export function pk(column?: Column): Column {
  const col = column ? column : unsignedBigInt();
  col.props.pk = true;
  return col;
}

export function text(defaultValue?: string): Column {
  const col = Column.fromTypes(dt.text);
  col.props.default = defaultValue;
  return col;
}

export function bool(defaultValue?: boolean): Column {
  const col = Column.fromTypes(dt.bool);
  col.props.default = defaultValue;
  return col;
}

export function datetime(defaultsToNow = false): Column {
  const col = Column.fromTypes(dt.datetime);
  if (defaultsToNow) {
    col.props.default = sql`${call.datetimeNow()}`;
  }
  return col;
}

export function date(defaultsToNow = false): Column {
  const col = Column.fromTypes(dt.date);
  if (defaultsToNow) {
    col.props.default = sql`${call.dateNow()}`;
  }
  return col;
}

export function time(defaultsToNow = false): Column {
  const col = Column.fromTypes(dt.time);
  if (defaultsToNow) {
    col.props.default = sql`${call.timeNow()}`;
  }
  return col;
}
