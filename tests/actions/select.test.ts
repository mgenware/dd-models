/* eslint-disable @typescript-eslint/no-non-null-assertion */
import * as assert from 'assert';
import { itThrows } from 'it-throws';
import * as mm from '../..';
import user from '../models/user';
import post from '../models/post';
import { eq, deepEq, ok } from '../assert-aliases';

it('select', () => {
  class UserTA extends mm.TableActions {
    t = mm.selectRow(user.id, user.name).whereSQL(mm.sql`${user.id} = 1`);
  }
  const ta = mm.tableActions(user, UserTA);
  const v = ta.t;

  ok(v instanceof mm.SelectAction);
  ok(v instanceof mm.CoreSelectAction);
  ok(v instanceof mm.Action);
  eq(v.columns.length, 2);
  eq(v.columns[0], user.id);
  eq(v.columns[1], user.name);
  eq(v.whereSQLString, 'SQL(E(Column(id, Table(user)), type = 1), E( = 1, type = 0))');
  eq(v.mode, mm.SelectActionMode.row);
  eq(v.actionType, mm.ActionType.select);
});

it('where and whereSQL', () => {
  class UserTA extends mm.TableActions {
    t1 = mm.selectRow(user.id, user.name).whereSQL(mm.sql`${user.id} = 1`);
    t2 = mm.selectRow(user.id, user.name).where`${user.id} = 1`;
  }
  const ta = mm.tableActions(user, UserTA);
  eq(ta.t1.whereSQLString, 'SQL(E(Column(id, Table(user)), type = 1), E( = 1, type = 0))');
  eq(ta.t2.whereSQLString, 'SQL(E(Column(id, Table(user)), type = 1), E( = 1, type = 0))');
});

it('Select *', () => {
  class UserTA extends mm.TableActions {
    t = mm.selectRow();
  }
  assert.doesNotThrow(() => mm.tableActions(user, UserTA));
});

it('selectRows', () => {
  class UserTA extends mm.TableActions {
    t = mm
      .selectRows(user.id, user.name)
      .whereSQL(mm.sql`${user.id} = 1`)
      .orderByAsc(user.id);
  }
  const ta = mm.tableActions(user, UserTA);
  const v = ta.t;
  eq(v.mode, mm.SelectActionMode.list);
});

it('as', () => {
  const a = user.id.as('a');
  const b = user.name.as('b');
  const c = user.id.as('c');

  ok(a instanceof mm.RawColumn);
  eq(a.selectedName, 'a');
  eq(b.selectedName, 'b');
  eq(c.selectedName, 'c');
});

it('RawColumn', () => {
  // as
  let c = user.id.as('x');
  eq(c.selectedName, 'x');
  eq(c.core, user.id);

  // new RawColumn
  c = new mm.RawColumn(user.id, 'y');
  eq(c.selectedName, 'y');
  eq(c.core, user.id);

  // mm.sel
  c = mm.sel(user.id, 'x');
  eq(c.selectedName, 'x');
  eq(c.core, user.id);

  // new RawColumn
  c = new mm.RawColumn(user.id);
  eq(c.selectedName, null);
  eq(c.core, user.id);

  // mm.sel
  c = mm.sel(user.id, 'id');
  eq(c.selectedName, 'id');
  eq(c.core, user.id);
});

it('RawColumn (raw SQL)', () => {
  const a = new mm.RawColumn(mm.sql`123`, 'x');
  const b = new mm.RawColumn(mm.sql`COUNT(${user.name})`, 'y');
  eq(a.selectedName, 'x');
  eq(a.core.toString(), 'SQL(E(123, type = 0))');
  eq(b.selectedName, 'y');
  eq(
    b.core.toString(),
    'SQL(E(COUNT(, type = 0), E(Column(name, Table(user)), type = 1), E(), type = 0))',
  );
});

it('RawColumn (types)', () => {
  const a = new mm.RawColumn(mm.sql`123`, 'x', new mm.ColumnType(['t1', 't2']));
  eq(a.selectedName, 'x');
  eq(a.core.toString(), 'SQL(E(123, type = 0))');
  deepEq(a.type, new mm.ColumnType(['t1', 't2']));
});

it('RawColumn (count)', () => {
  class UserTA extends mm.TableActions {
    t = mm.selectRow(mm.sel(mm.sql`${mm.count(mm.sql`${post.user_id.join(user).name}`)}`, 'count'));
  }
  const ta = mm.tableActions(user, UserTA);
  const v = ta.t;

  const cc = v.columns[0] as mm.RawColumn;
  eq(cc.selectedName, 'count');
  eq(
    cc.core.toString(),
    'SQL(E(SQLCall(3, return = ColType(SQL.INT), params = SQL(E(Column(name, (J|0|post|user)[user_id|id]), type = 1))), type = 3))',
  );
});

