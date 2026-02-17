import { NotificationAPIClientSDK } from '../lib/client';
import { api } from '../lib/api';
import { PostUserRequest } from '../lib/interfaces';

// Mock the fetch function
global.fetch = jest.fn();

describe('NotificationAPIClientSDK', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('init method should set config correctly', () => {
    const sdk = NotificationAPIClientSDK.init({
      userId: 'testUser',
      clientId: 'testClient',
      hashedUserId: 'hashedTestUser'
    });

    expect(sdk.config.userId).toBe('testUser');
    expect(sdk.config.clientId).toBe('testClient');
    expect(sdk.config.hashedUserId).toBe('hashedTestUser');
    expect(sdk.config.host).toBe('api.notificationapi.com');
  });

  test('getInAppNotifications should call api with correct parameters', async () => {
    const mockResponse = {
      json: jest.fn().mockResolvedValue({ notifications: [] })
    };
    (global.fetch as jest.Mock).mockResolvedValue(mockResponse);

    const sdk = NotificationAPIClientSDK.init({
      userId: 'testUser',
      clientId: 'testClient'
    });

    await sdk.getInAppNotifications({ before: '2023-01-01T00:00:00Z' });

    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining(
        'notifications/INAPP_WEB?count=100&before=2023-01-01T00:00:00Z'
      ),
      expect.any(Object)
    );
  });
  test('getInAppNotifications should correctly reduce oldestReceived', async () => {
    const mockResponse = {
      json: jest.fn().mockResolvedValue({
        notifications: [
          { id: '1', date: '2023-01-02T00:00:00Z' },
          { id: '2', date: '2023-01-01T00:00:00Z' },
          { id: '3', date: '2023-01-03T00:00:00Z' }
        ]
      })
    };
    (global.fetch as jest.Mock).mockResolvedValue(mockResponse);

    const sdk = NotificationAPIClientSDK.init({
      userId: 'testUser',
      clientId: 'testClient'
    });

    const result = await sdk.getInAppNotifications({
      before: '2023-01-04T00:00:00Z'
    });

    expect(result.oldestReceived).toBe('2023-01-01T00:00:00Z');
  });
  test('updateInAppNotifications should set archived to null when archived is false', async () => {
    const mockResponse = {
      json: jest.fn().mockResolvedValue({})
    };
    (global.fetch as jest.Mock).mockResolvedValue(mockResponse);

    const sdk = NotificationAPIClientSDK.init({
      userId: 'testUser',
      clientId: 'testClient'
    });

    await sdk.updateInAppNotifications({
      ids: ['notification1', 'notification2'],
      archived: false
    });

    expect(global.fetch).toHaveBeenCalledWith(
      'https://api.notificationapi.com/testClient/users/testUser/notifications/INAPP_WEB',
      expect.objectContaining({
        method: 'PATCH',
        body: JSON.stringify({
          trackingIds: ['notification1', 'notification2'],
          archived: null
        }),
        headers: {
          Authorization: expect.any(String)
        }
      })
    );
  });
  test('updateInAppNotifications should set clicked to null when clicked is false', async () => {
    const mockResponse = {
      json: jest.fn().mockResolvedValue({})
    };
    (global.fetch as jest.Mock).mockResolvedValue(mockResponse);

    const sdk = NotificationAPIClientSDK.init({
      userId: 'testUser',
      clientId: 'testClient'
    });

    await sdk.updateInAppNotifications({
      ids: ['notification1', 'notification2'],
      clicked: false
    });

    expect(global.fetch).toHaveBeenCalledWith(
      'https://api.notificationapi.com/testClient/users/testUser/notifications/INAPP_WEB',
      expect.objectContaining({
        method: 'PATCH',
        body: JSON.stringify({
          trackingIds: ['notification1', 'notification2'],
          clicked: null
        }),
        headers: {
          Authorization: expect.any(String)
        }
      })
    );
  });
  test('updateInAppNotifications should set opened to current date when opened is true', async () => {
    const mockResponse = {
      json: jest.fn().mockResolvedValue({})
    };
    (global.fetch as jest.Mock).mockResolvedValue(mockResponse);

    const sdk = NotificationAPIClientSDK.init({
      userId: 'testUser',
      clientId: 'testClient'
    });

    await sdk.updateInAppNotifications({
      ids: ['notification1', 'notification2'],
      opened: true
    });

    expect(global.fetch).toHaveBeenCalledWith(
      'https://api.notificationapi.com/testClient/users/testUser/notifications/INAPP_WEB',
      expect.objectContaining({
        method: 'PATCH',
        body: expect.stringContaining('"opened":"'),
        headers: {
          Authorization: expect.any(String)
        }
      })
    );
  });
  test('updateInAppNotifications should set opened to null when opened is false', async () => {
    const mockResponse = {
      json: jest.fn().mockResolvedValue({})
    };
    (global.fetch as jest.Mock).mockResolvedValue(mockResponse);

    const sdk = NotificationAPIClientSDK.init({
      userId: 'testUser',
      clientId: 'testClient'
    });

    await sdk.updateInAppNotifications({
      ids: ['notification1', 'notification2'],
      opened: false
    });

    expect(global.fetch).toHaveBeenCalledWith(
      'https://api.notificationapi.com/testClient/users/testUser/notifications/INAPP_WEB',
      expect.objectContaining({
        method: 'PATCH',
        body: JSON.stringify({
          trackingIds: ['notification1', 'notification2'],
          opened: null
        }),
        headers: {
          Authorization: expect.any(String)
        }
      })
    );
  });
  test('updateInAppNotifications should call api with correct parameters', async () => {
    const mockResponse = {
      json: jest.fn().mockResolvedValue({})
    };
    (global.fetch as jest.Mock).mockResolvedValue(mockResponse);

    const sdk = NotificationAPIClientSDK.init({
      userId: 'testUser',
      clientId: 'testClient'
    });

    jest.useFakeTimers().setSystemTime(new Date('2024-07-26T17:37:54.333Z'));

    await sdk.updateInAppNotifications({
      ids: ['notification1', 'notification2'],
      archived: true,
      clicked: true
    });

    expect(global.fetch).toHaveBeenCalledWith(
      'https://api.notificationapi.com/testClient/users/testUser/notifications/INAPP_WEB',
      expect.objectContaining({
        method: 'PATCH',
        body: JSON.stringify({
          trackingIds: ['notification1', 'notification2'],
          archived: '2024-07-26T17:37:54.333Z',
          clicked: '2024-07-26T17:37:54.333Z'
        }),
        headers: {
          Authorization: expect.any(String)
        }
      })
    );

    jest.useRealTimers();
  });

  test('getPreferences should call api with correct parameters', async () => {
    const mockResponse = {
      json: jest.fn().mockResolvedValue({ preferences: [] })
    };
    (global.fetch as jest.Mock).mockResolvedValue(mockResponse);

    const sdk = NotificationAPIClientSDK.init({
      userId: 'testUser',
      clientId: 'testClient'
    });

    await sdk.getPreferences();

    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining('preferences'),
      expect.objectContaining({
        method: 'GET'
      })
    );
  });

  test('updateDeliveryOption should call api with correct parameters', async () => {
    const mockResponse = {
      json: jest.fn().mockResolvedValue({})
    };
    (global.fetch as jest.Mock).mockResolvedValue(mockResponse);

    const sdk = NotificationAPIClientSDK.init({
      userId: 'testUser',
      clientId: 'testClient'
    });

    await sdk.updateDeliveryOption({
      notificationId: 'testNotification',
      channel: 'EMAIL',
      delivery: 'instant'
    });

    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining('preferences'),
      expect.objectContaining({
        method: 'POST',
        body: JSON.stringify([
          {
            notificationId: 'testNotification',
            channel: 'EMAIL',
            delivery: 'instant'
          }
        ])
      })
    );
  });

  test('updateDeliveryOption should support SLACK channel', async () => {
    const mockResponse = {
      json: jest.fn().mockResolvedValue({})
    };
    (global.fetch as jest.Mock).mockResolvedValue(mockResponse);

    const sdk = NotificationAPIClientSDK.init({
      userId: 'testUser',
      clientId: 'testClient'
    });

    await sdk.updateDeliveryOption({
      notificationId: 'testSlackNotification',
      channel: 'SLACK',
      delivery: 'hourly'
    });

    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining('preferences'),
      expect.objectContaining({
        method: 'POST',
        body: JSON.stringify([
          {
            notificationId: 'testSlackNotification',
            channel: 'SLACK',
            delivery: 'hourly'
          }
        ])
      })
    );
  });

  test('identify should call api with correct parameters', async () => {
    const mockResponse = {
      json: jest.fn().mockResolvedValue({ preferences: [] })
    };
    (global.fetch as jest.Mock).mockResolvedValue(mockResponse);

    const sdk = NotificationAPIClientSDK.init({
      userId: 'testUser',
      clientId: 'testClient'
    });
    const params: PostUserRequest = {
      id: 'testUser',
      email: 'userTestEmail@notificationapi.com'
    };
    await sdk.identify(params);

    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining(
        'https://api.notificationapi.com/testClient/users/testUser/'
      ),
      expect.objectContaining({
        method: 'POST',
        body: JSON.stringify(params)
      })
    );
  });
  test('identify should not call api with wrong parameters', async () => {
    const mockResponse = {
      json: jest.fn().mockResolvedValue({ preferences: [] })
    };
    (global.fetch as jest.Mock).mockResolvedValue(mockResponse);

    const sdk = NotificationAPIClientSDK.init({
      userId: 'testUser',
      clientId: 'testClient'
    });
    const params: PostUserRequest = {
      id: 'testUser2',
      email: 'userTestEmail@notificationapi.com'
    };
    await expect(sdk.identify(params)).rejects.toThrow(
      'The id in the parameters does not match the initialized userId.'
    );
  });
  test('getUserAccountMetadata should call api with correct parameters', async () => {
    const mockResponse = {
      json: jest.fn().mockResolvedValue({ preferences: [] })
    };
    (global.fetch as jest.Mock).mockResolvedValue(mockResponse);

    const sdk = NotificationAPIClientSDK.init({
      userId: 'testUser',
      clientId: 'testClient'
    });
    await sdk.getUserAccountMetadata();

    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining(
        'https://api.notificationapi.com/testClient/users/testUser/account_metadata'
      ),
      expect.objectContaining({
        method: 'GET'
      })
    );
  });
  test('slack.getChannels should return hasMoreChannels and hasMoreUsers from API', async () => {
    const mockResponse = {
      json: jest.fn().mockResolvedValue({
        channels: [{ id: 'C123', name: 'general' }],
        users: [{ id: 'U123', name: 'alice' }],
        me: { id: 'U123', name: 'alice' },
        hasMoreChannels: true,
        hasMoreUsers: false
      })
    };
    (global.fetch as jest.Mock).mockResolvedValue(mockResponse);

    const sdk = NotificationAPIClientSDK.init({
      userId: 'testUser',
      clientId: 'testClient'
    });

    const result = await sdk.slack.getChannels();

    expect(result.hasMoreChannels).toBe(true);
    expect(result.hasMoreUsers).toBe(false);
  });
});

