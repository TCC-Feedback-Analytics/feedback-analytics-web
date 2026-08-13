import * as React from 'react';
import type { SidebarContextType } from './ui.types';

export const SidebarContext = React.createContext<SidebarContextType | undefined>(undefined);

export function useSidebar() {
  const context = React.useContext(SidebarContext);
  if (!context) {
    throw new Error('useSidebar deve ser utilizado dentro de um SidebarProvider');
  }
  return context;
}
