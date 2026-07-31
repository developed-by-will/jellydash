'use client';

import { BASE_URL } from '@/app/api/constants';
import { JellyfinItemsResponse } from '@/app/api/types';
import { Rating } from '@/app/db/ratings';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import useQueryHandler from '@/hooks/useQueryHandler';
import ImageWithSkeleton from './ImageWithSkeleton';

type Props = {
  data: JellyfinItemsResponse;
  ratings: Record<string, string>;
  onRatingChange: (itemId: string, value: string) => void;
};

export default function Items({ data, ratings, onRatingChange }: Readonly<Props>) {
  const { data: availableRatings } = useQueryHandler<Rating[]>({
    queryKey: 'ratings',
    endpoint: 'ratings'
  });

  return (
    <div
      className="grid gap-4 w-full mt-5"
      style={{
        gridTemplateColumns: 'repeat(auto-fill, minmax(210px, 1fr))'
      }}
    >
      {data.Items.map((item) => {
        const selectedRating =
          ratings[item.Id] ??
          (availableRatings ?? []).find(
            (r) => r.value.trim().toUpperCase() === item.OfficialRating?.trim().toUpperCase()
          )?.value;

        return (
          <div className="flex flex-col" key={item.Id}>
            <button className="flex justify-center p-2 rounded-lg transition-colors hover:bg-gray-100">
              <ImageWithSkeleton
                src={`${BASE_URL}/Items/${item.Id}/Images/Primary?fillHeight=330&fillWidth=220&quality=96 `}
                alt={item.Name}
              />
            </button>

            <p className="text-center mt-2">{item.Name}</p>

            <Select
              value={selectedRating}
              onValueChange={(value) => onRatingChange(item.Id, value)}
            >
              <SelectTrigger className={selectedRating ? '' : 'bg-red-200 border border-red-500'}>
                <SelectValue placeholder="Choose a Rating" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectLabel>Official Rating</SelectLabel>
                  {(availableRatings ?? []).map((r) => (
                    <SelectItem key={r.id} value={r.value}>
                      {r.label}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>
        );
      })}
    </div>
  );
}
