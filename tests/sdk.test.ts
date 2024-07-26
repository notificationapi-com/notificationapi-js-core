import { NotificationAPIClientSDK } from '../lib/client';
import { api } from '../lib/api';

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
      hashedUserId: 'hashedTestUser',
    });

    expect(sdk.config.userId).toBe('testUser');
    expect(sdk.config.clientId).toBe('testClient');
    expect(sdk.config.hashedUserId).toBe('hashedTestUser');
    expect(sdk.config.host).toBe('api.notificationapi.com');
  });

  test('getInAppNotifications should call api with correct parameters', async () => {
    const mockResponse = {
      json: jest.fn().mockResolvedValue({ notifications: [] }),
    };
    (global.fetch as jest.Mock).mockResolvedValue(mockResponse);

    const sdk = NotificationAPIClientSDK.init({
      userId: 'testUser',
      clientId: 'testClient',
    });

    await sdk.getInAppNotifications({ before: '2023-01-01T00:00:00Z' });

    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining('notifications/INAPP_WEB?count=100&before=2023-01-01T00:00:00Z'),
      expect.any(Object)
    );
  });

  test('updateInAppNotifications should call api with correct parameters', async () => {
    const mockResponse = {
      json: jest.fn().mockResolvedValue({}),
    };
    (global.fetch as jest.Mock).mockResolvedValue(mockResponse);

    const sdk = NotificationAPIClientSDK.init({
      userId: 'testUser',
      clientId: 'testClient',
    });

    jest.useFakeTimers().setSystemTime(new Date('2024-07-26T17:37:54.333Z'));

    await sdk.updateInAppNotifications({
      ids: ['notification1', 'notification2'],
      archived: true,
      clicked: true,
    });

    expect(global.fetch).toHaveBeenCalledWith(
      'https://api.notificationapi.com/testClient/users/testUser/notifications/INAPP_WEB',
      expect.objectContaining({
        method: 'PATCH',
        body: JSON.stringify({
          trackingIds: ['notification1', 'notification2'],
          archived: '2024-07-26T17:37:54.333Z',
          clicked: '2024-07-26T17:37:54.333Z',
        }),
        headers: {
          Authorization: expect.any(String),
        },
      })
    );

    jest.useRealTimers();
  });

  test('getPreferences should call api with correct parameters', async () => {
    const mockResponse = {
      json: jest.fn().mockResolvedValue({ preferences: [] }),
    };
    (global.fetch as jest.Mock).mockResolvedValue(mockResponse);

    const sdk = NotificationAPIClientSDK.init({
      userId: 'testUser',
      clientId: 'testClient',
    });

    await sdk.getPreferences();

    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining('preferences'),
      expect.objectContaining({
        method: 'GET',
      })
    );
  });

  test('updateDeliveryOption should call api with correct parameters', async () => {
    const mockResponse = {
      json: jest.fn().mockResolvedValue({}),
    };
    (global.fetch as jest.Mock).mockResolvedValue(mockResponse);

    const sdk = NotificationAPIClientSDK.init({
      userId: 'testUser',
      clientId: 'testClient',
    });

    await sdk.updateDeliveryOption({
      notificationId: 'testNotification',
      channel: 'EMAIL',
      delivery: 'instant',
    });

    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining('preferences'),
      expect.objectContaining({
        method: 'POST',
        body: JSON.stringify([
          {
            notificationId: 'testNotification',
            channel: 'EMAIL',
            delivery: 'instant',
          },
        ]),
      })
    );
  });
});

describe('api function', () => {
  test('should make a fetch call with correct parameters', async () => {
    const mockResponse = {
      json: jest.fn().mockResolvedValue({ data: 'testData' }),
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
          Authorization: expect.stringContaining('Basic'),
        },
      })
    );

    expect(result).toEqual({ data: 'testData' });
  });

  test('should handle fetch errors', async () => {
    (global.fetch as jest.Mock).mockRejectedValueOnce('error');
let result
    try{ await api(
      'GET',
      'api.notificationapi.com',
      'testResource',
      'testClient',
      'testUser'
    );}
    catch(e){
      result=e
    }

    expect(result).toEqual('error');
  });
});