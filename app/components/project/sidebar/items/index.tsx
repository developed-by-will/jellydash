import { LucideIcon } from 'lucide-react';
import { content } from './content';
import { libraries } from './libraries';
import { roles } from './roles';
import { server } from './server';
import { users } from './users';

type NavSubItem = {
  title: string;
  url: string;
  icon?: React.ReactNode;
  canAccess?: boolean;
  items?: {
    canAccess?: boolean;
    title: string;
    url: string;
    icon?: React.ReactNode;
  }[];
};

export type NavItem = {
  title: string;
  url: string;
  icon?: LucideIcon;
  isActive?: boolean;
  items?: NavSubItem[];
  canAccess?: boolean;
};

export const items: NavItem[] = [users, server, content, libraries, roles];
