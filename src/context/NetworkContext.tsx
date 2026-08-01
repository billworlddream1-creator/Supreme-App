import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  collection, 
  addDoc, 
  onSnapshot, 
  query, 
  where, 
  orderBy, 
  doc, 
  updateDoc, 
  deleteDoc,
  getDocs,
  getDoc,
  Timestamp,
  setDoc,
  limit,
  increment
} from 'firebase/firestore';
import { db, auth, handleFirestoreError, OperationType } from '../firebase';
import { useAuth } from './AuthContext';

export interface Friend {
  id: string;
  name: string;
  handle: string;
  avatar: string;
  rank: string;
  rankColor: string;
  isOnline?: boolean;
  followers?: number;
}

export type CommunityCategory = 'Tech' | 'Business' | 'Lifestyle' | 'Entertainment' | 'Sports' | 'Education' | 'Other';

export interface Community {
  id: string;
  name: string;
  description: string;
  category: CommunityCategory;
  avatar: string;
  membersCount: number;
  isPrivate: boolean;
  createdBy: string;
  createdAt: any;
}

export interface Message {
  id: string;
  text: string;
  senderId: string;
  type: 'text' | 'gif' | 'audio' | 'image' | 'file' | 'location' | 'clip';
  timestamp: any;
  metadata?: any;
}

export interface ChatSession {
  friendId: string;
  messages: Message[];
  lastMessage?: string;
  lastMessageTime?: any;
  unreadCount: number;
}

interface NetworkContextType {
  friends: Friend[];
  friendRequests: Friend[];
  sentRequests: string[];
  communities: Community[];
  communityRequests: { [communityId: string]: Friend[] };
  myCommunityRequests: string[];
  joinedCommunities: string[];
  subscriptions: string[];
  chatSessions: { [friendId: string]: ChatSession };
  addFriend: (user: Friend) => Promise<boolean>;
  sendFriendRequest: (user: Friend) => Promise<void>;
  removeFriend: (id: string) => Promise<void>;
  acceptFriendRequest: (id: string) => Promise<void>;
  rejectFriendRequest: (id: string) => Promise<void>;
  cancelFriendRequest: (id: string) => Promise<void>;
  createCommunity: (community: Omit<Community, 'id' | 'membersCount' | 'createdAt'>) => Promise<void>;
  joinCommunity: (id: string) => Promise<void>;
  leaveCommunity: (id: string) => Promise<void>;
  requestToJoinCommunity: (id: string) => Promise<void>;
  cancelCommunityRequest: (id: string) => Promise<void>;
  acceptCommunityRequest: (communityId: string, userId: string) => Promise<void>;
  rejectCommunityRequest: (communityId: string, userId: string) => Promise<void>;
  toggleSubscription: (creatorId: string) => Promise<void>;
  searchCommunities: (query: string) => Community[];
  searchUsers: (query: string) => Friend[];
  allUsers: Friend[];
  sendMessage: (friendId: string, text: string, type?: 'text' | 'gif' | 'audio' | 'image' | 'file' | 'location' | 'clip', metadata?: any) => Promise<void>;
  markChatRead: (friendId: string) => void;
  getFriendLimit: () => number;
}

export const COMMUNITY_CATEGORIES: CommunityCategory[] = [
  'Tech', 'Business', 'Lifestyle', 'Entertainment', 'Sports', 'Education', 'Other'
];

const NetworkContext = createContext<NetworkContextType | undefined>(undefined);

