import { db, isFirebaseConfigured } from '../config/firebase';
import { 
  collection, 
  addDoc, 
  getDocs, 
  query, 
  orderBy, 
  limit,
  serverTimestamp,
  where 
} from 'firebase/firestore';

const CHATS_COLLECTION = 'chats';

export const saveMessage = async (sessionId, message, isUser) => {
  try {
    // Check if Firebase is properly configured
    if (!isFirebaseConfigured() || !db) {
      console.warn('Firebase not configured - message not saved');
      return { success: false, error: 'Firebase not configured' };
    }
    
    const docRef = await addDoc(collection(db, CHATS_COLLECTION), {
      sessionId,
      text: message,
      isUser,
      timestamp: serverTimestamp()
    });
    return { success: true, id: docRef.id };
  } catch (error) {
    console.error('Error saving message:', error);
    return { success: false, error: error.message };
  }
};

export const getChatHistory = async (sessionId, maxMessages = 50) => {
  try {
    // Check if Firebase is properly configured
    if (!isFirebaseConfigured() || !db) {
      console.warn('Firebase not configured - returning empty history');
      return { success: true, messages: [] };
    }
    
    const q = query(
      collection(db, CHATS_COLLECTION),
      where('sessionId', '==', sessionId),
      orderBy('timestamp', 'desc'),
      limit(maxMessages)
    );

    const querySnapshot = await getDocs(q);
    const messages = [];
    
    querySnapshot.forEach((doc) => {
      messages.push({
        id: doc.id,
        ...doc.data()
      });
    });

    // Reverse to get chronological order
    return { success: true, messages: messages.reverse() };
  } catch (error) {
    console.error('Error getting chat history:', error);
    return { success: true, messages: [] };
  }
};

export const generateSessionId = () => {
  return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};
