// ANDROID PUSH
// window.onNotification = function (e) {
//     console.log('EVENT -> RECEIVED: ' + e.event);
//
//     switch (e.event) {
//         case 'registered':
//           if (e.regid.length > 0) {
//                   // Your GCM push server needs to know the regID before it can push to this device
//                   // here is where you might want to send it the regID for later use.
//                 console.log('REGISTERED regID = ' + e.regid);
//
//                 console.log('---PLATFORM = ' + device.platform);
//                 console.log('---MODEL = ' + device.model);
//                 console.log('---uuid = ' + device.uuid);
//
//                 var newPushAccess = {};
//                 newPushAccess.clientId = e.regid;
//                 newPushAccess.platform = device.platform;
//                 newPushAccess.model = device.model;
//                 newPushAccess.uuid = device.uuid;
//
//                 NotificationsService.pushAccess(newPushAccess);
//               }
//
//           break;
//
//         case 'message':
//           if (e.foreground) {
//                 console.log('---INLINE NOTIFICATION = ');
//                 var soundfile = e.soundname || e.payload.sound;
//                 var my_media = new Media('/android_asset/www/' + soundfile);
//                 my_media.play();
//               }
//           else {
//                 if (e.coldstart) {
//                     console.log('---COLDSTART NOTIFICATION = ');
//                   }
//                 else {
//                     console.log('---BACKGROUND NOTIFICATION = ');
//                   }
//               }
//
//           console.log('MESSAGE -> MSG: ' + e.payload.message);
//           console.log('MESSAGE -> MSGCNT:  ' + e.payload.msgcnt);
//           console.log('MESSAGE -> TIME:  ' + e.payload.timeStamp);
//           break;
//
//         case 'error':
//           console.log('ERROR -> MSG:  ' + e.msg);
//           break;
//
//         default:
//           console.log('EVENT -> Unknown, an event was received and we do not know what it is ');
//           break;
//       }
//   };
// ////////////////     END: ANDROID PUSH        //////////////////////////////
