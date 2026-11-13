import {digest} from '../src/state/sha256';

test('digests a password with an empty salt to the SHA-256 of "abc"', async () => {
  expect(await digest('abc', '')).toBe(
    'ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad',
  );
});

test('digest is stable for the same password and salt and differs across salts', async () => {
  const a = await digest('hunter2', '0001020304050607');
  expect(await digest('hunter2', '0001020304050607')).toBe(a);
  expect(await digest('hunter2', '0706050403020100')).not.toBe(a);
});
