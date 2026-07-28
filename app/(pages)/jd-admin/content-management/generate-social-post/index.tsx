'use client';

import { PosterType } from '@/app/api/types';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Form } from '@/components/ui/form';
import useQueryHandler from '@/hooks/useQueryHandler';
import { zodResolver } from '@hookform/resolvers/zod';
import { useSession } from 'next-auth/react';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import FormFields from './components/formFields';
import { formValidationRules, SearchItemPayloadType } from './formValidations';

import HighResPoster from './components/highResPoster';
import Items from './components/Items';
import Preview from './components/preview';
import { texts } from './configs';
import useSocialPost from './hooks/useSocialPosts';

export default function GenerateSocialPost() {
  const { data: session } = useSession();
  const [searchQuery, setSearchQuery] = useState('');
  const [lastSearchedTerm, setLastSearchedTerm] = useState('');
  const [text, setText] = useState(texts.find((item) => item.default)?.value ?? '');

  const { selectedItem, hiddenPreviewRef, handleItemClick, getHighResImageUrl, handleShare } =
    useSocialPost();

  const form = useForm<SearchItemPayloadType>({
    resolver: zodResolver(formValidationRules),
    mode: 'onSubmit',
    defaultValues: { searchTerm: '' }
  });

  const { control, handleSubmit, watch } = form;
  const currentSearchTerm = watch('searchTerm');

  const { data, isFetching } = useQueryHandler<PosterType[]>({
    queryKey: ['search-item', searchQuery],
    endpoint: `items/search?userId=${session?.user.JellyfinSession?.User.Id}&searchTerm=${searchQuery}`,
    enabled: !!searchQuery
  });

  const isSearchDisabled =
    isFetching || currentSearchTerm.trim() === '' || currentSearchTerm === lastSearchedTerm;

  const onSubmit = (formData: SearchItemPayloadType) => {
    setSearchQuery(formData.searchTerm);
    setLastSearchedTerm(formData.searchTerm);
  };

  return (
    <div className="flex flex-col lg:flex-row gap-5">
      <Card className="flex-none order-2 lg:order-1 lg:w-1/3 p-5" id="preview">
        <Preview
          text={text}
          setText={setText}
          selectedItem={selectedItem}
          getHighResImageUrl={getHighResImageUrl}
          handleShare={handleShare}
        />
      </Card>

      <Card className="flex-1 order-1 lg:order-2 p-5">
        <div className="flex gap-5 flex-col lg:flex-row items-center justify-end">
          <Form {...form}>
            <form
              onSubmit={handleSubmit(onSubmit)}
              className="flex items-center rounded-2xl gap-4 max-w-sm mx-auto"
            >
              <FormFields control={control} isPending={isFetching} />
              <Button type="submit" disabled={isSearchDisabled} className="mt-6">
                {isFetching ? 'Searching...' : 'Search'}
              </Button>
            </form>
          </Form>
        </div>

        {data && data.length > 0 && (
          <Items data={data} selectedItem={selectedItem} handleItemClick={handleItemClick} />
        )}
      </Card>

      {/* Hidden high-res container for download */}
      <HighResPoster
        text={text}
        selectedItem={selectedItem}
        getHighResImageUrl={getHighResImageUrl}
        hiddenPreviewRef={hiddenPreviewRef}
      />
    </div>
  );
}
