import * as dd from '../../';
import user from '../models/user';

test('Delete', () => {
  const actions = dd.actions(user);
  const v = actions.delete('t')
    .where(dd.sql`${user.id} = 1`);

  expect(v.name).toBe('DeleteT');
  expect(v.table).toBe(user);
  expect(v).toBeInstanceOf(dd.DeleteAction);
  expect(v).toBeInstanceOf(dd.Action);
  expect(v.whereSQL).not.toBeNull();
  expect(v.type).toBe(dd.ActionType.delete);
});

test('Delete without where', () => {
  const actions = dd.actions(user);
  const v = actions.delete('t');

  expect(v.name).toBe('DeleteT');
  expect(v.table).toBe(user);
});