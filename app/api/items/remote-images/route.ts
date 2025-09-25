import { catchError, fetchApi } from '@/app/api/helpers';
import { RemoteImagesType } from '@/app/api/types';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const itemId = request.nextUrl.searchParams.get('itemId');

    if (!itemId) {
      return NextResponse.json({ message: 'Item ID is required' }, { status: 400 });
    }

    const endpoint = `/Items/${itemId}/RemoteImages?type=Primary&startIndex=0&limit=30&IncludeAllLanguages=false`;

    // Get remote images of the content
    const getRemoteImages = await fetchApi(endpoint, request, {
      method: 'GET',
      requiresAuth: true
    });

    const remoteImages: RemoteImagesType = await getRemoteImages.json();

    // Get only Url, Height and Width with forEach
    const images = remoteImages.Images.map((image) => ({
      Url: image.Url,
      Height: image.Height,
      Width: image.Width
    }));

    return NextResponse.json(images, { status: 200 });
  } catch (error) {
    catchError(error);
  }
}
