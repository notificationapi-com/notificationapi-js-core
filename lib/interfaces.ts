export interface InAppNotification {
  id: string;
  notificationId: string;
  subNotificationId?: string;
  seen: boolean;
  title: string;
  redirectURL?: string;
  imageURL?: string;
  date: string;
  deliveryOptions?: {
    defaultDeliveryOption: DeliveryOptionsForInappWeb;
    off?: { enabled: boolean };
    instant?: {
      enabled: boolean;
      batching?: boolean;
      batchingKey?: string;
      batchingWindow?: number;
    };
  };
  template?: {
    instant: {
      title: string;
      redirectURL: string;
      imageURL: string;
    };
    batch: {
      title: string;
      redirectURL: string;
      imageURL: string;
    };
  };
  parameters?: Record<string, unknown>;
  expDate?: number;
  opened?: string;
  clicked?: string;
  archived?: string;
  actioned1?: string;
  actioned2?: string;
  replies?: {
    date: string;
    message: string;
  }[];
}

export interface WebSocket_NewNotification_Message {
  route: 'inapp_web/new_notifications';
  payload: {
    notifications: InAppNotification[];
  };
}

export type Channels =
  | 'EMAIL'
  | 'INAPP_WEB'
  | 'SMS'
  | 'CALL'
  | 'PUSH'
  | 'WEB_PUSH';

export type BaseDeliveryOptions = 'off' | 'instant';

export type DeliveryOptionsForInappWeb = 'off' | 'instant';

export type DeliveryOptionsForEmail =
  | 'off'
  | 'instant'
  | 'hourly'
  | 'daily'
  | 'weekly'
  | 'monthly';

export interface GetPreferencesResponse {
  preferences: {
    notificationId: string;
    channel: Channels;
    delivery:
      | DeliveryOptionsForEmail
      | DeliveryOptionsForInappWeb
      | BaseDeliveryOptions;
    subNotificationId?: string;
  }[];
  notifications: {
    notificationId: string;
    title: string;
    channels: Channels[];
    options: NotificationConfig['options'];
  }[];
  subNotifications: {
    notificationId: string;
    subNotificationId: string;
    title: string;
  }[];
}

export interface NotificationConfig {
  envId: string;
  notificationId: string;
  title: string;
  channels: Channels[];
  enabled: boolean;
  deduplication?: {
    duration: number; // seconds
  };
  throttling?: {
    max: number;
    period: number;
    unit: 'seconds' | 'minutes' | 'hours' | 'days' | 'months' | 'years';
    forever: boolean;
    scope: ['userId', 'notificationId'];
  };
  retention?: number;
  options?: {
    EMAIL: EmailDeliveryOptions;
    SMS: SMSDeliveryOptions;
    CALL: CALLDeliveryOptions;
    PUSH: PUSHDeliveryOptions;
    WEB_PUSH: WEB_PUSHDeliveryOptions;
    INAPP_WEB: InAppWebDeliveryOptions;
  };
}

export interface EmailDeliveryOptions {
  defaultDeliveryOption: DeliveryOptionsForEmail;
  off?: { enabled: boolean };
  instant?: { enabled: boolean };
  hourly?: { enabled: boolean };
  daily?: {
    enabled: boolean;
    hour?: string;
  };
  weekly?: {
    enabled: boolean;
    hour?: string;
    day?: string;
  };
  monthly?: {
    enabled: boolean;
    hour?: string;
    date?: 'first' | 'last';
  };
}

type SMSDeliveryOptions = EmailDeliveryOptions;
type CALLDeliveryOptions = EmailDeliveryOptions;
type PUSHDeliveryOptions = EmailDeliveryOptions;
type WEB_PUSHDeliveryOptions = EmailDeliveryOptions;

export interface InAppWebDeliveryOptions {
  defaultDeliveryOption: DeliveryOptionsForInappWeb;
  off?: { enabled: boolean };
  instant?: {
    enabled: boolean;
    batching?: boolean;
    batchingKey?: string;
    batchingWindow?: number;
  };
}

export interface User {
  id: string;
  email?: string;
  number?: string;
  pushTokens?: PushToken[];
  webPushTokens?: WebPushToken[];
  lastSeenTime?: string;
  createdAt?: string;
  updatedAt?: string;
}

export type PostUserRequest = Omit<
  Partial<User>,
  'lastSeenTime' | 'createdAt' | 'updatedAt'
>;

export interface PushToken {
  type: PushProviders;
  token: string;
  device: Device;
}

export enum PushProviders {
  FCM = 'FCM',
  APN = 'APN'
}

export interface Device {
  app_id?: string;
  ad_id?: string;
  device_id: string;
  platform?: string;
  manufacturer?: string;
  model?: string;
}

export interface PushSubscription {
  endpoint: string;
  keys: {
    p256dh: string;
    auth: string;
  };
}

export interface WebPushToken {
  sub: PushSubscription;
}
export interface UserAccountMetadata {
  logo: string;
  environmentVapidPublicKey: string;
  hasWebPushEnabled: boolean;
}
