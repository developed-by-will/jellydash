import { UserCog, UserRoundPen, UserRoundPlus, UserRoundX, Users } from 'lucide-react';

export const users = {
  title: 'User Management',
  url: '#',
  icon: UserCog,
  isActive: true,
  items: [
    { title: 'Users', url: '#', icon: <Users /> },
    { title: 'Create', url: '#', icon: <UserRoundPlus /> },
    { title: 'Update', url: '#', icon: <UserRoundPen /> },
    { title: 'Remove', url: '#', icon: <UserRoundX /> }
  ]
};
