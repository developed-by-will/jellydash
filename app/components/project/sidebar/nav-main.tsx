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
import { ChevronRight, Lock, MoreHorizontal } from 'lucide-react';
import Link from 'next/link';
import React from 'react';
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

// Helper component for conditional links
const ConditionalLink = ({ item, isSubItem = false }: any) => {
  const canAccess = item.canAccess !== false;
  const className = `flex gap-2 items-center w-full ${isSubItem ? 'px-2 py-1' : ''} ${
    !canAccess ? 'opacity-50 cursor-not-allowed' : ''
  }`;
  const { isMobile, setOpenMobile } = useSidebar();

  if (!canAccess) {
    return (
      <div className={className}>
        {renderIcon(item.icon)}
        <span>{item.title}</span>
        <Lock className="w-3 h-3 ml-auto" />
      </div>
    );
  }

  return (
    <Link
      href={`/jd-admin/${item.url}`}
      className={className}
      onClick={() => {
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
                        // Dropdown
                        const canAccessDropdown = subItem.canAccess !== false;
                        return (
                          <SidebarMenuSubItem key={subItem.title}>
                            <DropdownMenu>
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
                                  {subItem.items.map((dropdownItem) => {
                                    const canAccessDropdownItem = dropdownItem.canAccess !== false;
                                    return (
                                      <DropdownMenuItem
                                        key={dropdownItem.title}
                                        className={`gap-2 ${canAccessDropdownItem ? 'cursor-pointer' : 'cursor-not-allowed opacity-50'}`}
                                        onSelect={(e) => {
                                          if (!canAccessDropdownItem) {
                                            e.preventDefault();
                                          }
                                        }}
                                      >
                                        <ConditionalLink item={dropdownItem} isSubItem />
                                      </DropdownMenuItem>
                                    );
                                  })}
                                </DropdownMenuContent>
                              )}
                            </DropdownMenu>
                          </SidebarMenuSubItem>
                        );
                      }
                      // Regular sub-item
                      const canAccessSubItem = subItem.canAccess !== false;
                      return (
                        <SidebarMenuSubItem key={subItem.title}>
                          {canAccessSubItem ? (
                            <SidebarMenuSubButton asChild>
                              <ConditionalLink item={subItem} isSubItem />
                            </SidebarMenuSubButton>
                          ) : (
                            <div
                              className={`flex items-center w-full px-2 py-1 text-sm rounded-md ${!canAccessSubItem ? 'opacity-50 cursor-not-allowed' : ''}`}
                            >
                              <ConditionalLink item={subItem} isSubItem />
                            </div>
                          )}
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
