const { formatCurrency } = require('../../src/utilities/money');

describe('formatCurrency', () => {
  test('formats positive amounts', () => {
    expect(formatCurrency(1234.56)).toBe('$1,234.56');
  });

  test('formats negative amounts', () => {
    expect(formatCurrency(-45.6)).toBe('-$45.60');
  });

  test('rounds to two decimals', () => {
    expect(formatCurrency(1.005)).toBe('$1.01');
  });
});