it('RawColumn (SQLConvertible)', () => {
  let cc = new mm.RawColumn(post.user_id, 't');
  // Column should not be wrapped in SQL
  eq(cc.core, post.user_id);
  cc = new mm.RawColumn(mm.sql`str`, 't');
  eq(cc.core.toString(), 'SQL(E(str, type = 0))');
  cc = new mm.RawColumn(mm.sql`${mm.count(post.id)}`, 't');
  eq(
    cc.core.toString(),
    'SQL(E(SQLCall(3, return = ColType(SQL.INT), params = SQL(E(Column(id, Table(post)), type = 1))), type = 3))',
  );
});

it('mm.select (types)', () => {
  const a = mm.sel(mm.sql`123`, 'x', new mm.ColumnType(['t1', 't2']));
  eq(a.selectedName, 'x');
  eq(a.core.toString(), 'SQL(E(123, type = 0))');
  deepEq(a.type, new mm.ColumnType(['t1', 't2']));
});

it('byID', () => {
  class UserTA extends mm.TableActions {
    t = mm.selectRow(user.name).by(user.id);
  }
  const ta = mm.tableActions(user, UserTA);
  const v = ta.t;
  eq(
    v.whereSQLString,
    'SQL(E(Column(id, Table(user)), type = 1), E( = , type = 0), E(SQLVar(undefined, desc = Column(id, Table(user))), type = 2))',
  );
});

it('byID with inputName', () => {
  class UserTA extends mm.TableActions {
    t = mm.selectRow(user.name).by(user.id, 'haha');
  }
  const ta = mm.tableActions(user, UserTA);
  const v = ta.t;
  eq(
    v.whereSQLString,
    'SQL(E(Column(id, Table(user)), type = 1), E( = , type = 0), E(SQLVar(haha, desc = Column(id, Table(user))), type = 2))',
  );
});

it('by', () => {
  class UserTA extends mm.TableActions {
    t = mm.selectRow(user.name).by(user.snake_case_name);
  }
  const ta = mm.tableActions(user, UserTA);
  const v = ta.t;
  eq(
    v.whereSQLString,
    'SQL(E(Column(snake_case_name, Table(user)), type = 1), E( = , type = 0), E(SQLVar(undefined, desc = Column(snake_case_name, Table(user))), type = 2))',
  );
});

it('andBy', () => {
  class UserTA extends mm.TableActions {
    t1 = mm.selectRow(user.name).by(user.snake_case_name).andBy(user.follower_count);
    t2 = mm.selectRow(user.name).andBy(user.follower_count);
    t3 = mm.selectRow(user.name).by(user.id).andBy(user.follower_count);
  }
  const ta = mm.tableActions(user, UserTA);
  eq(
    ta.t1.whereSQLString,
    'SQL(E(Column(snake_case_name, Table(user)), type = 1), E( = , type = 0), E(SQLVar(undefined, desc = Column(snake_case_name, Table(user))), type = 2), E( AND , type = 0), E(SQLVar(undefined, desc = Column(follower_count, Table(user))), type = 2))',
  );
  eq(
    ta.t2.whereSQLString,
    'SQL(E(SQLVar(undefined, desc = Column(follower_count, Table(user))), type = 2))',
  );
  eq(
    ta.t3.whereSQLString,
    'SQL(E(Column(id, Table(user)), type = 1), E( = , type = 0), E(SQLVar(undefined, desc = Column(id, Table(user))), type = 2), E( AND , type = 0), E(SQLVar(undefined, desc = Column(follower_count, Table(user))), type = 2))',
  );
});

it('selectField', () => {
  const sc = mm.sel(mm.sql`mm.count('*')`, 'c');
  class UserTA extends mm.TableActions {
    t = mm.selectField(user.name).by(user.id);
    t2 = mm.selectField(sc);
  }
  const ta = mm.tableActions(user, UserTA);
  const v = ta.t;

  eq(v.mode, mm.SelectActionMode.field);
  eq(v.columns[0], user.name);

  const v2 = ta.t2;
  deepEq(v2.columns[0], sc);
});

it('selectExists', () => {
  class UserTA extends mm.TableActions {
    t = mm.selectExists().by(user.id);
  }
  const ta = mm.tableActions(user, UserTA);
  const v = ta.t;
  eq(v.mode, mm.SelectActionMode.exists);
});

