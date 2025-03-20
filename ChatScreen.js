import React, { useState, useEffect, useRef } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useAuth } from '../context/AuthContext';
import { db } from '../config/firebase';
import {
  collection,
  doc,
  getDoc,
  addDoc,
  serverTimestamp,
  query,
  orderBy,
  onSnapshot,
  where,
} from 'firebase/firestore';
import { MaterialIcons } from '@expo/vector-icons';

const ChatScreen = ({ route, navigation }) => {
  const { userId } = route.params;
  const { currentUser, userProfile } = useAuth();
  const [otherUser, setOtherUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [sending, setSending] = useState(false);
  const flatListRef = useRef(null);

  // Generate a unique chat ID based on both user IDs
  const getChatId = () => {
    const sortedIds = [currentUser.uid, userId].sort();
    return `${sortedIds[0]}_${sortedIds[1]}`;
  };

  const chatId = getChatId();

  // Fetch other user's profile
  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const userDoc = await getDoc(doc(db, 'users', userId));
        if (userDoc.exists()) {
          setOtherUser(userDoc.data());
        } else {
          Alert.alert('Error', 'User not found');
          navigation.goBack();
        }
      } catch (error) {
        console.error('Error fetching user profile:', error);
        Alert.alert('Error', 'Failed to load user data');
      } finally {
        setLoading(false);
      }
    };

    fetchUserProfile();
  }, [userId, navigation]);

  // Subscribe to chat messages
  useEffect(() => {
    if (!currentUser) return;

    const messagesRef = collection(db, 'chats', chatId, 'messages');
    const q = query(messagesRef, orderBy('timestamp', 'asc'));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const messagesList = [];
      snapshot.forEach((doc) => {
        messagesList.push({
          id: doc.id,
          ...doc.data(),
        });
      });
      setMessages(messagesList);
    });

    return () => unsubscribe();
  }, [chatId, currentUser]);

  // Scroll to the bottom when new messages arrive
  useEffect(() => {
    if (messages.length > 0 && flatListRef.current) {
      flatListRef.current.scrollToEnd({ animated: true });
    }
  }, [messages]);

  const sendMessage = async () => {
    if (!newMessage.trim()) return;

    try {
      setSending(true);
      // Add message to Firestore
      await addDoc(collection(db, 'chats', chatId, 'messages'), {
        text: newMessage.trim(),
        senderId: currentUser.uid,
        receiverId: userId,
        timestamp: serverTimestamp(),
        read: false,
      });

      setNewMessage('');
    } catch (error) {
      console.error('Error sending message:', error);
      Alert.alert('Error', 'Failed to send message');
    } finally {
      setSending(false);
    }
  };

  const renderMessage = ({ item }) => {
    const isCurrentUser = item.senderId === currentUser.uid;

    return (
      <View
        style={[
          styles.messageContainer,
          isCurrentUser ? styles.currentUserMessage : styles.otherUserMessage,
        ]}
      >
        <Text style={styles.messageText}>{item.text}</Text>
        <Text style={styles.timestampText}>
          {item.timestamp ? new Date(item.timestamp.toDate()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Sending...'}
        </Text>
      </View>
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#4285F4" />
        <Text style={styles.loadingText}>Loading conversation...</Text>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
    >
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <MaterialIcons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <View style={styles.headerUserInfo}>
          <Text style={styles.headerUserName}>{otherUser?.role || 'User'}</Text>
          <Text style={styles.headerUserDetail}>
            {otherUser?.field || 'Unknown field'} • {otherUser?.userType === 'employer' ? 'Employer' : 'Employee'}
          </Text>
        </View>
        <TouchableOpacity
          style={styles.profileButton}
          onPress={() => navigation.navigate('Profile', { userId })}
        >
          <MaterialIcons name="person" size={24} color="#4285F4" />
        </TouchableOpacity>
      </View>

      <FlatList
        ref={flatListRef}
        data={messages}
        keyExtractor={(item) => item.id}
        renderItem={renderMessage}
        contentContainerStyle={styles.messagesContainer}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>
              No messages yet. Start the conversation!
            </Text>
          </View>
        }
      />

      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="Type a message..."
          value={newMessage}
          onChangeText={setNewMessage}
          multiline
          maxLength={500}
        />
        <TouchableOpacity
          style={[styles.sendButton, !newMessage.trim() && styles.disabledButton]}
          onPress={sendMessage}
          disabled={!newMessage.trim() || sending}
        >
          {sending ? (
            <ActivityIndicator size="small" color="#FFFFFF" />
          ) : (
            <MaterialIcons name="send" size={20} color="#FFFFFF" />
          )}
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    color: '#666',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  backButton: {
    marginRight: 15,
  },
  headerUserInfo: {
    flex: 1,
  },
  headerUserName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  headerUserDetail: {
    fontSize: 12,
    color: '#666',
  },
  profileButton: {
    padding: 5,
  },
  messagesContainer: {
    padding: 15,
    flexGrow: 1,
  },
  messageContainer: {
    maxWidth: '80%',
    padding: 12,
    borderRadius: 16,
    marginBottom: 10,
  },
  currentUserMessage: {
    alignSelf: 'flex-end',
    backgroundColor: '#4285F4',
    borderBottomRightRadius: 4,
  },
  otherUserMessage: {
    alignSelf: 'flex-start',
    backgroundColor: '#FFFFFF',
    borderBottomLeftRadius: 4,
  },
  messageText: {
    fontSize: 14,
    color: '#FFFFFF',
  },
  timestampText: {
    fontSize: 10,
    color: 'rgba(255, 255, 255, 0.7)',
    marginTop: 5,
    alignSelf: 'flex-end',
  },
  inputContainer: {
    flexDirection: 'row',
    padding: 10,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
    alignItems: 'center',
  },
  input: {
    flex: 1,
    backgroundColor: '#F0F0F0',
    borderRadius: 20,
    paddingHorizontal: 15,
    paddingVertical: 10,
    maxHeight: 100,
    fontSize: 14,
  },
  sendButton: {
    backgroundColor: '#4285F4',
    borderRadius: 25,
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 10,
  },
  disabledButton: {
    backgroundColor: '#A0A0A0',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 50,
  },
  emptyText: {
    fontSize: 14,
    color: '#888',
    textAlign: 'center',
  },
});

export default ChatScreen;
