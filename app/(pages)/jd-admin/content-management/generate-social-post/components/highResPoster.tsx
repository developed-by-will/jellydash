import Image from 'next/image';

import { aristaFont } from '@/app/Hydrate';
import { PosterType } from '@/app/api/types';
import template from '@/public/social-post-template.png';
import { customText, output } from '../configs';

type Props = {
  text: string;
  selectedItem: PosterType | null;
  getHighResImageUrl: () => string;
  hiddenPreviewRef: React.RefObject<HTMLDivElement>;
};

export default function HighResPoster(props: Readonly<Props>) {
  const { text, selectedItem, getHighResImageUrl, hiddenPreviewRef } = props;

  return (
    <div
      ref={hiddenPreviewRef}
      className={`absolute top-[-9999px] left-[-9999px] w-[${output.template.width}] h-[${output.template.height}]`}
    >
      {selectedItem && (
        <div className="relative w-full h-full bg-black">
          <Image
            src={getHighResImageUrl()}
            alt={selectedItem.Name}
            width={output.poster.width}
            height={output.poster.height}
            style={{
              position: 'absolute',
              left: output.poster.position.left,
              top: output.poster.position.top,
              transform: output.poster.transform
            }}
            unoptimized
          />
          <Image
            src={template}
            alt="Social post template"
            width={output.output.width}
            height={output.output.height}
            style={{ position: 'absolute', top: 0, left: 0 }}
            unoptimized
          />
          {customText.hasCustomText && (
            <h1
              className={`absolute w-full shadow-2xl ${aristaFont.className} ${customText.color} text-[${customText.fontSize}] ${customText.position.mt} ${customText.position.ms} ${customText.position.me} ${customText.align}`}
            >
              {text}
            </h1>
          )}
        </div>
      )}
    </div>
  );
}
