'use client';

import { BASE_URL } from '@/app/api/constants';
import { PosterType } from '@/app/api/types';
import html2canvas from 'html2canvas';
import { useRef, useState } from 'react';

export default function useSocialPost() {
  const [selectedItem, setSelectedItem] = useState<PosterType | null>(null);
  const hiddenPreviewRef = useRef<HTMLDivElement>(null);

  const handleItemClick = (item: PosterType) => {
    setSelectedItem(item);

    // Scroll to preview on mobile after item selection
    const isMobile = window.innerWidth < 1024; // LG breakpoint
    if (isMobile) {
      setTimeout(() => {
        const previewElement = document.getElementById('preview');
        if (previewElement) {
          previewElement.scrollIntoView({
            behavior: 'smooth',
            block: 'start'
          });
        }
      }, 100);
    }
  };

  const getHighResImageUrl = () =>
    `${BASE_URL}/${selectedItem?.Src}?fillHeight=1775&fillWidth=1183&quality=96`;

  const handleCopyTitle = async (desc: string, overview: boolean) => {
    if (!selectedItem) return;

    try {
      await navigator.clipboard.writeText(
        `${selectedItem.Name} [${desc}]${overview ? `\n\n${selectedItem.Overview}` : ''}`
      );
    } catch (error) {
      console.error('Error copying title:', error);
    }
  };

  const handleShare = async (desc: string, overview: boolean) => {
    if (!hiddenPreviewRef.current || !selectedItem) return;

    handleCopyTitle(desc, overview);

    const canvas = await html2canvas(hiddenPreviewRef.current, {
      scale: 2,
      useCORS: true,
      backgroundColor: '#000'
    });

    const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, 'image/png'));

    if (!blob) return;

    const file = new File([blob], `${selectedItem.Name}.png`, {
      type: 'image/png'
    });

    if (navigator.share && navigator.canShare({ files: [file] })) {
      await navigator.share({
        files: [file],
        title: selectedItem.Name
      });
    }
  };

  return {
    selectedItem,
    setSelectedItem,
    hiddenPreviewRef,
    handleItemClick,
    getHighResImageUrl,
    handleCopyTitle,
    handleShare
  };
}
