'use client';

import { PosterType } from '@/app/api/types';
import { aristaFont } from '@/app/Hydrate';
import { Button } from '@/components/ui/button';
import { CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import Image from 'next/image';
import { useState } from 'react';
import { customText, preview, previewWrapper, texts } from '../configs';
import { OfficialRatingPreviewBadge } from './constants';

type Props = {
  setText: (text: string) => void;
  text: string;
  selectedItem: PosterType | null;
  getHighResImageUrl: () => string;
  handleShare: (desc: string, overview: boolean) => void;
};

export default function Preview(props: Readonly<Props>) {
  const { setText, text, selectedItem, getHighResImageUrl, handleShare } = props;
  const [templateError, setTemplateError] = useState(false);

  return (
    <>
      <CardHeader className="p-0 pb-4">
        <CardTitle>Social Post Preview</CardTitle>
        <CardDescription>Your generated social post will appear here</CardDescription>

        <Select onValueChange={setText} value={text}>
          <SelectTrigger>
            <SelectValue placeholder="Select a text" />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectLabel>Text</SelectLabel>
              {texts.map((item) => (
                <SelectItem key={item.value} value={item.value}>
                  {item.text}
                </SelectItem>
              ))}
            </SelectGroup>
          </SelectContent>
        </Select>
      </CardHeader>

      {/* Preview container */}
      <div className={`relative w-full max-w-xs mx-auto ${previewWrapper.aspectRatio}`}>
        {selectedItem ? (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="relative w-full h-full">
              {/* Poster image */}
              <div
                className={`${preview.width} ${preview.height} mt-7 mx-auto ${preview.scale} relative`}
              >
                <Image
                  src={getHighResImageUrl()}
                  alt={selectedItem.Name}
                  fill
                  className="object-cover rounded-lg"
                  unoptimized
                />
              </div>

              {/* Template overlay or fallback */}
              {templateError ? (
                <div className="absolute inset-0 flex items-center justify-center bg-red-500/70 text-white font-bold text-center rounded-lg">
                  Template not found
                </div>
              ) : (
                <Image
                  src="/social-post-template.png"
                  alt="Social post template"
                  fill
                  className="object-cover rounded-lg"
                  unoptimized
                  onError={() => setTemplateError(true)}
                />
              )}
            </div>
          </div>
        ) : (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-full h-full bg-gray-200 rounded-lg flex items-center justify-center">
              <p className="text-muted-foreground text-sm text-center px-2">
                Select an item to preview
              </p>
            </div>
          </div>
        )}

        {/* Text overlay */}
        {customText.hasCustomText && (
          <div className="absolute inset-0 pointer-events-none flex justify-center">
            <h1
              className={`${aristaFont.className} ${customText.color} ${customText.fontSize} drop-shadow-lg ${customText.position.mt} absolute top-[2%] ${customText.align}`}
            >
              {text}
            </h1>
          </div>
        )}

        {selectedItem?.OfficialRating && (
          <div style={OfficialRatingPreviewBadge}>{selectedItem.OfficialRating}</div>
        )}
      </div>

      {/* <Button
        onClick={() => handleShare(text, false)}
        disabled={!selectedItem}
        className="mt-4 w-full"
      >
        Share without Overview
      </Button> */}
      <Button
        onClick={() => handleShare(text, true)}
        disabled={!selectedItem}
        className="mt-4 w-full"
      >
        Share
      </Button>
    </>
  );
}
