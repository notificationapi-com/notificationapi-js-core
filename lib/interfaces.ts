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
export enum API_REGION {
  US = 'api.notificationapi.com',
  EU = 'api.eu.notificationapi.com',
  CA = 'api.ca.notificationapi.com'
}

export enum WS_REGION {
  US = 'ws.notificationapi.com',
  EU = 'ws.eu.notificationapi.com',
  CA = 'ws.ca.notificationapi.com'
}
export type Channels =
  | 'EMAIL'
  | 'INAPP_WEB'
  | 'SMS'
  | 'CALL'
  | 'PUSH'
  | 'WEB_PUSH'
  | 'SLACK';

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
    SLACK: SlackDeliveryOptions;
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
type SlackDeliveryOptions = EmailDeliveryOptions;

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
  slackChannel?: string;
  slackToken?: OauthV2AccessResponse;
}

interface WebAPICallResult {
  ok: boolean;
  error?: string;
  response_metadata?: {
    warnings?: string[];
    next_cursor?: string;
    scopes?: string[];
    acceptedScopes?: string[];
    retryAfter?: number;
    messages?: string[];
  };
}

interface AuthedUser {
  access_token?: string;
  expires_in?: number;
  id?: string;
  refresh_token?: string;
  scope?: string;
  token_type?: string;
}

interface Enterprise {
  id?: string;
  name?: string;
}

export interface IncomingWebhook {
  channel?: string;
  channel_id?: string;
  configuration_url?: string;
  url?: string;
}

type OauthV2AccessResponse = WebAPICallResult & {
  access_token?: string;
  app_id?: string;
  authed_user?: AuthedUser;
  bot_user_id?: string;
  enterprise?: Enterprise;
  error?: string;
  expires_in?: number;
  incoming_webhook?: IncomingWebhook;
  is_enterprise_install?: boolean;
  needed?: string;
  ok?: boolean;
  provided?: string;
  refresh_token?: string;
  scope?: string;
  team?: Enterprise;
  token_type?: string;
  warning?: string;
};

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

/* Slack Types Start */
export interface SlackChannel {
  context_team_id?: string;
  conversation_host_id?: string;
  created?: number;
  creator?: string;
  id?: string;
  internal_team_ids?: string[];
  is_archived?: boolean;
  is_channel?: boolean;
  is_ext_shared?: boolean;
  is_general?: boolean;
  is_global_shared?: boolean;
  is_group?: boolean;
  is_im?: boolean;
  is_member?: boolean;
  is_moved?: number;
  is_mpim?: boolean;
  is_org_default?: boolean;
  is_org_mandatory?: boolean;
  is_org_shared?: boolean;
  is_pending_ext_shared?: boolean;
  is_private?: boolean;
  is_shared?: boolean;
  is_user_deleted?: boolean;
  name?: string;
  name_normalized?: string;
  num_members?: number;
  pending_connected_team_ids?: string[];
  pending_shared?: string[];
  previous_names?: string[];
  priority?: number;
  properties?: unknown;
  purpose?: unknown;
  shared_team_ids?: string[];
  topic?: unknown;
  unlinked?: number;
  updated?: number;
  user?: string;
}

export interface SlackUser {
  color?: string;
  deleted?: boolean;
  enterprise_user?: unknown;
  has_2fa?: boolean;
  id?: string;
  is_admin?: boolean;
  is_app_user?: boolean;
  is_bot?: boolean;
  is_connector_bot?: boolean;
  is_email_confirmed?: boolean;
  is_invited_user?: boolean;
  is_owner?: boolean;
  is_primary_owner?: boolean;
  is_restricted?: boolean;
  is_ultra_restricted?: boolean;
  is_workflow_bot?: boolean;
  locale?: string;
  name?: string;
  profile?: unknown;
  real_name?: string;
  team_id?: string;
  two_factor_type?: string;
  tz?: string;
  tz_label?: string;
  tz_offset?: number;
  updated?: number;
  who_can_share_contact_card?: string;
}
