import { fetchApi } from '@/app/api/helpers';
import fs from 'fs';
import { NextRequest, NextResponse } from 'next/server';
import path from 'path';
import { response } from './types';

export async function PATCH(request: NextRequest) {
    const body = await request.json();
    const { userId } = body;

  const cardTemplatePath = path.join(process.cwd(), 'app/login-page/card.html');
  const loginPageHtmlPath = path.join(process.cwd(), 'app/login-page/login-page.html');
  const loginPageCssPath = path.join(process.cwd(), 'app/login-page/login-page.css');

  const cardTemplate = fs.readFileSync(cardTemplatePath, 'utf-8');
  const loginPageCss = fs.readFileSync(loginPageCssPath, 'utf-8');
  let loginPageHtml = fs.readFileSync(loginPageHtmlPath, 'utf-8');

  try {
    const getMovies = await fetchApi(
      `/Users/${userId}/Items?SortBy=PremiereDate%2CSortName%2CProductionYear&SortOrder=Descending&IncludeItemTypes=Movie&Recursive=true&Fields=PrimaryImageAspectRatio%2CMediaSourceCount&ImageTypeLimit=1&EnableImageTypes=Primary%2CBackdrop%2CBanner%2CThumb&StartIndex=0&ParentId=af92f2d68eea947c7f9df41836afb987&Limit=10`,
      request,
      { method: 'GET', requiresAuth: true }
    );

    const getShows = await fetchApi(
      `/Users/${userId}/Items?SortBy=PremiereDate%2CSortName&SortOrder=Descending&IncludeItemTypes=Series&Recursive=true&Fields=PrimaryImageAspectRatio&ImageTypeLimit=1&EnableImageTypes=Primary%2CBackdrop%2CBanner%2CThumb&StartIndex=0&Limit=10&ParentId=d565273fd114d77bdf349a2896867069`,
      request,
      { method: 'GET', requiresAuth: true }
    );

    const latestMovies: response = await getMovies.json();
    const latestShows: response = await getShows.json();

    let moviesHtml = '';
    let showsHtml = '';

    for (const movie of latestMovies.Items) {
      moviesHtml += cardTemplate
        .replace(/{{name}}/g, movie.Name)
        .replace(/{{premiereDate}}/g, movie.PremiereDate?.split('T')[0] ?? 'Unknown')
        .replace(/{{id}}/g, movie.Id)
        .replace(/{{poster}}/g, movie.ImageTags?.Primary ?? '');
    }

    for (const show of latestShows.Items) {
      showsHtml += cardTemplate
        .replace(/{{name}}/g, show.Name)
        .replace(/{{premiereDate}}/g, show.PremiereDate?.split('T')[0] ?? 'Unknown')
        .replace(/{{id}}/g, show.Id)
        .replace(/{{poster}}/g, show.ImageTags?.Primary ?? '');
    }
    
    loginPageHtml = loginPageHtml
      .replace(/{{movies}}/g, moviesHtml)
      .replace(/{{shows}}/g, showsHtml);

    const brandingPayload = {
      LoginDisclaimer: loginPageHtml.replace(/\r?\n/g, ''),
      CustomCss: loginPageCss.replace(/\r?\n/g, ''),
      SplashscreenEnabled: true
    };

    await fetchApi(`/System/Configuration/branding`, request, {
      method: 'POST',
      requiresAuth: true,
      body: JSON.stringify(brandingPayload)
    });

    return NextResponse.json({ latestMovies, latestShows }, { status: 200 });
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
