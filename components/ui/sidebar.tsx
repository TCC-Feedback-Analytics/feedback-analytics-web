import * as React from 'react';
import type {
  SidebarProviderProps,
  SidebarProps,
  SidebarMenuButtonProps,
} from './ui.types';
import { SidebarContext, useSidebar } from './useSidebar';

export function SidebarProvider({
  children,
  defaultOpen = true,
  open: openProp,
  onOpenChange: setOpenProp,
}: SidebarProviderProps) {
  const [isMobile, setIsMobile] = React.useState(false);
  const [_open, _setOpen] = React.useState(defaultOpen);
  const open = openProp !== undefined ? openProp : _open;

  const setOpen = React.useCallback(
    (value: boolean | ((value: boolean) => boolean)) => {
      const openState = typeof value === 'function' ? value(open) : value;
      if (setOpenProp) {
        setOpenProp(openState);
      } else {
        _setOpen(openState);
      }
    },
    [setOpenProp, open]
  );

  React.useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const toggleSidebar = React.useCallback(() => {
    setOpen((prev) => !prev);
  }, [setOpen]);

  const value = React.useMemo(
    () => ({ open, setOpen, toggleSidebar, isMobile }),
    [open, setOpen, toggleSidebar, isMobile]
  );

  return (
    <SidebarContext.Provider value={value}>
      <div className="group/sidebar-wrapper flex min-h-svh w-full max-w-full overflow-x-hidden text-(--text-primary)">
        {children}
      </div>
    </SidebarContext.Provider>
  );
}

export function Sidebar({
  className = '',
  children,
  side = 'left',
  variant = 'sidebar',
  collapsible = 'offcanvas',
  ...props
}: SidebarProps) {
  const { open, isMobile } = useSidebar();

  if (isMobile) {
    return null; // No mobile, o Sidebar desktop é totalmente substituído pelo MobileBottomNav + Drawer
  }

  return (
    <aside
      data-state={open ? 'expanded' : 'collapsed'}
      data-collapsible={collapsible}
      data-variant={variant}
      data-side={side}
      className={`fixed top-16 bottom-0 z-40 flex flex-col border-r border-(--quaternary-color)/15 bg-(--bg-secondary)/95 text-(--text-primary) backdrop-blur-md transition-all duration-300 ease-in-out ${open ? 'w-64 translate-x-0' : 'w-16 translate-x-0'
        } ${className}`}
      {...props}
    >
      <div className="flex h-full w-full flex-col overflow-hidden">{children}</div>
    </aside>
  );
}

export function SidebarHeader({ className = '', children, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={`flex flex-col gap-2 p-3 border-b border-(--quaternary-color)/10 ${className}`} {...props}>
      {children}
    </div>
  );
}export function SidebarContent({ className = '', children, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={`flex flex-1 flex-col gap-2 overflow-y-auto overflow-x-hidden p-3 custom-scrollbar ${className}`} {...props}>
      {children}
    </div>
  );
}

export function SidebarFooter({ className = '', children, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={`flex flex-col gap-2 p-3 border-t border-(--quaternary-color)/10 ${className}`} {...props}>
      {children}
    </div>
  );
}

export function SidebarGroup({ className = '', children, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={`flex w-full min-w-0 flex-col p-1 ${className}`} {...props}>
      {children}
    </div>
  );
}

export function SidebarGroupLabel({ className = '', children, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={`flex h-8 shrink-0 items-center rounded-md px-2 text-xs font-semibold uppercase tracking-wider text-(--text-tertiary) ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}

export function SidebarGroupContent({ className = '', children, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={`w-full text-sm ${className}`} {...props}>
      {children}
    </div>
  );
}

export function SidebarMenu({ className = '', children, ...props }: React.HTMLAttributes<HTMLUListElement>) {
  return (
    <ul className={`flex w-full min-w-0 flex-col gap-1 ${className}`} {...props}>
      {children}
    </ul>
  );
}

export function SidebarMenuItem({ className = '', children, ...props }: React.HTMLAttributes<HTMLLIElement>) {
  return (
    <li className={`group/menu-item relative ${className}`} {...props}>
      {children}
    </li>
  );
}

export const SidebarMenuButton = React.forwardRef<HTMLButtonElement, SidebarMenuButtonProps>(
  ({ className = '', isActive = false, size = 'default', children, ...props }, ref) => {
    const sizeClasses = {
      default: 'h-9 px-3 text-sm',
      sm: 'h-8 px-2 text-xs',
      lg: 'h-10 px-3 text-base',
    }[size];

    return (
      <button
        ref={ref}
        data-active={isActive}
        className={`flex w-full items-center gap-2.5 rounded-lg font-medium transition-all duration-150 outline-none ${sizeClasses} ${isActive
            ? 'bg-(--seventh-color) text-(--text-primary) font-semibold border-l-3 border-(--primary-color)'
            : 'text-(--text-secondary) hover:bg-(--seventh-color)/60 hover:text-(--text-primary)'
          } ${className}`}
        {...props}
      >
        {children}
      </button>
    );
  }
);
SidebarMenuButton.displayName = 'SidebarMenuButton';

export function SidebarMenuSub({ className = '', children, ...props }: React.HTMLAttributes<HTMLUListElement>) {
  return (
    <ul
      className={`ml-3.5 mr-1 flex flex-col gap-1 border-l border-(--quaternary-color)/15 pl-2.5 py-1 ${className}`}
      {...props}
    >
      {children}
    </ul>
  );
}

export function SidebarMenuSubItem({ className = '', children, ...props }: React.HTMLAttributes<HTMLLIElement>) {
  return <li className={className} {...props}>{children}</li>;
}

export const SidebarMenuSubButton = React.forwardRef<
  HTMLAnchorElement,
  React.AnchorHTMLAttributes<HTMLAnchorElement> & { isActive?: boolean }
>(({ className = '', isActive = false, children, ...props }, ref) => {
  return (
    <a
      ref={ref}
      data-active={isActive}
      className={`flex h-8 w-full items-center gap-2 rounded-md px-2 text-xs font-medium transition-colors ${isActive
          ? 'text-(--primary-color) font-semibold'
          : 'text-(--text-tertiary) hover:bg-(--seventh-color)/40 hover:text-(--text-primary)'
        } ${className}`}
      {...props}
    >
      {children}
    </a>
  );
});
SidebarMenuSubButton.displayName = 'SidebarMenuSubButton';
