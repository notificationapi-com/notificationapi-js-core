import { NotificationAPIClientSDK } from '../lib/client';

const client = NotificationAPIClientSDK.init({
  clientId: '24nojpnrsdc53fkslha0roov05',
  userId: 'sahand',
  debug: true,

  // for websocket:
  onNewInAppNotifications: (notifications) => {
    console.log('New notifications arrived:', notifications);
  }
});

// Get the last 1000 in-app notifications (through REST)
const res = await client.getInAppNotifications({
  before: new Date().toISOString(),
  maxCountNeeded: 1000
});
console.log(res.items);

// // set the first one to opened and archived
client.updateInAppNotifications({
  ids: [res.items[0].id],
  opened: true,
  archived: true
});

// // Open the websocket to keep receiving new incoming notifications:
// client.openWebSocket();

// await client.updateDeliveryOption({
//   channel: "INAPP_WEB",
//   delivery: "off",
//   notificationId: "20240530",
// });
// const prefs = await client.rest.getPreferences();
// console.log(prefs);
