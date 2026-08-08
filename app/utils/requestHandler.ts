const responseHandler = async <TResponse>(response: Response): Promise<TResponse> => {
  const data = await response.json();

  if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);

  return data as TResponse;
};

export async function ANONYMOUS_POST<TPayload, TResponse>(
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

  return responseHandler(response);
}

export async function AUTENTICATED_POST<TPayload, TResponse>(
  url: string,
  payload: TPayload,
  token: string
): Promise<TResponse> {
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-access-token': token
    },
    body: JSON.stringify(payload)
  });

  return responseHandler(response);
}

export async function DELETE<TPayload, TResponse>(
  url: string,
  payload: TPayload,
  token: string
): Promise<TResponse> {
  const response = await fetch(url, {
    method: 'DELETE',
    headers: {
      'x-access-token': token
    },
    body: JSON.stringify(payload)
  });

  return responseHandler(response);
}
