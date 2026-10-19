import { describe, expect, it } from 'vitest';
import { themeClassOf } from './portalTheme';

describe('themeClassOf', () => {
  it('leva o tema de quem abre o portal', () => {
    document.body.innerHTML = `
      <div class="private-user-theme"><button id="logado"></button></div>
      <div class="public-theme"><button id="publico"></button></div>
      <button id="solto"></button>
    `;
    expect(themeClassOf(document.getElementById('logado'))).toBe('private-user-theme');
    expect(themeClassOf(document.getElementById('publico'))).toBe('public-theme');
    expect(themeClassOf(document.getElementById('solto'))).toBe('');
    expect(themeClassOf(null)).toBe('');
  });
});
