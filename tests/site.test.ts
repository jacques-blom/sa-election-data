import test from 'node:test';
import assert from 'node:assert/strict';
import { publicUrl } from '../src/lib/site.ts';

test('public links use HTTPS on counted.co.za while preserving their path and selection', () => {
  assert.equal(publicUrl('/api'), 'https://counted.co.za/api');
  assert.equal(publicUrl('http://localhost:4321/2026/places/witzenberg?ballot=ward#wards'),
    'https://counted.co.za/2026/places/witzenberg?ballot=ward#wards');
  assert.equal(publicUrl('https://preview.example/updates?event=42'), 'https://counted.co.za/updates?event=42');
});

test('public links cannot inherit credentials, ports or an alternate host', () => {
  for (const value of ['https://user:password@preview.example:8443/api', '//preview.example/api', '/nested//path']) {
    const url = new URL(publicUrl(value));
    assert.equal(url.origin, 'https://counted.co.za');
    assert.equal(url.username, '');
    assert.equal(url.password, '');
  }
});
