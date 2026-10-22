import { cleanup, render } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';
import { Dialog, DialogContent } from './dialog';

afterEach(() => {
  cleanup();
  document.body.style.overflow = '';
});

function TwoDialogs({ first, second }: { first: boolean; second: boolean }) {
  return (
    <>
      <Dialog open={first} onOpenChange={() => {}}>
        <DialogContent>Testar o formulário</DialogContent>
      </Dialog>
      <Dialog open={second} onOpenChange={() => {}}>
        <DialogContent>Convite do guia</DialogContent>
      </Dialog>
    </>
  );
}

describe('rolagem da página com diálogos', () => {
  it('trava enquanto o diálogo está aberto e destrava ao fechar', () => {
    const view = render(<TwoDialogs first second={false} />);
    expect(document.body.style.overflow).toBe('hidden');
    view.rerender(<TwoDialogs first={false} second={false} />);
    expect(document.body.style.overflow).toBe('');
  });

  it('dois diálogos fechando fora de ordem não deixam a página sem rolagem', () => {
    const view = render(<TwoDialogs first second={false} />);
    // O segundo abre com o primeiro ainda aberto (ex.: o convite do guia no primeiro feedback).
    view.rerender(<TwoDialogs first second />);
    // O primeiro fecha antes do segundo.
    view.rerender(<TwoDialogs first={false} second />);
    expect(document.body.style.overflow).toBe('hidden');
    view.rerender(<TwoDialogs first={false} second={false} />);
    expect(document.body.style.overflow).toBe('');
  });

  it('desmontar com o diálogo aberto também destrava', () => {
    const view = render(<TwoDialogs first second />);
    view.unmount();
    expect(document.body.style.overflow).toBe('');
  });
});
