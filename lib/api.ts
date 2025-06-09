import { API_REGION } from './interfaces';

export const api = async (
  method: 'GET' | 'POST' | 'PATCH' | 'DELETE',
  host: string | API_REGION,
  resource: string,
  clientId: string,
  userId: string,
  hashedUserId?: string,
  data?: any,
  debug = false
): Promise<any> => {
  const token = generateBasicTokenForUser(clientId, userId, hashedUserId);
  const url = `https://${host}/${clientId}/users/${encodeURIComponent(
    userId
  )}/${resource}`;

  if (debug) {
    console.log('[NotificationAPI js core Debug] HTTP Request:', {
      method,
      url,
      hasBody: !!data,
      body: data
    });
  }

  const startTime = Date.now();

  try {
    const res = await fetch(url, {
      method,
      body: JSON.stringify(data),
      headers: {
        Authorization: `Basic ${token}`
      }
    });

    const duration = Date.now() - startTime;

    if (debug) {
      console.log('[NotificationAPI js core Debug] HTTP Response:', {
        status: res.status,
        statusText: res.statusText,
        duration: `${duration}ms`,
        url
      });
    }

    try {
      const responseData = await res.json();

      if (debug) {
        console.log(
          '[NotificationAPI js core Debug] Response Data:',
          responseData
        );
      }

      return responseData;
    } catch (e) {
      if (debug) {
        console.log(
          '[NotificationAPI js core Debug] Failed to parse response as JSON:',
          e
        );
      }
      return undefined;
    }
  } catch (error) {
    const duration = Date.now() - startTime;

    if (debug) {
      console.log('[NotificationAPI js core Debug] HTTP Request Failed:', {
        error,
        duration: `${duration}ms`,
        url
      });
    }

    throw error;
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
