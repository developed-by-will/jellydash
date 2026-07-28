'use client';

import { BASE_URL } from '@/app/api/constants';
import { PosterType } from '@/app/api/types';
import ImageWithSkeleton from './ImageWithSkeleton';

type Props = {
  data: PosterType[] | undefined;
  selectedItem: PosterType | null;
  handleItemClick: (item: PosterType) => void;
};

export default function Items(props: Readonly<Props>) {
  const { data, selectedItem, handleItemClick } = props;

  if (!data) return null;

  return (
    <div
      className="grid gap-4 w-full mt-5"
      style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))' }}
    >
      {data.map((item) => (
        <button
          key={item.Id}
          className={`flex justify-center p-2 rounded-lg transition-colors ${
            selectedItem?.Id === item.Id
              ? 'bg-blue-100 border-2 border-blue-500'
              : 'hover:bg-gray-100'
          }`}
          onClick={() => handleItemClick(item)}
        >
          <ImageWithSkeleton
            src={`${BASE_URL}/Items/${item.Id}/Images/Primary?fillHeight=330&fillWidth=220&quality=96`}
            alt={item.Name}
          />
        </button>
      ))}
    </div>
  );
}
