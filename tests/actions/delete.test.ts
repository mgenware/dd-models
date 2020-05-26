import * as assert from 'assert';
import { itThrows } from 'it-throws';
import * as mm from '../..';
import user from '../models/user';

const expect = assert.equal;
const { ok } = assert;

it('DeleteAction', () => {
  class UserTA extends mm.TableActions {
    t = mm.deleteOne().where(mm.sql`${user.id} = 1`);
  }
  const ta = mm.tableActions(user, UserTA);
  const v = ta.t;
  ok(v instanceof mm.DeleteAction);
  ok(v instanceof mm.CoreSelectAction);
  ok(v instanceof mm.Action);
  expect(
    v.whereSQLString,
    'SQL(E(Column(id, Table(user)), type = 1), E( = 1, type = 0))',
  );
  expect(v.actionType, mm.ActionType.delete);
});

it('deleteOne', () => {
  class UserTA extends mm.TableActions {
    t = mm.deleteOne().where(mm.sql`${user.id} = 1`);
  }
  const ta = mm.tableActions(user, UserTA);
  const v = ta.t;

  // extra props
  expect(v.ensureOneRowAffected, true);
  expect(v.allowNoWhere, false);

  // Throw error when WHERE is empty
  itThrows(() => {
    class TA extends mm.TableActions {
      t = mm.deleteOne();
    }
    mm.tableActions(user, TA);
  }, '`allowNoWhere` is set to false, you must define a WHERE clause. Otherwise, use `unsafeDeleteAll` [action "t"]');
});

it('deleteSome', () => {
  class UserTA extends mm.TableActions {
    t = mm.deleteSome().where(mm.sql`${user.id} = 1`);
  }
  const ta = mm.tableActions(user, UserTA);
  const v = ta.t;

  // extra props
  expect(v.ensureOneRowAffected, false);
  expect(v.allowNoWhere, false);

  // Throw error when WHERE is empty
  itThrows(() => {
    class TA extends mm.TableActions {
      t = mm.deleteSome();
    }
    mm.tableActions(user, TA);
  }, '`allowNoWhere` is set to false, you must define a WHERE clause. Otherwise, use `unsafeDeleteAll` [action "t"]');
});

it('unsafeDeleteAll', () => {
  class UserTA extends mm.TableActions {
    t = mm.unsafeDeleteAll();
  }
  const ta = mm.tableActions(user, UserTA);
  const v = ta.t;

  // extra props
  expect(v.ensureOneRowAffected, false);
  expect(v.allowNoWhere, true);
});
