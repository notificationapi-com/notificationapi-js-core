import { API_REGION } from './interfaces';
import { Logger } from './logger';

export const api = async (
  method: 'GET' | 'POST' | 'PATCH' | 'DELETE',
  host: string | API_REGION,
  resource: string,
  clientId: string,
  userId: string,
  hashedUserId?: string,
  data?: any,
  logger?: Logger
): Promise<any> => {
  const token = generateBasicTokenForUser(clientId, userId, hashedUserId);
  const url = `https://${host}/${clientId}/users/${encodeURIComponent(
    userId
  )}/${resource}`;

  if (logger) {
    logger.log('HTTP Request:', {
      method,
      host,
      url,
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

    if (logger) {
      logger.log('HTTP Response:', res);
    }

    return await res.json();
  } catch (error) {
    const duration = Date.now() - startTime;

    if (logger) {
      logger.error('HTTP Request Failed:', {
        error,
        duration: `${duration}ms`
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
