import { BookDown, BookX, Library } from 'lucide-react';

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
      icon: <BookDown className={classes} />
    },
    {
      title: 'Exclude from Home',
      url: '/exclude-from-home',
      icon: <BookX className={classes} />
    },
    {
      title: 'Add Library to Role',
      url: '/add-library-to-role',
      icon: <BookX className={classes} />
    }
  ]
};