it('Order by', () => {
  const cc = mm.sel(mm.sql`haha`, 'name', new mm.ColumnType('int'));
  class UserTA extends mm.TableActions {
    t = mm
      .selectRow(user.name, user.follower_count, cc)
      .by(user.id)
      .orderByAsc(user.name)
      .orderByAsc(cc)
      .orderByDesc(user.follower_count)
      .orderByInput(user.name, user.id);
  }
  const ta = mm.tableActions(user, UserTA);
  const v = ta.t;

  eq(v.orderByColumns.length, 4);

  const order0 = v.orderByColumns[0] as mm.OrderByColumn;
  eq(order0.column, user.name);
  eq(order0.desc, false);

  const order1 = v.orderByColumns[1] as mm.OrderByColumn;
  eq(order1.column, cc);
  eq(order1.desc, false);

  const order2 = v.orderByColumns[2] as mm.OrderByColumn;
  eq(order2.column, user.follower_count);
  eq(order2.desc, true);

  const order3 = v.orderByColumns[3] as mm.OrderByColumnInput;
  deepEq(order3.columns, [user.name, user.id]);
});

it('Validate columns', () => {
  const t = user;
  itThrows(() => {
    class UserTA extends mm.TableActions {
      t = mm.selectRows(t.name, (null as unknown) as mm.Column, t.follower_count);
    }
    mm.tableActions(user, UserTA);
  }, 'The column at index 1 is null, action name "null" [table "Table(user)"]');

  itThrows(() => {
    class UserTA extends mm.TableActions {
      t = mm.selectRows(t.name, (32 as unknown) as mm.Column, t.follower_count);
    }
    mm.tableActions(user, UserTA);
  }, 'The column at index 1 is not a valid column, got a "number", action name "null" [table "Table(user)"]');
});

it('GROUP BY names', () => {
  const col = mm.sel(user.id, 'raw');
  class UserTA extends mm.TableActions {
    t = mm
      .selectRows(user.id, col)
      .groupBy(user.name, col, 'haha')
      .havingSQL(mm.sql`${mm.count(user.name)} > 2`)
      .orderByAsc(user.id);
  }
  const ta = mm.tableActions(user, UserTA);
  const v = ta.t;
  eq(v.groupByColumns[0], user.name.getDBName());
  eq(
    v.havingSQLValue!.toString(),
    'SQL(E(SQLCall(3, return = ColType(SQL.INT), params = SQL(E(Column(name, Table(user)), type = 1))), type = 3), E( > 2, type = 0))',
  );
});

it('HAVING', () => {
  class UserTA extends mm.TableActions {
    t = mm.selectRows(user.id, user.name).groupBy(user.name).having`${mm.count(
      user.name,
    )} > 2`.orderByAsc(user.id);

    t2 = mm
      .selectRows(user.id, user.name)
      .groupBy(user.name)
      .havingSQL(mm.sql`${mm.count(user.name)} > 2`)
      .orderByAsc(user.id);
  }
  const ta = mm.tableActions(user, UserTA);
  const v = ta.t;
  eq(v.groupByColumns[0], user.name.getDBName());
  eq(
    v.havingSQLValue!.toString(),
    'SQL(E(SQLCall(3, return = ColType(SQL.INT), params = SQL(E(Column(name, Table(user)), type = 1))), type = 3), E( > 2, type = 0))',
  );
  eq(
    ta.t2.havingSQLValue!.toString(),
    'SQL(E(SQLCall(3, return = ColType(SQL.INT), params = SQL(E(Column(name, Table(user)), type = 1))), type = 3), E( > 2, type = 0))',
  );
});

it('Pagination', () => {
  class UserTA extends mm.TableActions {
    t = mm.selectRows(user.name).paginate().orderByAsc(user.name);
  }
  const ta = mm.tableActions(user, UserTA);
  eq(ta.t.pagination, true);
});

it('selectPage', () => {
  class UserTA extends mm.TableActions {
    t = mm.selectPage(user.name).orderByAsc(user.name);
  }
  const ta = mm.tableActions(user, UserTA);
  eq(ta.t.mode, mm.SelectActionMode.page);
  eq(ta.t.pagination, false);
});

it('LIMIT', () => {
  class UserTA extends mm.TableActions {
    t = mm.selectRows(user.name).orderByAsc(user.name).limit(20);
  }
  const ta = mm.tableActions(user, UserTA);
  eq(ta.t.limitValue, 20);
});

it('LIMIT and OFFSET', () => {
  class UserTA extends mm.TableActions {
    t = mm
      .selectRows(user.name)
      .orderByAsc(user.name)
      .limit(new mm.SQLVariable(mm.int(), 'limit'))
      .offset(12);
  }
  const ta = mm.tableActions(user, UserTA);
  eq(ta.t.limitValue?.toString(), 'SQLVar(limit, desc = Column(null|, <null>))');
  eq(ta.t.offsetValue, 12);
});

it('Throw when paginate is called on non-list mode', () => {
  const t = user;

  itThrows(() => {
    class UserTA extends mm.TableActions {
      t = mm.selectField(t.name).paginate();
    }
    mm.tableActions(user, UserTA);
  }, 'Unsupported mode for `paginate`: 1 [table "Table(user)"]');
});

