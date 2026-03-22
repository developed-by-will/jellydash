'use client';

import { PosterType } from '@/app/api/types';
import Image from 'next/image';
import { useState } from 'react';
import { canvasStyle, customText, posterStyle, templateStyle, textStyle } from '../configs';
import { OfficialRatingHighResBadge } from './constants';

type Props = {
  text: string;
  selectedItem: PosterType | null;
  getHighResImageUrl: () => string;
  hiddenPreviewRef: React.RefObject<HTMLDivElement>;
};

export default function HighResPoster({
  text,
  selectedItem,
  getHighResImageUrl,
  hiddenPreviewRef
}: Readonly<Props>) {
  const [templateError, setTemplateError] = useState(false);

  if (!selectedItem) return null;

  return (
    <div
      ref={hiddenPreviewRef}
      style={{
        position: 'absolute',
        top: '-9999px',
        left: '-9999px',
        width: 1440,
        height: 2160
      }}
    >
      <div style={canvasStyle}>
        {/* Poster Image */}
        <Image
          src={getHighResImageUrl()}
          alt={selectedItem.Name}
          width={1440}
          height={2160}
          unoptimized
          crossOrigin="anonymous"
          style={posterStyle}
          priority
        />

        {/* Template Overlay */}
        {!templateError ? (
          <Image
            src="/social-post-template.png"
            alt="Social post template"
            width={1440}
            height={2160}
            unoptimized
            crossOrigin="anonymous"
            style={templateStyle}
            onError={() => setTemplateError(true)}
          />
        ) : (
          <div
            style={{
              ...templateStyle,
              backgroundColor: '#f44336',
              color: 'white',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '2rem',
              fontWeight: 'bold'
            }}
          >
            Template not found
          </div>
        )}

        {/* Text Overlay */}
        {customText.hasCustomText && <div style={textStyle}>{text}</div>}

        {selectedItem.OfficialRating && (
          <div style={OfficialRatingHighResBadge}>{selectedItem.OfficialRating}</div>
        )}
      </div>
    </div>
  );
}
