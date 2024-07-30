export const api = async (
  method: 'GET' | 'POST' | 'PATCH' | 'DELETE',
  host: string,
  resource: string,
  clientId: string,
  userId: string,
  hashedUserId?: string,
  data?: any
): Promise<any> => {
  const token = generateBasicTokenForUser(clientId, userId, hashedUserId);
  const res = await fetch(
    `https://${host}/${clientId}/users/${encodeURIComponent(
      userId
    )}/${resource}`,
    {
      method,
      body: JSON.stringify(data),
      headers: {
        Authorization: `Basic ${token}`
      }
    }
  );

  try {
    const responseData = await res.json();
    return responseData;
  } catch (e) {
    return undefined;
  }
};

export const generateBasicTokenForUser = (
  clientId: string,
  userId: string,
  hashedUserId?: string
) => {
  const token = hashedUserId
    ? btoa(clientId + ':' + userId + ':' + hashedUserId)
    : btoa(clientId + ':' + userId);

  return token;
};
