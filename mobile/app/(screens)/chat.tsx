import { useState, useEffect, useRef, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  TextInput,
  Image,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Stack, useLocalSearchParams, router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import colors from '@/lib/colors';
import { useAuthStore } from '@/lib/store';

interface Message {
  id: string;
  senderId: string;
  text: string;
  timestamp: string;
  status: 'sent' | 'delivered' | 'read';
}

// Demo messages
const generateDemoMessages = (participantName: string): Message[] => [
  {
    id: '1',
    senderId: 'other',
    text: 'Jai Jinendra! 🙏',
    timestamp: '10:00 AM',
    status: 'read',
  },
  {
    id: '2',
    senderId: 'me',
    text: 'Jai Jinendra! How are you?',
    timestamp: '10:02 AM',
    status: 'read',
  },
  {
    id: '3',
    senderId: 'other',
    text: 'I am doing well, thank you for asking. I saw your profile on JainSetu.',
    timestamp: '10:05 AM',
    status: 'read',
  },
  {
    id: '4',
    senderId: 'me',
    text: 'Yes, I am using JainSetu to connect with the Jain community.',
    timestamp: '10:08 AM',
    status: 'read',
  },
  {
    id: '5',
    senderId: 'other',
    text: 'That\'s great! I wanted to discuss something with you. Are you available?',
    timestamp: '10:15 AM',
    status: 'read',
  },
  {
    id: '6',
    senderId: 'me',
    text: 'Yes, please go ahead. I am here.',
    timestamp: '10:18 AM',
    status: 'delivered',
  },
];

export default function ChatScreen() {
  const { conversationId, participantId, participantName, participantPhoto } =
    useLocalSearchParams<{
      conversationId: string;
      participantId: string;
      participantName: string;
      participantPhoto: string;
    }>();

  const { user } = useAuthStore();
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [inputText, setInputText] = useState('');
  const [sending, setSending] = useState(false);
  const flatListRef = useRef<FlatList>(null);

  const fetchMessages = useCallback(async () => {
    try {
      // In production, fetch from API
      // const response = await api.get(`/messages/${conversationId}`);
      // setMessages(response.messages);

      // Demo data
      await new Promise(resolve => setTimeout(resolve, 300));
      setMessages(generateDemoMessages(participantName || 'User'));
    } catch (error) {
      console.error('Failed to fetch messages:', error);
    } finally {
      setLoading(false);
    }
  }, [conversationId, participantName]);

  useEffect(() => {
    fetchMessages();
  }, [fetchMessages]);

  const handleSend = async () => {
    if (!inputText.trim()) return;

    const newMessage: Message = {
      id: Date.now().toString(),
      senderId: 'me',
      text: inputText.trim(),
      timestamp: new Date().toLocaleTimeString('en-IN', {
        hour: '2-digit',
        minute: '2-digit',
      }),
      status: 'sent',
    };

    setMessages((prev) => [...prev, newMessage]);
    setInputText('');
    setSending(true);

    // Simulate sending
    await new Promise(resolve => setTimeout(resolve, 500));

    setMessages((prev) =>
      prev.map((msg) =>
        msg.id === newMessage.id ? { ...msg, status: 'delivered' } : msg
      )
    );
    setSending(false);

    // Scroll to bottom
    setTimeout(() => {
      flatListRef.current?.scrollToEnd({ animated: true });
    }, 100);
  };

  const renderMessage = ({ item, index }: { item: Message; index: number }) => {
    const isMe = item.senderId === 'me';
    const showAvatar =
      !isMe &&
      (index === 0 || messages[index - 1]?.senderId === 'me');

    return (
      <View
        style={[
          styles.messageContainer,
          isMe ? styles.myMessageContainer : styles.otherMessageContainer,
        ]}
      >
        {!isMe && showAvatar && (
          <View style={styles.messageAvatar}>
            {participantPhoto ? (
              <Image source={{ uri: participantPhoto }} style={styles.smallAvatar} />
            ) : (
              <View style={styles.smallAvatarPlaceholder}>
                <Text style={styles.smallAvatarText}>
                  {participantName?.charAt(0) || 'U'}
                </Text>
              </View>
            )}
          </View>
        )}
        {!isMe && !showAvatar && <View style={styles.avatarSpacer} />}

        <View
          style={[
            styles.messageBubble,
            isMe ? styles.myMessage : styles.otherMessage,
          ]}
        >
          <Text style={[styles.messageText, isMe && styles.myMessageText]}>
            {item.text}
          </Text>
          <View style={styles.messageFooter}>
            <Text style={[styles.timestamp, isMe && styles.myTimestamp]}>
              {item.timestamp}
            </Text>
            {isMe && (
              <Ionicons
                name={
                  item.status === 'read'
                    ? 'checkmark-done'
                    : item.status === 'delivered'
                    ? 'checkmark-done'
                    : 'checkmark'
                }
                size={14}
                color={item.status === 'read' ? colors.blue[500] : colors.gray[400]}
                style={styles.statusIcon}
              />
            )}
          </View>
        </View>
      </View>
    );
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <Stack.Screen options={{ title: participantName || 'Chat' }} />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.saffron[600]} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <Stack.Screen
        options={{
          headerTitle: () => (
            <TouchableOpacity style={styles.headerTitle}>
              {participantPhoto ? (
                <Image source={{ uri: participantPhoto }} style={styles.headerAvatar} />
              ) : (
                <View style={styles.headerAvatarPlaceholder}>
                  <Text style={styles.headerAvatarText}>
                    {participantName?.charAt(0) || 'U'}
                  </Text>
                </View>
              )}
              <View>
                <Text style={styles.headerName}>{participantName}</Text>
                <Text style={styles.headerStatus}>Online</Text>
              </View>
            </TouchableOpacity>
          ),
          headerRight: () => (
            <View style={styles.headerActions}>
              <TouchableOpacity style={styles.headerButton}>
                <Ionicons name="call-outline" size={22} color={colors.gray[700]} />
              </TouchableOpacity>
              <TouchableOpacity style={styles.headerButton}>
                <Ionicons name="ellipsis-vertical" size={22} color={colors.gray[700]} />
              </TouchableOpacity>
            </View>
          ),
        }}
      />

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
        keyboardVerticalOffset={90}
      >
        {/* Messages List */}
        <FlatList
          ref={flatListRef}
          data={messages}
          keyExtractor={(item) => item.id}
          renderItem={renderMessage}
          contentContainerStyle={styles.messagesList}
          onContentSizeChange={() => flatListRef.current?.scrollToEnd()}
          ListHeaderComponent={
            <View style={styles.chatHeader}>
              <View style={styles.chatHeaderAvatar}>
                {participantPhoto ? (
                  <Image source={{ uri: participantPhoto }} style={styles.largeAvatar} />
                ) : (
                  <View style={styles.largeAvatarPlaceholder}>
                    <Text style={styles.largeAvatarText}>
                      {participantName?.charAt(0) || 'U'}
                    </Text>
                  </View>
                )}
              </View>
              <Text style={styles.chatHeaderName}>{participantName}</Text>
              <Text style={styles.chatHeaderInfo}>
                JainSetu Member • Connected via app
              </Text>
            </View>
          }
        />

        {/* Input Area */}
        <View style={styles.inputContainer}>
          <TouchableOpacity style={styles.attachButton}>
            <Ionicons name="add-circle" size={28} color={colors.saffron[600]} />
          </TouchableOpacity>
          <View style={styles.textInputContainer}>
            <TextInput
              style={styles.textInput}
              placeholder="Type a message..."
              value={inputText}
              onChangeText={setInputText}
              multiline
              maxLength={1000}
              placeholderTextColor={colors.gray[400]}
            />
            <TouchableOpacity style={styles.emojiButton}>
              <Ionicons name="happy-outline" size={24} color={colors.gray[400]} />
            </TouchableOpacity>
          </View>
          <TouchableOpacity
            style={[
              styles.sendButton,
              inputText.trim() && styles.sendButtonActive,
            ]}
            onPress={handleSend}
            disabled={!inputText.trim() || sending}
          >
            {sending ? (
              <ActivityIndicator size="small" color={colors.white} />
            ) : (
              <Ionicons
                name="send"
                size={20}
                color={inputText.trim() ? colors.white : colors.gray[400]}
              />
            )}
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.gray[100],
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  keyboardView: {
    flex: 1,
  },
  headerTitle: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    marginRight: 10,
  },
  headerAvatarPlaceholder: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.saffron[100],
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  headerAvatarText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.saffron[600],
  },
  headerName: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.gray[900],
  },
  headerStatus: {
    fontSize: 11,
    color: colors.green[500],
  },
  headerActions: {
    flexDirection: 'row',
  },
  headerButton: {
    padding: 8,
    marginLeft: 4,
  },
  messagesList: {
    paddingHorizontal: 12,
    paddingBottom: 12,
  },
  chatHeader: {
    alignItems: 'center',
    paddingVertical: 24,
    marginBottom: 12,
  },
  chatHeaderAvatar: {
    marginBottom: 12,
  },
  largeAvatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
  },
  largeAvatarPlaceholder: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.saffron[100],
    justifyContent: 'center',
    alignItems: 'center',
  },
  largeAvatarText: {
    fontSize: 32,
    fontWeight: '600',
    color: colors.saffron[600],
  },
  chatHeaderName: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.gray[900],
    marginBottom: 4,
  },
  chatHeaderInfo: {
    fontSize: 13,
    color: colors.gray[500],
  },
  messageContainer: {
    flexDirection: 'row',
    marginVertical: 2,
    paddingHorizontal: 4,
  },
  myMessageContainer: {
    justifyContent: 'flex-end',
  },
  otherMessageContainer: {
    justifyContent: 'flex-start',
  },
  messageAvatar: {
    marginRight: 8,
    alignSelf: 'flex-end',
  },
  avatarSpacer: {
    width: 36,
    marginRight: 8,
  },
  smallAvatar: {
    width: 28,
    height: 28,
    borderRadius: 14,
  },
  smallAvatarPlaceholder: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.saffron[100],
    justifyContent: 'center',
    alignItems: 'center',
  },
  smallAvatarText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.saffron[600],
  },
  messageBubble: {
    maxWidth: '75%',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 18,
  },
  myMessage: {
    backgroundColor: colors.saffron[600],
    borderBottomRightRadius: 4,
  },
  otherMessage: {
    backgroundColor: colors.white,
    borderBottomLeftRadius: 4,
  },
  messageText: {
    fontSize: 15,
    color: colors.gray[800],
    lineHeight: 20,
  },
  myMessageText: {
    color: colors.white,
  },
  messageFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    marginTop: 4,
  },
  timestamp: {
    fontSize: 10,
    color: colors.gray[500],
  },
  myTimestamp: {
    color: 'rgba(255,255,255,0.7)',
  },
  statusIcon: {
    marginLeft: 4,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: 8,
    paddingVertical: 8,
    backgroundColor: colors.white,
    borderTopWidth: 1,
    borderTopColor: colors.gray[200],
  },
  attachButton: {
    padding: 6,
  },
  textInputContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'flex-end',
    backgroundColor: colors.gray[100],
    borderRadius: 24,
    marginHorizontal: 8,
    paddingHorizontal: 16,
    paddingVertical: 8,
    maxHeight: 120,
  },
  textInput: {
    flex: 1,
    fontSize: 15,
    color: colors.gray[900],
    maxHeight: 100,
  },
  emojiButton: {
    padding: 4,
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.gray[300],
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendButtonActive: {
    backgroundColor: colors.saffron[600],
  },
});
