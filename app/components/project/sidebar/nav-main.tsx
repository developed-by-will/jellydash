'use client';

import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import {
  SidebarGroup,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  useSidebar
} from '@/components/ui/sidebar';
import { cn } from '@/lib/utils';
import { ChevronRight, Lock, MoreHorizontal } from 'lucide-react';
import Link from 'next/link';
import React, { useState } from 'react';
import { items } from './items';

// Helper function to render icons properly - NO DEFAULT SIZE
const renderIcon = (icon: any) => {
  if (!icon) return null;

  // If it's already a JSX element (like <PersonStanding />) - keep as is
  if (React.isValidElement(icon)) {
    return icon;
  }

  // If it's a React component (like ImagePlay) - render without forcing size
  if (typeof icon === 'function') {
    const IconComponent = icon;
    return <IconComponent />;
  }

  return null;
};

// Helper component for conditional links. Wrapped in forwardRef and forwarding the incoming
// className/rest props is what makes it work correctly as the child of `<SidebarMenuButton asChild>`
// / `<SidebarMenuSubButton asChild>` - Radix's Slot merges its own sizing classes (text-sm, h-7,
// icon clamp, truncate, ...) onto whatever this renders, but only if we actually read and apply
// them. Without this, those classes were silently dropped and sub-items fell back to browser
// defaults (bigger font, bigger icons, no truncation).
const ConditionalLink = React.forwardRef<HTMLAnchorElement | HTMLDivElement, any>(
  ({ item, isSubItem = false, onNavigate, className: incomingClassName, onClick, ...rest }, ref) => {
    const canAccess = item.canAccess !== false;
    const className = cn(
      'flex gap-2 items-center w-full',
      isSubItem && 'px-2 py-1',
      !canAccess && 'opacity-50 cursor-not-allowed',
      incomingClassName
    );
    const { isMobile, setOpenMobile } = useSidebar();

    if (!canAccess) {
      return (
        <div ref={ref as React.Ref<HTMLDivElement>} className={className} {...rest}>
          {renderIcon(item.icon)}
          <span>{item.title}</span>
          <Lock className="w-3 h-3 ml-auto" />
        </div>
      );
    }

    return (
      <Link
        ref={ref as React.Ref<HTMLAnchorElement>}
        href={`/jd-admin/${item.url}`}
        className={className}
        {...rest}
        onClick={(e: React.MouseEvent<HTMLAnchorElement>) => {
          onClick?.(e);
          onNavigate?.();

          if (isMobile) {
            setOpenMobile(false);

            setTimeout(() => {
              document.body.style.pointerEvents = '';
            }, 600);
          }
        }}
      >
        {renderIcon(item.icon)}
        <span>{item.title}</span>
      </Link>
    );
  }
);
ConditionalLink.displayName = 'ConditionalLink';

// A second-level item that itself has sub-items (e.g. Parental Ratings, Social Post) - rendered
// as a popup menu. Kept as its own component (rather than inline in the map below) so it can hold
// its own open state and close itself the moment one of its links is clicked.
const DropdownSubItem = ({ subItem, isMobile }: any) => {
  const [open, setOpen] = useState(false);
  const canAccessDropdown = subItem.canAccess !== false;

  return (
    <SidebarMenuSubItem>
      <DropdownMenu open={open} onOpenChange={setOpen}>
        <DropdownMenuTrigger asChild>
          <SidebarMenuSubButton
            className={`w-full cursor-pointer ${!canAccessDropdown ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            {renderIcon(subItem.icon)}
            <span>{subItem.title}</span>
            {!canAccessDropdown ? (
              <Lock className="ml-auto h-4 w-4" />
            ) : (
              <MoreHorizontal className="ml-auto h-4 w-4 cursor-pointer" />
            )}
          </SidebarMenuSubButton>
        </DropdownMenuTrigger>

        {canAccessDropdown && (
          <DropdownMenuContent
            className="w-48 rounded-lg"
            side={isMobile ? 'bottom' : 'right'}
            align={isMobile ? 'end' : 'start'}
          >
            {subItem.items.map((dropdownItem: any) => {
              const canAccessDropdownItem = dropdownItem.canAccess !== false;
              return (
                <DropdownMenuItem
                  key={dropdownItem.title}
                  asChild
                  className={canAccessDropdownItem ? 'cursor-pointer' : 'cursor-not-allowed opacity-50'}
                  onSelect={(e) => {
                    if (!canAccessDropdownItem) {
                      e.preventDefault();
                    }
                  }}
                >
                  <ConditionalLink
                    item={dropdownItem}
                    isSubItem
                    onNavigate={() => setOpen(false)}
                  />
                </DropdownMenuItem>
              );
            })}
          </DropdownMenuContent>
        )}
      </DropdownMenu>
    </SidebarMenuSubItem>
  );
};

export function NavMain() {
  const { isMobile } = useSidebar();

  return (
    <SidebarGroup>
      <SidebarMenu className="mt-4">
        {items.map((item) => (
          <Collapsible
            key={item.title}
            asChild
            defaultOpen={item.isActive}
            className="group/collapsible"
          >
            <SidebarMenuItem>
              <CollapsibleTrigger asChild>
                <SidebarMenuButton tooltip={item.title}>
                  {item.items ? (
                    <>
                      {renderIcon(item.icon)}
                      <span>{item.title}</span>
                      {item.items && (
                        <ChevronRight className="ml-auto transition-transform duration-100 group-data-[state=open]/collapsible:rotate-45" />
                      )}
                    </>
                  ) : (
                    <ConditionalLink item={item} />
                  )}
                </SidebarMenuButton>
              </CollapsibleTrigger>

              {item.items && (
                <CollapsibleContent>
                  <SidebarMenuSub>
                    {item.items.map((subItem) => {
                      if (subItem.items) {
                        return (
                          <DropdownSubItem
                            key={subItem.title}
                            subItem={subItem}
                            isMobile={isMobile}
                          />
                        );
                      }
                      // Regular sub-item - always goes through SidebarMenuSubButton (via asChild)
                      // so locked and unlocked items share the same text/icon sizing; the muted,
                      // not-allowed look for locked items comes from ConditionalLink itself.
                      return (
                        <SidebarMenuSubItem key={subItem.title}>
                          <SidebarMenuSubButton asChild>
                            <ConditionalLink item={subItem} isSubItem />
                          </SidebarMenuSubButton>
                        </SidebarMenuSubItem>
                      );
                    })}
                  </SidebarMenuSub>
                </CollapsibleContent>
              )}
            </SidebarMenuItem>
          </Collapsible>
        ))}
      </SidebarMenu>
    </SidebarGroup>
  );
}