it('Throw on selecting collection without ORDER BY', () => {
  const t = user;
  assert.doesNotThrow(() => {
    class UserTA extends mm.TableActions {
      t = mm.selectField(t.name);
    }
    mm.tableActions(user, UserTA);
  });
  assert.doesNotThrow(() => {
    class UserTA extends mm.TableActions {
      t = mm.selectRow(t.name);
    }
    mm.tableActions(user, UserTA);
  });
  assert.doesNotThrow(() => {
    class UserTA extends mm.TableActions {
      t = mm.selectRows(t.name).orderByAsc(t.name);
    }
    mm.tableActions(user, UserTA);
  });
  assert.doesNotThrow(() => {
    class UserTA extends mm.TableActions {
      t = mm.selectPage(t.name).orderByAsc(t.name);
    }
    mm.tableActions(user, UserTA);
  });
  itThrows(() => {
    class UserTA extends mm.TableActions {
      t = mm.selectRows(t.name);
    }
    mm.tableActions(user, UserTA);
  }, 'An ORDER BY clause is required when selecting multiple rows [action "t"] [table "Table(user)"]');
  assert.doesNotThrow(() => {
    class UserTA extends mm.TableActions {
      t = mm.selectRows(t.name).noOrderBy;
    }
    mm.tableActions(user, UserTA);
  }, 'An ORDER BY clause is required when selecting multiple rows [action "t"] [table "Table(user)"]');
  itThrows(() => {
    class UserTA extends mm.TableActions {
      t = mm.selectPage(t.name);
    }
    mm.tableActions(user, UserTA);
  }, 'An ORDER BY clause is required when selecting multiple rows [action "t"] [table "Table(user)"]');
});

it('Set action.__table via from()', () => {
  class UserTA extends mm.TableActions {
    t = mm.selectRow(user.id, user.name);
    t2 = mm.selectRow(post.id).from(post);
  }
  const ta = mm.tableActions(user, UserTA);
  eq(ta.t.__sqlTable, null);
  eq(ta.t.__groupTable, user);
  eq(ta.t2.__sqlTable, post);
  eq(ta.t2.__groupTable, user);

  let table = ta.t.mustGetAvailableSQLTable(null);
  eq(table, user);
  table = ta.t2.mustGetAvailableSQLTable(null);
  eq(table, post);
});

it('Subquery', () => {
  class PostTA extends mm.TableActions {
    t = mm.selectRow(post.title).where`${post.user_id.isEqualTo`${mm
      .selectRow(mm.max(user.id).toColumn('maxID'))
      .from(user)}`}`;
  }
  const ta = mm.tableActions(post, PostTA);
  eq(
    ta.t.whereSQLString,
    'SQL(E(Column(user_id, Table(post)), type = 1), E( = , type = 0), E(SelectAction(null, null)(Table(user)), type = 5))',
  );
});

it('Select DISTINCT', () => {
  class UserTA extends mm.TableActions {
    t1 = mm.selectRow();
    t2 = mm.selectRow().distinct();
  }
  const ta = mm.tableActions(user, UserTA);
  eq(ta.t1.distinctFlag, false);
  eq(ta.t2.distinctFlag, true);
});

it('UNION', () => {
  const t1 = mm.selectRow(user.id).from(user);
  const t2 = mm.selectRow();
  const t3 = mm.selectRow();
  const t1t2 = t1.union(t2).orderByAsc(user.id);
  class UserTA extends mm.TableActions {
    t = t1t2.unionAll(t3, true).orderByAsc(user.id);
  }
  const ta = mm.tableActions(user, UserTA);
  const { t } = ta;
  ok(t1t2 instanceof mm.SelectAction);
  ok(t1t2.mode === mm.SelectActionMode.list);
  eq(t1t2.__sqlTable, t1.__sqlTable);
  eq(t1t2.__sqlTable, user);
  eq(t1t2.unionMembers![0], t1);
  eq(t1t2.unionMembers![1], t2);
  eq(t1t2.unionAllFlag, false);
  eq(t.unionMembers![0], t1t2);
  ok(t.mode === mm.SelectActionMode.page);
  eq(t.unionMembers![1], t3);
  eq(t.unionAllFlag, true);
  eq(t.__sqlTable, t1.__sqlTable);
  eq(t.__sqlTable, user);
});

it('UNION on a ghost table', () => {
  const t1 = mm.selectRow(user.id).from(user);
  const t2 = mm.selectRow();
  class UserTA extends mm.TableActions {
    t = t1.union(t2).orderByAsc(user.id);
  }
  const ta = mm.tableActions(mm.ghostTable, UserTA);
  const { t } = ta;
  eq(t.unionMembers![0], t1);
  eq(t.unionMembers![1], t2);
  eq(t.__name, 't');
  eq(t.__groupTable, mm.ghostTable);
  eq(t.__sqlTable, user);
});
