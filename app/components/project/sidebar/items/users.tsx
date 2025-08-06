import { UserCog, UserRoundPlus, Users } from 'lucide-react';

const baseUrl = '/users';

export const users = {
  title: 'User Management',
  url: '#',
  icon: UserCog,
  isActive: true,
  items: [
    { title: 'Users', url: baseUrl, icon: <Users /> },
    { title: 'Create', url: baseUrl + '/create', icon: <UserRoundPlus /> }
  ]
};
