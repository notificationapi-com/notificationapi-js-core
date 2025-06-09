import { api } from './api';
import {
  API_REGION,
  BaseDeliveryOptions,
  Channels,
  DeliveryOptionsForEmail,
  DeliveryOptionsForInappWeb,
  PostUserRequest,
  UserAccountMetadata,
  WS_REGION
} from './interfaces';
import {
  GetPreferencesResponse,
  InAppNotification,
  WebSocket_NewNotification_Message
} from './interfaces';

type NotificationAPIClientSDKConfig = {
  userId: string;
  clientId: string;
  hashedUserId: string;
  host: string | API_REGION;

  // inapp notifications:
  getInAppDefaultCount: number;
  getInAppDefaultOldest: string;

  // Websocket:
  websocketHost: string | WS_REGION;
  keepWebSocketAliveForSeconds: number;
  onNewInAppNotifications?: (notifications: InAppNotification[]) => unknown;

  // Debug mode:
  debug: boolean;
};

// Debug logger utility
const debugLog = (config: NotificationAPIClientSDKConfig, ...args: any[]) => {
  if (config.debug) {
    console.log('[NotificationAPI js core Debug]', ...args);
  }
};

const defaultConfig: NotificationAPIClientSDKConfig = {
  host: 'api.notificationapi.com',
  websocketHost: 'ws.notificationapi.com',
  userId: '',
  clientId: '',
  hashedUserId: '',
  getInAppDefaultCount: 100,
  getInAppDefaultOldest: new Date(
    Date.now() - 30 * 24 * 60 * 60 * 1000
  ).toISOString(),
  onNewInAppNotifications: undefined,
  keepWebSocketAliveForSeconds: 24 * 60 * 60, // 24 hours
  debug: false
};

type NotificationAPIClientSDK = {
  config: NotificationAPIClientSDKConfig;
  init(
    config: Partial<NotificationAPIClientSDKConfig> & {
      userId: string;
      clientId: string;
    }
  ): NotificationAPIClientSDK;
  rest: {
    generic(
      method: 'GET' | 'POST' | 'PATCH' | 'DELETE',
      resource: string,
      data?: any
    ): Promise<any>;
    getNotifications(before: string, count: number): Promise<any>;
    patchNotifications(params: any): Promise<any>;
    getPreferences(): Promise<GetPreferencesResponse>;
    postPreferences(
      params: Array<{
        notificationId: string;
        subNotificationId?: string;
        channel: Channels;
        delivery:
          | DeliveryOptionsForEmail
          | DeliveryOptionsForInappWeb
          | BaseDeliveryOptions;
      }>
    ): Promise<any>;
    postUser(params: PostUserRequest): Promise<any>;
    getUserAccountMetadata(): Promise<{
      userAccountMetadata: UserAccountMetadata;
    }>;
  };
  websocket: {
    object: WebSocket | undefined;
    connect(callback?: (websocket: WebSocket) => unknown): WebSocket;
    disconnect(callback?: (websocket: WebSocket) => unknown): void;
  };
  openWebSocket(): WebSocket;
  getInAppNotifications(params: {
    before: string;
    maxCountNeeded?: number;
    oldestNeeded?: string;
  }): Promise<{
    items: InAppNotification[];
    hasMore: boolean;
    oldestReceived: string;
  }>;
  updateInAppNotifications(params: {
    ids: string[];
    archived?: boolean;
    clicked?: boolean;
    opened?: boolean;
  }): Promise<any>;
  updateDeliveryOption(params: {
    notificationId: string;
    subNotificationId?: string;
    channel: Channels;
    delivery:
      | DeliveryOptionsForEmail
      | DeliveryOptionsForInappWeb
      | BaseDeliveryOptions;
  }): Promise<void>;
  getPreferences(): Promise<GetPreferencesResponse>;
  identify(params: PostUserRequest): Promise<void>;
  getUserAccountMetadata(): Promise<{
    userAccountMetadata: UserAccountMetadata;
  }>;
};

