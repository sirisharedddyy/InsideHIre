import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase';

export const notifyUser = async (targetUid, actorUid, payload) => {
  // Don't send notifications to yourself
  if (!targetUid || !actorUid || targetUid === actorUid) return;
  
  try {
    const notifRef = collection(db, 'users', targetUid, 'notifications');
    await addDoc(notifRef, {
      ...payload,
      actorUid,
      isRead: false,
      createdAt: serverTimestamp()
    });
  } catch (err) {
    console.error('Error sending notification', err);
  }
};
