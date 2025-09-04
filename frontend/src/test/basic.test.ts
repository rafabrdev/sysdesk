import { describe, it, expect } from 'vitest';

describe('Teste Básico', () => {
  it('deve executar um teste simples', () => {
    expect(1 + 1).toBe(2);
  });

  it('deve testar strings', () => {
    const message = 'Hello, Vitest!';
    expect(message).toContain('Vitest');
  });

  it('deve testar objetos', () => {
    const user = { name: 'Test User', age: 25 };
    expect(user).toEqual({ name: 'Test User', age: 25 });
  });

  it('deve testar arrays', () => {
    const items = ['apple', 'banana', 'orange'];
    expect(items).toHaveLength(3);
    expect(items).toContain('banana');
  });
});
