import * as dd from '../..';
import user from '../models/user';

test('Insert', () => {
  const v = dd.action('t')
    .insert(user)
    .set(user.name, dd.sql`${dd.input(user.name)}`)
    .set(user.follower_count, dd.sql`${user.follower_count} + 1`);

  expect(v.name).toBe('t');
  expect(v.table).toBe(user);
  expect(v.setters.length).toBe(2);
  expect(v.setters[0].column).toBe(user.name);
  expect(v.setters[0].sql).not.toBeNull();
  expect(v.setters[1].column).toBe(user.follower_count);
  expect(v.setters[1].sql).not.toBeNull();
});