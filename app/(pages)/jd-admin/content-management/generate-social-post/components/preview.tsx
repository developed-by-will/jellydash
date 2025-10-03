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
import template from '@/public/social-post-template.png';
import Image from 'next/image';
import { customText, preview, previewWrapper, texts } from '../configs';

type Props = {
  setText: (text: string) => void;
  text: string;
  selectedItem: PosterType | null;
  getHighResImageUrl: () => string;
  handleDownload: () => void;
};

export default function Preview(props: Readonly<Props>) {
  const { setText, text, selectedItem, getHighResImageUrl, handleDownload } = props;

  return (
    <>
      <CardHeader className="p-0 pb-4">
        <CardTitle>Social Post Preview</CardTitle>
        <CardDescription>Your generated social post will appear here</CardDescription>

        <Select onValueChange={setText} value={text}>
          <SelectTrigger>
            <SelectValue placeholder="Selecione um texto" />
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

      <div className={`relative w-full max-w-xs mx-auto aspect-[${previewWrapper.aspectRatio}]`}>
        {selectedItem ? (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="relative w-full h-full">
              {/* Poster scaled down */}
              <div
                className={`w-[${preview.width}] h-[${preview.height}] mt-7 mx-auto scale-${preview.scale} relative`}
              >
                <Image
                  src={getHighResImageUrl()}
                  alt={selectedItem.Name}
                  fill
                  className="object-cover rounded-lg"
                  unoptimized
                />
              </div>

              {/* Template overlay */}
              <Image
                src={template}
                alt="Social post template"
                fill
                className="object-cover rounded-lg"
                unoptimized
              />
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
              className={`${aristaFont.className} text-white ${customText.fontSize} drop-shadow-lg ${customText.position.mt} absolute top-[2%]`}
            >
              {text}
            </h1>
          </div>
        )}
      </div>

      <Button onClick={handleDownload} disabled={!selectedItem} className="mt-4 w-full">
        Download Image
      </Button>
    </>
  );
}
