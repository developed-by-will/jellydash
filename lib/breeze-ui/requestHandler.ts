export async function POST<TPayload, TResponse>(
  url: string,
  payload: TPayload
): Promise<TResponse> {
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(payload)
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data?.Message || `HTTP error! Status: ${response.status}`);
  }

  return data as TResponse;
}