describe('api function', () => {
  test('should make a fetch call with correct parameters', async () => {
    const mockResponse = {
      json: jest.fn().mockResolvedValue({ data: 'testData' })
    };
    (global.fetch as jest.Mock).mockResolvedValue(mockResponse);

    const result = await api(
      'GET',
      'api.notificationapi.com',
      'testResource',
      'testClient',
      'testUser',
      'hashedTestUser'
    );

    expect(global.fetch).toHaveBeenCalledWith(
      'https://api.notificationapi.com/testClient/users/testUser/testResource',
      expect.objectContaining({
        method: 'GET',
        headers: {
          Authorization: expect.stringContaining('Basic')
        }
      })
    );

    expect(result).toEqual({ data: 'testData' });
  });

  test('should handle fetch errors', async () => {
    (global.fetch as jest.Mock).mockRejectedValueOnce('error');
    let result;
    try {
      await api(
        'GET',
        'api.notificationapi.com',
        'testResource',
        'testClient',
        'testUser'
      );
    } catch (e) {
      result = e;
    }

    expect(result).toEqual('error');
  });
  test('should return undefined if response is not JSON', async () => {
    const mockResponse = {
      json: jest.fn().mockRejectedValue(new Error('Invalid JSON'))
    };
    (global.fetch as jest.Mock).mockResolvedValue(mockResponse);

    const result = await api(
      'GET',
      'api.notificationapi.com',
      'testResource',
      'testClient',
      'testUser'
    );

    expect(result).toBeUndefined();
  });
});
