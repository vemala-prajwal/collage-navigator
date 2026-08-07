import test from 'node:test';
import assert from 'node:assert/strict';
import emergencyContacts from './emergencyContacts.js';

test('emergency contacts data is present and contains contact details', () => {
  assert.ok(Array.isArray(emergencyContacts), 'expected an array');
  assert.ok(emergencyContacts.length > 0, 'expected at least one category');

  const firstCategory = emergencyContacts[0];
  assert.ok(firstCategory.category, 'expected category label');
  assert.ok(Array.isArray(firstCategory.contacts), 'expected contacts array');
  assert.ok(firstCategory.contacts.length > 0, 'expected at least one contact');

  const firstContact = firstCategory.contacts[0];
  assert.ok(firstContact.name, 'expected contact name');
  assert.ok(firstContact.number, 'expected contact number');
});
