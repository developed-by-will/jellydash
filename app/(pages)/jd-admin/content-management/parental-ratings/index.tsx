'use client';
import { BASE_URL } from '@/app/api/constants';
import { JellyfinItemsResponse } from '@/app/api/types';
import { toast } from '@/components/breeze-ui/toast/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useMutationHandler } from '@/hooks/useMutationHandler';
import useQueryHandler from '@/hooks/useQueryHandler';
import { useSession } from 'next-auth/react';
import { useEffect, useState } from 'react';
import ImageWithSkeleton from './components/ImageWithSkeleton';
import Items from './components/Items';
import { PaginationItems } from './components/Pagination';

const officialRatingsPageSize = 18;

export default function ParentalRatings() {
  const { data: session } = useSession();
  //const [searchQuery, setSearchQuery] = useState('');
  const [page, setPage] = useState<number | null>(null);
  const [startIndex, setStartIndex] = useState(0);
  const [ratings, setRatings] = useState<Record<string, string>>({});

  // Fetch items for the current page
  const { data, isError, error, isPending, isFetching, status } =
    useQueryHandler<JellyfinItemsResponse>({
      queryKey: ['official-ratings', startIndex],
      endpoint: `items/official-ratings?&page=${startIndex}&limit=${officialRatingsPageSize}&userId=${session?.user.JellyfinSession?.User.Id}`,
      enabled: page !== null
    });

  // Mutation for updating ratings
  const { mutateAsync: updateRatings, isPending: isUpdating } = useMutationHandler({
    endpoint: `items/update-ratings?UserId=${session?.user.JellyfinSession?.User.Id}`,
    method: 'PATCH',
    mutationKey: 'update-ratings',
    requiresAuth: true
  });

  useEffect(() => {
    const url = new URL(window.location.href);
    const pageParam = url.searchParams.get('page');

    if (pageParam && !isNaN(Number(pageParam)) && Number(pageParam) > 0) {
      const pageNumber = Number(pageParam);
      setPage(pageNumber);
      setStartIndex(pageNumber - 1);
    } else {
      setPage(1);
      setStartIndex(0);
    }
  }, []);

  useEffect(() => {
    if (page === null) return;

    const url = new URL(window.location.href);
    url.searchParams.set('page', String(page));
    window.history.replaceState(null, '', url.toString());
  }, [page]);

  const handlePageChange = (newPage: number) => {
    setPage(newPage + 1);
    setStartIndex(newPage);
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setRatings({});
  };

  // Called when a single item's select value changes
  const handleRatingChange = (itemId: string, value: string) => {
    setRatings((prev) => ({ ...prev, [itemId]: value }));
  };

  const updateOfficialRatings = async () => {
    const updates = Object.entries(ratings).map(([ItemId, Rating]) => ({ ItemId, Rating }));
    if (updates.length === 0) return;

    await updateRatings(updates);

    toast({
      title: 'Success',
      description: 'The ratings were updated successfully',
      variant: 'success',
      duration: 3000
    });
  };

  const Header = (
    <CardHeader className="p-0">
      <CardTitle>Rate Content</CardTitle>
      <CardDescription>
        Search and update parental ratings for each Movie and TV Show. Use this page also to detect
        wrong titles and posters.
      </CardDescription>
    </CardHeader>
  );

  if (isError) return <p>Error: {error.message}</p>;

  if (isPending || isFetching || status !== 'success') {
    return (
      <Card className="flex flex-col w-full gap-10 p-10">
        {Header}
        <Card
          className="grid gap-4 w-full mt-5"
          style={{
            gridTemplateColumns: 'repeat(auto-fill, minmax(210px, 1fr))'
          }}
        >
          {Array.from({ length: officialRatingsPageSize }).map((_, index) => (
            <button
              className="flex justify-center p-2 rounded-lg transition-colors hover:bg-gray-100"
              key={index + 1}
            >
              <ImageWithSkeleton src={BASE_URL} alt={'loading'} />
            </button>
          ))}
        </Card>
      </Card>
    );
  }

  return (
    <Card className="flex flex-col w-full gap-10 p-10">
      {Header}

      {data && data.Items.length > 0 && (
        <>
          <Items data={data} ratings={ratings} onRatingChange={handleRatingChange} />

          <PaginationItems
            currentPage={startIndex}
            totalItems={data?.TotalRecordCount ?? 0}
            perPage={officialRatingsPageSize}
            onPageChange={handlePageChange}
            disabled={isUpdating}
          />

          <Button className="self-end px-10" onClick={updateOfficialRatings} disabled={isUpdating}>
            Save
          </Button>
        </>
      )}
    </Card>
  );
}
