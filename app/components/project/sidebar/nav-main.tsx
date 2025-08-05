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
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  useSidebar
} from '@/components/ui/sidebar';
import { ChevronRight, MoreHorizontal } from 'lucide-react';
import { items } from './items';

export function NavMain() {
  const { isMobile } = useSidebar();

  return (
    <SidebarGroup>
      <SidebarGroupLabel>Management</SidebarGroupLabel>
      <SidebarMenu>
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
                  {item.icon && <item.icon />}
                  <span>{item.title}</span>
                  {item.items && (
                    <ChevronRight className="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
                  )}
                </SidebarMenuButton>
              </CollapsibleTrigger>

              {item.items && (
                <CollapsibleContent>
                  <SidebarMenuSub>
                    {item.items.map((subItem) => {
                      if (subItem.items) {
                        // Dropdown
                        return (
                          <SidebarMenuSubItem key={subItem.title}>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <SidebarMenuSubButton className="w-full">
                                  {subItem.icon}
                                  <span>{subItem.title}</span>
                                  <MoreHorizontal className="ml-auto h-4 w-4" />
                                </SidebarMenuSubButton>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent
                                className="w-48 rounded-lg"
                                side={isMobile ? 'bottom' : 'right'}
                                align={isMobile ? 'end' : 'start'}
                              >
                                {subItem.items.map((dropdownItem) => (
                                  <DropdownMenuItem
                                    key={dropdownItem.title}
                                    className="gap-2 cursor-pointer"
                                  >
                                    {dropdownItem.icon}
                                    <span>{dropdownItem.title}</span>
                                  </DropdownMenuItem>
                                ))}
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </SidebarMenuSubItem>
                        );
                      }
                      // Regular sub-item
                      return (
                        <SidebarMenuSubItem key={subItem.title}>
                          <SidebarMenuSubButton asChild>
                            <a href={subItem.url}>
                              {subItem.icon}
                              <span>{subItem.title}</span>
                            </a>
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
