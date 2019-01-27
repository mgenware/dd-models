import * as dd from '../../';

test('bigInt', () => {
  const c = dd.bigInt(123);
  expect(c.type.types).toContain(dd.dt.bigInt);
  expect(c.default).toBe(123);
  expect(c.type.unsigned).toBe(false);
});

test('unsignedBigInt', () => {
  const c = dd.unsignedBigInt(123);
  expect(c.type.types).toContain(dd.dt.bigInt);
  expect(c.default).toBe(123);
  expect(c.type.unsigned).toBe(true);
});

test('int', () => {
  const c = dd.int(123);
  expect(c.type.types).toContain(dd.dt.int);
  expect(c.default).toBe(123);
  expect(c.type.unsigned).toBe(false);
});

test('unsignedInt', () => {
  const c = dd.unsignedInt(123);
  expect(c.type.types).toContain(dd.dt.int);
  expect(c.default).toBe(123);
  expect(c.type.unsigned).toBe(true);
});

test('smallInt', () => {
  const c = dd.smallInt(123);
  expect(c.type.types).toContain(dd.dt.smallInt);
  expect(c.default).toBe(123);
  expect(c.type.unsigned).toBe(false);
});

test('unsignedSmallInt', () => {
  const c = dd.unsignedSmallInt(123);
  expect(c.type.types).toContain(dd.dt.smallInt);
  expect(c.default).toBe(123);
  expect(c.type.unsigned).toBe(true);
});

test('tinyInt', () => {
  const c = dd.tinyInt(123);
  expect(c.type.types).toContain(dd.dt.tinyInt);
  expect(c.default).toBe(123);
  expect(c.type.unsigned).toBe(false);
});

test('unsignedTinyInt', () => {
  const c = dd.unsignedTinyInt(123);
  expect(c.type.types).toContain(dd.dt.tinyInt);
  expect(c.default).toBe(123);
  expect(c.type.unsigned).toBe(true);
});

test('char', () => {
  const c = dd.char(20, 'ha');
  expect(c.type.types).toContain(dd.dt.char);
  expect(c.default).toBe('ha');
  expect(c.type.length).toBe(20);
});

test('varChar', () => {
  const c = dd.varChar(20, 'ha');
  expect(c.type.types).toContain(dd.dt.varChar);
  expect(c.default).toBe('ha');
  expect(c.type.length).toBe(20);
});

test('pk', () => {
  const c = dd.pk();
  expect(c.type.types).toContain(dd.dt.bigInt);
  expect(c.type.unique).toBe(false);
  expect(c.type.nullable).toBe(false);
  expect(c.type.unsigned).toBe(true);
});

test('pk(column)', () => {
  const charCol = dd.char(3);
  const c = dd.pk(charCol);
  expect(c).toBe(charCol);
  expect(c.type.unique).toBe(false);
  expect(c.type.nullable).toBe(false);
});

test('text', () => {
  const c = dd.text('ha');
  expect(c.type.types).toContain(dd.dt.text);
  expect(c.default).toBe('ha');
});

test('double', () => {
  const c = dd.double(20);
  expect(c.type.types).toContain(dd.dt.double);
  expect(c.default).toBe(20);
});

test('float', () => {
  const c = dd.float(20);
  expect(c.type.types).toContain(dd.dt.float);
  expect(c.default).toBe(20);
});

test('bool', () => {
  const c = dd.bool(true);
  expect(c.type.types).toContain(dd.dt.bool);
  expect(c.default).toBe(true);
});

test('datetime', () => {
  let c = dd.datetime();
  expect(c.type.types).toContain(dd.dt.datetime);

  c = dd.datetime(true);
  expect((c.default as object).toString()).toBe('CALL(0)');
});

test('date', () => {
  let c = dd.date();
  expect(c.type.types).toContain(dd.dt.date);

  c = dd.date(true);
  expect((c.default as object).toString()).toBe('CALL(1)');
});

test('time', () => {
  let c = dd.time();
  expect(c.type.types).toContain(dd.dt.time);

  c = dd.time(true);
  expect((c.default as object).toString()).toBe('CALL(2)');
});