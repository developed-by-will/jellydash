import { ArrowUpDown, BookDown, BookX, Library } from 'lucide-react';

const classes = 'text-muted-foreground';

const baseUrl = '/libraries';

export const libraries = {
  title: 'Libraries',
  url: '#',
  icon: Library,
  items: [
    {
      title: 'Sync',
      url: baseUrl + '/sync',
      icon: <BookDown className={classes} />,
      canAccess: true
    },
    {
      title: 'Reorder Home',
      url: baseUrl + '/reorder-home',
      icon: <ArrowUpDown className={classes} />,
      canAccess: true
    },
    {
      title: 'Add Library to Role',
      url: '/add-library-to-role',
      icon: <BookX className={classes} />,
      canAccess: false
    }
  ]
};