export function NetworkProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [friends, setFriends] = useState<Friend[]>([]);
  const [friendRequests, setFriendRequests] = useState<Friend[]>([]);
  const [sentRequests, setSentRequests] = useState<string[]>([]);
  const [communities, setCommunities] = useState<Community[]>([]);
  const [joinedCommunities, setJoinedCommunities] = useState<string[]>([]);
  const [subscriptions, setSubscriptions] = useState<string[]>([]);
  const [chatSessions, setChatSessions] = useState<{ [friendId: string]: ChatSession }>({});
  const [communityRequests, setCommunityRequests] = useState<{ [communityId: string]: Friend[] }>({});
  const [myCommunityRequests, setMyCommunityRequests] = useState<string[]>([]);
  const [allUsers, setAllUsers] = useState<Friend[]>([]);

  // Fetch all users for search (simplified for demo)
  useEffect(() => {
    if (!user || !user.uid) {
      setAllUsers([]);
      return;
    }
    const q = query(collection(db, 'users'), limit(50));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const users: Friend[] = [];
      snapshot.forEach((doc) => {
        const data = doc.data();
        users.push({
          id: doc.id,
          name: data.name,
          handle: data.handle,
          avatar: data.avatar,
          rank: data.rank,
          rankColor: data.rankColor,
          followers: data.followers
        });
      });
      setAllUsers(users);
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, 'users');
    });
    return () => unsubscribe();
  }, [user]);

  // Listen to friendships
  useEffect(() => {
    if (!user || !user.uid) {
      setFriends([]);
      setFriendRequests([]);
      setSentRequests([]);
      return;
    }

    const q = query(
      collection(db, 'friendships'),
      where('users', 'array-contains', user.uid)
    );

    const processFriendshipsSnapshot = async (docs: any[]) => {
      const activeFriends: Friend[] = [];
      const incomingRequests: Friend[] = [];
      const outgoingRequests: string[] = [];

      const promises = docs.map(async (friendshipDoc) => {
        const data = friendshipDoc.data();
        const otherId = data.users.find((id: string) => id !== user.uid);
        
        if (data.status === 'accepted') {
          const friendProfile = await getDoc(doc(db, 'users', otherId));
          if (friendProfile.exists()) {
            const p = friendProfile.data();
            activeFriends.push({
              id: otherId,
              name: p.name,
              handle: p.handle,
              avatar: p.avatar,
              rank: p.rank,
              rankColor: p.rankColor,
              followers: p.followers
            });
          }
        } else if (data.status === 'pending') {
          if (data.fromId === user.uid) {
            outgoingRequests.push(otherId);
          } else {
            const requesterProfile = await getDoc(doc(db, 'users', otherId));
            if (requesterProfile.exists()) {
              const p = requesterProfile.data();
              incomingRequests.push({
                id: otherId,
                name: p.name,
                handle: p.handle,
                avatar: p.avatar,
                rank: p.rank,
                rankColor: p.rankColor,
                followers: p.followers
              });
            }
          }
        }
      });

      await Promise.all(promises);

      setFriends(activeFriends);
      setFriendRequests(incomingRequests);
      setSentRequests(outgoingRequests);
    };

    const unsubscribe = onSnapshot(q, (snapshot) => {
      processFriendshipsSnapshot(snapshot.docs).catch(err => {
        console.warn('Error processing friendships snapshot:', err);
      });
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, 'friendships');
    });

    return () => unsubscribe();
  }, [user]);

  // Listen to communities
  useEffect(() => {
    if (!user || !user.uid) {
      setCommunities([]);
      return;
    }
    const q = query(collection(db, 'communities'), orderBy('createdAt', 'desc'), limit(100));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const comms: Community[] = [];
      snapshot.forEach((doc) => {
        comms.push({ id: doc.id, ...doc.data() } as Community);
      });
      setCommunities(comms);
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, 'communities');
    });
    return () => unsubscribe();
  }, [user]);

  // Listen to subscriptions
  useEffect(() => {
    if (!user || !user.uid) {
      setSubscriptions([]);
      return;
    }

    const q = query(
      collection(db, 'subscriptions'),
      where('subscriberId', '==', user.uid)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const subs: string[] = [];
      snapshot.forEach((doc) => {
        subs.push(doc.data().creatorId);
      });
      setSubscriptions(subs);
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, 'subscriptions');
    });

    return () => unsubscribe();
  }, [user]);

  // Listen to messages
  useEffect(() => {
    if (!user || !user.uid) {
      setChatSessions({});
      return;
    }

    const q = query(
      collection(db, 'messages'),
      where('participants', 'array-contains', user.uid),
      limit(1000)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const sessions: { [friendId: string]: ChatSession } = {};
      
      // Sort the docs by timestamp in ascending order (chronological order)
      const docs = [...snapshot.docs].sort((a, b) => {
        const timeA = a.data().timestamp?.toDate?.()?.getTime() || (a.data().timestamp ? new Date(a.data().timestamp).getTime() : 0);
        const timeB = b.data().timestamp?.toDate?.()?.getTime() || (b.data().timestamp ? new Date(b.data().timestamp).getTime() : 0);
        return timeA - timeB;
      });
      
      docs.forEach((doc) => {
        const data = doc.data();
        const otherId = data.participants.find((id: string) => id !== user.uid);
        
        if (!sessions[otherId]) {
          sessions[otherId] = {
            friendId: otherId,
            messages: [],
            unreadCount: 0
          };
        }
        
        const msg: Message = {
          id: doc.id,
          text: data.text,
          senderId: data.senderId,
          type: data.type || 'text',
          timestamp: data.timestamp,
          metadata: data.metadata || null
        };
        
        sessions[otherId].messages.push(msg);
        sessions[otherId].lastMessage = data.text;
        sessions[otherId].lastMessageTime = data.timestamp;
      });
      
      setChatSessions(sessions);
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, 'messages');
    });

    return () => unsubscribe();
  }, [user]);

  const getFriendLimit = () => {
    if (!user) return 500;
    switch (user.rank) {
      case 'crowned': return 7000;
      case 'gold': return 5000;
      case 'diamond': return 4000;
      case 'silver': return 2500;
      case 'elite': return 1500;
      case 'royal': return 1000;
      default: return 500;
    }
  };

  const addFriend = async (friendUser: Friend) => {
    if (!user) return false;
    const limit = getFriendLimit();
    if (friends.length >= limit) return false;
    
    try {
      const friendshipId = [user.uid, friendUser.id].sort().join('_');
      await setDoc(doc(db, 'friendships', friendshipId), {
        users: [user.uid, friendUser.id],
        status: 'accepted',
        createdAt: Timestamp.now()
      });
      return true;
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, 'friendships');
      return false;
    }
  };

  const sendFriendRequest = async (friend: Friend) => {
    if (!user) return;
    try {
      const friendshipId = [user.uid, friend.id].sort().join('_');
      await setDoc(doc(db, 'friendships', friendshipId), {
        users: [user.uid, friend.id],
        fromId: user.uid,
        status: 'pending',
        createdAt: Timestamp.now()
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, 'friendships');
    }
  };

  const cancelFriendRequest = async (id: string) => {
    if (!user) return;
    const friendshipId = [user.uid, id].sort().join('_');
    try {
      await deleteDoc(doc(db, 'friendships', friendshipId));
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `friendships/${friendshipId}`);
    }
  };

  const removeFriend = async (id: string) => {
    if (!user) return;
    const friendshipId = [user.uid, id].sort().join('_');
    try {
      await deleteDoc(doc(db, 'friendships', friendshipId));
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `friendships/${friendshipId}`);
    }
  };

  const acceptFriendRequest = async (id: string) => {
    if (!user) return;
    const friendshipId = [user.uid, id].sort().join('_');
    try {
      await updateDoc(doc(db, 'friendships', friendshipId), {
        status: 'accepted'
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `friendships/${friendshipId}`);
    }
  };

  const rejectFriendRequest = async (id: string) => {
    if (!user) return;
    const friendshipId = [user.uid, id].sort().join('_');
    try {
      await deleteDoc(doc(db, 'friendships', friendshipId));
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `friendships/${friendshipId}`);
    }
  };

  const createCommunity = async (data: Omit<Community, 'id' | 'membersCount' | 'createdAt'>) => {
    if (!user) return;
    try {
      await addDoc(collection(db, 'communities'), {
        ...data,
        membersCount: 1,
        createdBy: user.uid,
        createdAt: Timestamp.now()
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, 'communities');
    }
  };

  const joinCommunity = async (id: string) => {
    if (!user) return;
    try {
      await updateDoc(doc(db, 'communities', id), {
        membersCount: increment(1)
      });
      setJoinedCommunities(prev => [...prev, id]);
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `communities/${id}`);
    }
  };

  const leaveCommunity = async (id: string) => {
    if (!user) return;
    try {
      await updateDoc(doc(db, 'communities', id), {
        membersCount: increment(-1)
      });
      setJoinedCommunities(prev => prev.filter(cid => cid !== id));
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `communities/${id}`);
    }
  };

  const requestToJoinCommunity = async (id: string) => {
    setMyCommunityRequests(prev => [...prev, id]);
  };

  const cancelCommunityRequest = async (id: string) => {
    setMyCommunityRequests(prev => prev.filter(cid => cid !== id));
  };

  const acceptCommunityRequest = async (communityId: string, userId: string) => {
    // Logic for private community join
  };

  const rejectCommunityRequest = async (communityId: string, userId: string) => {
    // Logic for private community reject
  };

  const toggleSubscription = async (creatorId: string) => {
    if (!user) return;
    const subId = `${user.uid}_${creatorId}`;
    try {
      if (subscriptions.includes(creatorId)) {
        await deleteDoc(doc(db, 'subscriptions', subId));
      } else {
        await setDoc(doc(db, 'subscriptions', subId), {
          subscriberId: user.uid,
          creatorId: creatorId,
          createdAt: Timestamp.now()
        });
      }
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, 'subscriptions');
    }
  };

  const searchCommunities = (query: string) => {
    return communities.filter(c => 
      c.name.toLowerCase().includes(query.toLowerCase()) || 
      c.description.toLowerCase().includes(query.toLowerCase())
    );
  };

  const searchUsers = (query: string) => {
    return allUsers.filter(u => 
      u.name.toLowerCase().includes(query.toLowerCase()) || 
      u.handle.toLowerCase().includes(query.toLowerCase())
    );
  };

  const sendMessage = async (friendId: string, text: string, type: 'text' | 'gif' | 'audio' | 'image' | 'file' | 'location' | 'clip' = 'text', metadata?: any) => {
    if (!user) return;
    try {
      const docData: any = {
        participants: [user.uid, friendId],
        senderId: user.uid,
        text,
        type,
        timestamp: Timestamp.now()
      };
      if (metadata) {
        docData.metadata = metadata;
      }
      await addDoc(collection(db, 'messages'), docData);
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, 'messages');
    }
  };

  const markChatRead = (friendId: string) => {
    // Logic for marking chat as read
  };

  return (
    <NetworkContext.Provider value={{
      friends,
      friendRequests,
      sentRequests,
      communities,
      communityRequests,
      myCommunityRequests,
      joinedCommunities,
      subscriptions,
      chatSessions,
      addFriend,
      sendFriendRequest,
      removeFriend,
      acceptFriendRequest,
      rejectFriendRequest,
      cancelFriendRequest,
      createCommunity,
      joinCommunity,
      leaveCommunity,
      requestToJoinCommunity,
      cancelCommunityRequest,
      acceptCommunityRequest,
      rejectCommunityRequest,
      toggleSubscription,
      searchCommunities,
      searchUsers,
      allUsers,
      sendMessage,
      markChatRead,
      getFriendLimit
    }}>
      {children}
    </NetworkContext.Provider>
  );
}

export function useNetwork() {
  const context = useContext(NetworkContext);
  if (context === undefined) {
    throw new Error('useNetwork must be used within a NetworkProvider');
  }
  return context;
}
