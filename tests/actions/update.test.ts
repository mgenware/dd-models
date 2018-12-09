import * as dd from '../../';
import user from '../models/user';

test('Update', () => {
  const actions = dd.actions(user);
  const v = actions
    .update('t')
    .set(user.name, dd.sql`${dd.input(user.name)}`)
    .set(user.follower_count, dd.sql`${user.follower_count} + 1`)
    .where(dd.sql`${user.id} = 1`);

  expect(v.type).toBe(dd.ActionType.update);
  expect(v.name).toBe('UpdateT');
  expect(v).toBeInstanceOf(dd.UpdateAction);
  expect(v).toBeInstanceOf(dd.Action);
  expect(v.table).toBe(user);
  expect(v.checkAffectedRows).toBeFalsy();
  expect(v.whereSQL).not.toBeNull();
  expect(v.columnValueMap.size).toBe(2);

  const vName = v.columnValueMap.get(user.name) as dd.SQL;
  const vSnakeName = v.columnValueMap.get(user.snake_case_name) as dd.SQL;
  expect(vName).not.toBeNull();
  expect(vSnakeName).not.toBeNull();
});

test('Update without where', () => {
  const actions = dd.actions(user);
  const v = actions
    .update('t')
    .set(user.name, dd.sql`${dd.input(user.name)}`)
    .set(user.follower_count, dd.sql`${user.follower_count} + 1`);

  expect(v.name).toBe('UpdateT');
  expect(v.table).toBe(user);
  const vName = v.columnValueMap.get(user.name) as dd.SQL;
  const vSnakeName = v.columnValueMap.get(user.snake_case_name) as dd.SQL;
  expect(vName).not.toBeNull();
  expect(vSnakeName).not.toBeNull();
});

test('Order of setInputs and set', () => {
  const actions = dd.actions(user);
  const v = actions
    .update('t')
    .set(user.name, user.name.toInputSQL('a'))
    .setInputs(user.snake_case_name, user.name)
    .set(user.name, user.name.toInputSQL('b'));

  expect(v.columnValueMap.size).toBe(2);

  const vName = v.columnValueMap.get(user.name) as dd.SQL;
  const vSnakeName = v.columnValueMap.get(user.snake_case_name) as dd.SQL;

  expect(vName).toEqual(user.name.toInputSQL('b'));
  expect(vSnakeName).toEqual(user.snake_case_name.toInputSQL());
});

test('Update row', () => {
  const actions = dd.actions(user);
  const v = actions.updateOne('t').setInputs(user.snake_case_name);

  expect(v.checkAffectedRows).toBeTruthy();
});

test('ByID', () => {
  const actions = dd.actions(user);
  const v = actions
    .updateOne('t')
    .setInputs(user.snake_case_name)
    .byID();

  expect(v.whereSQL).toEqual(user.id.isEqualToInput());
});
