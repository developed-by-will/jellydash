'use client';

import { BASE_URL } from '@/app/api/constants';
import { PosterType } from '@/app/api/types';
import html2canvas from 'html2canvas';
import { useRef, useState } from 'react';

export default function useSocialPost() {
  const [selectedItem, setSelectedItem] = useState<PosterType | null>(null);
  const hiddenPreviewRef = useRef<HTMLDivElement>(null);

  const handleItemClick = (item: PosterType) => setSelectedItem(item);

  const getHighResImageUrl = () =>
    `${BASE_URL}/${selectedItem?.Src}?fillHeight=1775&fillWidth=1183&quality=96`;

  const handleDownload = async () => {
    if (!hiddenPreviewRef.current || !selectedItem) return;

    const canvas = await html2canvas(hiddenPreviewRef.current, {
      scale: 1,
      useCORS: true,
      allowTaint: true
    });

    const dataUrl = canvas.toDataURL('image/png');
    const link = document.createElement('a');
    link.href = dataUrl;
    link.download = `${selectedItem.Name}.png`;
    link.click();
  };

  return {
    selectedItem,
    setSelectedItem,
    hiddenPreviewRef,
    handleItemClick,
    getHighResImageUrl,
    handleDownload
  };
}
