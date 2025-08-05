import { fetchApi } from '@/app/api/helpers';
import fs from 'fs';
import { NextRequest, NextResponse } from 'next/server';
import path from 'path';
import { response } from './types';

export async function PATCH(request: NextRequest) {
  const body = await request.json();
  const { userId } = body;

  const paths = {
    premiumCard: path.join(process.cwd(), 'app/login-page/premium-card.html'),
    openSourceCard: path.join(process.cwd(), 'app/login-page/open-source-card.html'),
    loginPage: path.join(process.cwd(), 'app/login-page/login-page.html'),
    loginCss: path.join(process.cwd(), 'app/login-page/login-page.css'),
    priceTable: path.join(process.cwd(), 'app/login-page/price-table.html')
  };

  // Determine which card template to use
  const cardTemplatePath = fs.existsSync(paths.premiumCard)
    ? paths.premiumCard
    : paths.openSourceCard;

  const cardTemplate = fs.readFileSync(cardTemplatePath, 'utf-8');
  const loginPageCss = fs.readFileSync(paths.loginCss, 'utf-8');
  let loginPageHtml = fs.readFileSync(paths.loginPage, 'utf-8');

  try {
    const [moviesRes, showsRes] = await Promise.all([
      fetchApi(
        `/Users/${userId}/Items?SortBy=PremiereDate%2CSortName%2CProductionYear&SortOrder=Descending&IncludeItemTypes=Movie&Recursive=true&Fields=PrimaryImageAspectRatio%2CMediaSourceCount&ImageTypeLimit=1&EnableImageTypes=Primary%2CBackdrop%2CBanner%2CThumb&StartIndex=0&ParentId=af92f2d68eea947c7f9df41836afb987&Limit=10`,
        request,
        { method: 'GET', requiresAuth: true }
      ),
      fetchApi(
        `/Users/${userId}/Items?SortBy=PremiereDate%2CSortName&SortOrder=Descending&IncludeItemTypes=Series&Recursive=true&Fields=PrimaryImageAspectRatio&ImageTypeLimit=1&EnableImageTypes=Primary%2CBackdrop%2CBanner%2CThumb&StartIndex=0&Limit=10&ParentId=d565273fd114d77bdf349a2896867069`,
        request,
        { method: 'GET', requiresAuth: true }
      )
    ]);

    const latestMovies: response = await moviesRes.json();
    const latestShows: response = await showsRes.json();

    const generateCards = (items: any[]) =>
      items
        .map((item) =>
          cardTemplate
            .replace(/{{name}}/g, item.Name)
            .replace(/{{premiereDate}}/g, item.PremiereDate?.split('T')[0] ?? 'Unknown')
            .replace(/{{id}}/g, item.Id)
            .replace(/{{poster}}/g, item.ImageTags?.Primary ?? '')
        )
        .join('');

    const moviesHtml = generateCards(latestMovies.Items);
    const showsHtml = generateCards(latestShows.Items);

    // Add price table if it exists
    if (fs.existsSync(paths.priceTable)) {
      const priceTable = fs.readFileSync(paths.priceTable, 'utf-8');
      loginPageHtml += priceTable;
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
