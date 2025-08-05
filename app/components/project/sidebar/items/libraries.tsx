import { BookDown, BookX, Library } from 'lucide-react';

const classes = 'text-muted-foreground';

export const libraries = {
  title: 'Libraries',
  url: '#',
  icon: Library,
  items: [
    {
      title: 'Sync Libraries',
      url: '#',
      icon: <BookDown className={classes} />
    },
    {
      title: 'Exclude from Home',
      url: '#',
      icon: <BookX className={classes} />
    },
    {
      title: 'Add Library to Role',
      url: '#',
      icon: <BookX className={classes} />
    }
  ]
};