export const NotificationAPIClientSDK: NotificationAPIClientSDK = {
  config: defaultConfig,
  init: function (config) {
    this.config = { ...defaultConfig, ...config };
    debugLog(
      this.config,
      'NotificationAPI js core SDK initialized with config:',
      {
        userId: this.config.userId,
        clientId: this.config.clientId,
        host: this.config.host,
        websocketHost: this.config.websocketHost,
        debug: this.config.debug,
        hasHashedUserId: !!this.config.hashedUserId
      }
    );
    return {
      ...this
    };
  },
  rest: {
    generic: function (method, resource, data) {
      debugLog(
        NotificationAPIClientSDK.config,
        `API Call: ${method} ${resource}`,
        data ? { body: data } : ''
      );
      return api(
        method,
        NotificationAPIClientSDK.config.host,
        resource,
        NotificationAPIClientSDK.config.clientId,
        NotificationAPIClientSDK.config.userId,
        NotificationAPIClientSDK.config.hashedUserId,
        data,
        NotificationAPIClientSDK.config.debug
      );
    },

    // The functions below are nice wrappers over the generic
    // rest  api function above. They must follow REST API naming:
    // Method + Resource, representing the end-point.

    getNotifications: function (before, count) {
      return NotificationAPIClientSDK.rest.generic(
        'GET',
        `notifications/INAPP_WEB?count=${count}&before=${before}`
      );
    },
    patchNotifications: function (params) {
      return NotificationAPIClientSDK.rest.generic(
        'PATCH',
        'notifications/INAPP_WEB',
        params
      );
    },
    getPreferences: function () {
      return NotificationAPIClientSDK.rest.generic('GET', 'preferences');
    },
    postPreferences: function (params) {
      return NotificationAPIClientSDK.rest.generic(
        'POST',
        'preferences',
        params
      );
    },
    postUser: function (params: PostUserRequest) {
      return NotificationAPIClientSDK.rest.generic('POST', '', params);
    },
    getUserAccountMetadata: function () {
      return NotificationAPIClientSDK.rest.generic('GET', 'account_metadata');
    }
  },
  websocket: {
    object: undefined,
    connect: function () {
      let address = `wss://${NotificationAPIClientSDK.config.websocketHost}?userId=${encodeURIComponent(NotificationAPIClientSDK.config.userId)}&envId=${NotificationAPIClientSDK.config.clientId}`;
      if (NotificationAPIClientSDK.config.hashedUserId) {
        address += `&userIdHash=${encodeURIComponent(NotificationAPIClientSDK.config.hashedUserId)}`;
      }
      debugLog(
        NotificationAPIClientSDK.config,
        'WebSocket connecting to:',
        address
      );
      NotificationAPIClientSDK.websocket.object = new WebSocket(address);

      NotificationAPIClientSDK.websocket.object.onopen = () => {
        debugLog(
          NotificationAPIClientSDK.config,
          'WebSocket connection opened'
        );
      };

      NotificationAPIClientSDK.websocket.object.onclose = (event) => {
        debugLog(
          NotificationAPIClientSDK.config,
          'WebSocket connection closed:',
          {
            code: event.code,
            reason: event.reason,
            wasClean: event.wasClean
          }
        );
      };

      NotificationAPIClientSDK.websocket.object.onerror = (error) => {
        debugLog(NotificationAPIClientSDK.config, 'WebSocket error:', error);
      };

      NotificationAPIClientSDK.websocket.object.onmessage = (m) => {
        debugLog(
          NotificationAPIClientSDK.config,
          'WebSocket message received:',
          m.data
        );
        const body = JSON.parse(m.data);
        if (!body || !body.route) {
          return;
        }

        if (body.route === 'inapp_web/new_notifications') {
          const message = body as WebSocket_NewNotification_Message;
          debugLog(
            NotificationAPIClientSDK.config,
            'New notifications received:',
            message.payload.notifications
          );
          if (NotificationAPIClientSDK.config.onNewInAppNotifications) {
            NotificationAPIClientSDK.config.onNewInAppNotifications(
              message.payload.notifications
            );
          }
        }
      };
      return NotificationAPIClientSDK.websocket.object;
    },
    disconnect: function (callback) {
      if (NotificationAPIClientSDK.websocket.object) {
        debugLog(NotificationAPIClientSDK.config, 'WebSocket disconnecting');
        NotificationAPIClientSDK.websocket.object?.close();
        if (callback) {
          callback(NotificationAPIClientSDK.websocket.object);
        }
      }
    }
  },
  openWebSocket: function () {
    const websocket = NotificationAPIClientSDK.websocket.connect(() => {
      setTimeout(
        () => {
          this.websocket.disconnect(() => {
            this.websocket.connect();
          });
        },
        9 * 60 * 1000
      );
    });
    return websocket;
  },

  // These functions are developer friendly wrappers over the rest APIs
  // They may or may not do additional tasks.
  // e.g. identify simply maps to postUsers

  getInAppNotifications: async (params) => {
    debugLog(
      NotificationAPIClientSDK.config,
      'getInAppNotifications called with params:',
      params
    );

    const maxCountNeeded =
      params.maxCountNeeded ||
      NotificationAPIClientSDK.config.getInAppDefaultCount;
    const oldestNeeded =
      params.oldestNeeded ||
      NotificationAPIClientSDK.config.getInAppDefaultOldest;

    debugLog(NotificationAPIClientSDK.config, 'Fetching notifications with:', {
      maxCountNeeded,
      oldestNeeded,
      before: params.before
    });

    let result: InAppNotification[] = [];
    let oldestReceived = params.before;
    let hasMore = true;
    let shouldLoadMore = true;
    let fetchCount = 0;

    while (shouldLoadMore) {
      fetchCount++;
      debugLog(NotificationAPIClientSDK.config, `Fetch attempt ${fetchCount}`, {
        oldestReceived,
        resultCount: result.length
      });

      const res = await NotificationAPIClientSDK.rest.getNotifications(
        oldestReceived,
        maxCountNeeded
      );
      const notis: InAppNotification[] = res.notifications;
      const notisWithoutDuplicates = notis.filter(
        (n) => !result.find((nn) => nn.id === n.id)
      );

      debugLog(
        NotificationAPIClientSDK.config,
        `Received ${notis.length} notifications, ${notisWithoutDuplicates.length} unique`
      );

      oldestReceived = notisWithoutDuplicates.reduce(
        (min: string, n) => (min < n.date ? min : n.date),
        params.before
      );
      result = [...result, ...notisWithoutDuplicates];

      hasMore = notisWithoutDuplicates.length > 0;
      shouldLoadMore = true;

      if (
        !hasMore ||
        result.length >= maxCountNeeded ||
        oldestReceived < oldestNeeded
      ) {
        shouldLoadMore = false;
        debugLog(NotificationAPIClientSDK.config, 'Stopping fetch loop:', {
          hasMore,
          totalResults: result.length,
          maxCountNeeded,
          oldestReceived,
          oldestNeeded
        });
      }
    }

    debugLog(
      NotificationAPIClientSDK.config,
      'getInAppNotifications completed:',
      {
        totalItems: result.length,
        hasMore,
        oldestReceived
      }
    );

    return {
      items: result,
      hasMore,
      oldestReceived
    };
  },
  updateInAppNotifications: async (params) => {
    debugLog(
      NotificationAPIClientSDK.config,
      'updateInAppNotifications called with params:',
      params
    );

    const body: {
      [key: string]: any;
    } = {
      trackingIds: params.ids
    };

    if (params.archived === true) {
      body.archived = new Date().toISOString();
    } else if (params.archived === false) {
      body.archived = null;
    }
    if (params.clicked === true) {
      body.clicked = new Date().toISOString();
    } else if (params.clicked === false) {
      body.clicked = null;
    }
    if (params.opened === true) {
      body.opened = new Date().toISOString();
    } else if (params.opened === false) {
      body.opened = null;
    }

    debugLog(
      NotificationAPIClientSDK.config,
      'Updating notifications with body:',
      body
    );
    return NotificationAPIClientSDK.rest.patchNotifications(body);
  },
  getPreferences: async () => {
    return NotificationAPIClientSDK.rest.getPreferences();
  },
  updateDeliveryOption: async (params) => {
    return NotificationAPIClientSDK.rest.postPreferences([params]);
  },
  identify: async (params: PostUserRequest) => {
    if (params.id && params.id !== NotificationAPIClientSDK.config.userId) {
      throw new Error(
        'The id in the parameters does not match the initialized userId.'
      );
    }
    return NotificationAPIClientSDK.rest.postUser(params);
  },
  getUserAccountMetadata: async () => {
    return NotificationAPIClientSDK.rest.getUserAccountMetadata();
  }
};
