import { 
  collection, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  getDocs,
  doc, 
  query, 
  where, 
  onSnapshot,
  Unsubscribe
} from 'firebase/firestore';
import { db } from '../lib/firebase';
import { Subscription } from '../types';

const COLLECTION_NAME = 'subscriptions';

export function subscribeToUserSubscriptions(
  userId: string, 
  onData: (subs: Subscription[]) => void,
  onError?: (error: Error) => void
): Unsubscribe {
  if (!userId) {
    onData([]);
    return () => {};
  }

  const q = query(
    collection(db, COLLECTION_NAME),
    where('userId', '==', userId)
  );

  return onSnapshot(
    q,
    (snapshot) => {
      const subscriptions: Subscription[] = [];
      snapshot.forEach((docSnap) => {
        const data = docSnap.data();
        subscriptions.push({
          id: docSnap.id,
          userId: data.userId,
          name: data.name || '',
          price: Number(data.price) || 0,
          billingCycle: data.billingCycle || 'monthly',
          customMonths: data.customMonths ? Number(data.customMonths) : undefined,
          billingDate: data.billingDate || new Date().toISOString().split('T')[0],
          category: data.category || 'Eğlence',
          status: data.status || 'active',
          notes: data.notes || '',
          paidMonths: Array.isArray(data.paidMonths) ? data.paidMonths : [],
          createdAt: data.createdAt ? String(data.createdAt) : undefined,
          updatedAt: data.updatedAt ? String(data.updatedAt) : undefined
        });
      });
      onData(subscriptions);
    },
    (err) => {
      console.error('Error fetching subscriptions from Firestore:', err);
      if (onError) onError(err);
    }
  );
}

function cleanPayload(data: Record<string, any>): Record<string, any> {
  const clean: Record<string, any> = {};
  Object.keys(data).forEach((key) => {
    if (data[key] !== undefined) {
      clean[key] = data[key];
    }
  });
  return clean;
}

export async function addSubscription(sub: Omit<Subscription, 'id'>): Promise<string> {
  const payload = cleanPayload({
    ...sub,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  });
  const docRef = await addDoc(collection(db, COLLECTION_NAME), payload);
  return docRef.id;
}

export async function updateSubscription(id: string, sub: Partial<Subscription>): Promise<void> {
  const docRef = doc(db, COLLECTION_NAME, id);
  const payload = cleanPayload({
    ...sub,
    updatedAt: new Date().toISOString()
  });
  await updateDoc(docRef, payload);
}

export async function deleteSubscription(id: string): Promise<void> {
  const docRef = doc(db, COLLECTION_NAME, id);
  await deleteDoc(docRef);
}

export async function clearAllUserSubscriptions(userId: string): Promise<void> {
  if (!userId) return;
  const q = query(
    collection(db, COLLECTION_NAME),
    where('userId', '==', userId)
  );
  const snapshot = await getDocs(q);
  const deletePromises = snapshot.docs.map((docSnap) => deleteDoc(docSnap.ref));
  await Promise.all(deletePromises);
}

