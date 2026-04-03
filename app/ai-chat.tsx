import React, { useState, useRef, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Animated,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Send, Sparkles, ArrowLeft } from "lucide-react-native";
import { useLocalSearchParams, useRouter, Stack } from "expo-router";
import * as Haptics from "expo-haptics";

import Colors from "@/constants/colors";
import { useSubscription } from "@/providers/SubscriptionProvider";
import { Crown, Lock } from "lucide-react-native";

interface Message {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: Date;
}

const TOPIC_CONFIG: Record<string, { greeting: string; suggestions: string[] }> = {
  "ai-friend": {
    greeting: "I'm your AI Bible companion. Ask me anything about Scripture, faith, or life!",
    suggestions: [
      "What does John 3:16 mean?",
      "How to find peace in hard times?",
      "Explain the Beatitudes",
      "What is grace?",
    ],
  },
  healing: {
    greeting: "Welcome to your healing journal. Let's find comfort and restoration through God's word together.",
    suggestions: [
      "I'm going through a difficult season",
      "Help me find verses about healing",
      "I need comfort right now",
      "Pray for my broken heart",
    ],
  },
  gratitude: {
    greeting: "Welcome to your gratitude journal. Let's count blessings and give thanks together.",
    suggestions: [
      "Help me write a gratitude prayer",
      "What does the Bible say about thankfulness?",
      "I want to list my blessings today",
      "Share a psalm of thanksgiving",
    ],
  },
  "daily-devotion": {
    greeting: "Here's your personalized devotion for today. Let's explore God's word together.",
    suggestions: [
      "Give me today's devotion",
      "What should I meditate on today?",
      "Share a morning prayer",
      "Help me start my day with Scripture",
    ],
  },
  strength: {
    greeting: "Be strong and courageous! Let's explore what God says about strength and resilience.",
    suggestions: [
      "I need strength to keep going",
      "Verses about courage and bravery",
      "How to trust God in uncertainty",
      "Help me overcome fear",
    ],
  },
  "prayer-life": {
    greeting: "Let's deepen your prayer life together. God is always listening.",
    suggestions: [
      "How can I pray more effectively?",
      "Teach me about different types of prayer",
      "Help me build a prayer routine",
      "What did Jesus teach about prayer?",
    ],
  },
};

const AI_RESPONSES: Record<string, string> = {
  default:
    "That's a wonderful question! The Bible has so much wisdom to share on this topic. Let me share some thoughts with you.\n\nScripture teaches us that God's love is unconditional and His wisdom is infinite. I'd encourage you to spend some time in prayer and reflection on this. Would you like me to suggest some specific passages to explore?",
  "What does John 3:16 mean?":
    'John 3:16 is one of the most beloved verses in the Bible: "For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life."\n\nThis verse captures the heart of the Gospel — God\'s immeasurable love for humanity. He loved us so deeply that He made the ultimate sacrifice. The word "whosoever" is beautifully inclusive — this promise is for everyone who believes.\n\nWould you like to explore more of John chapter 3?',
  "How to find peace in hard times?":
    'Finding peace during difficult seasons is a theme woven throughout Scripture. Here are some passages that speak to this:\n\nPhilippians 4:6-7 — "Be careful for nothing; but in every thing by prayer and supplication with thanksgiving let your requests be made known unto God. And the peace of God, which passeth all understanding, shall keep your hearts and minds through Christ Jesus."\n\nIsaiah 26:3 — "Thou wilt keep him in perfect peace, whose mind is stayed on thee: because he trusteth in thee."\n\nPeace comes not from the absence of trouble, but from the presence of God in the midst of it.',
  "Explain the Beatitudes":
    "The Beatitudes are found in Matthew 5:3-12, part of Jesus' Sermon on the Mount. They describe the qualities of those who are truly blessed in God's kingdom:\n\n• Blessed are the poor in spirit — those who recognize their need for God\n• Blessed are they that mourn — those who grieve will be comforted\n• Blessed are the meek — the humble will inherit the earth\n• Blessed are they which do hunger and thirst after righteousness\n• Blessed are the merciful — they shall obtain mercy\n• Blessed are the pure in heart — they shall see God\n• Blessed are the peacemakers — they shall be called the children of God\n\nThese teachings turn worldly values upside down, showing that true blessing comes through surrender to God.",
  "What is grace?":
    'Grace is one of the most beautiful concepts in Christianity. At its simplest, grace is God\'s unmerited favor — a gift we receive not because we\'ve earned it, but because of God\'s love.\n\nEphesians 2:8-9 — "For by grace are ye saved through faith; and that not of yourselves: it is the gift of God: Not of works, lest any man should boast."\n\nGrace means:\n• We are forgiven even though we don\'t deserve it\n• God\'s love for us isn\'t based on our performance\n• We can approach God freely and without fear\n\nGrace is the foundation of our relationship with God. It\'s what makes the Gospel truly "good news."',
};

export default function AIChatScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { topic, title } = useLocalSearchParams<{ topic?: string; title?: string }>();
  const { canSendChat, chatRemaining, isPremium, incrementChat } = useSubscription();
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const flatListRef = useRef<FlatList>(null);
  const typingAnim = useRef(new Animated.Value(0)).current;

  const topicKey = topic ?? "ai-friend";
  const config = TOPIC_CONFIG[topicKey] ?? TOPIC_CONFIG["ai-friend"];
  const screenTitle = title ?? "AI Friend";

  const startTypingAnimation = useCallback(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(typingAnim, {
          toValue: 1,
          duration: 600,
          useNativeDriver: true,
        }),
        Animated.timing(typingAnim, {
          toValue: 0,
          duration: 600,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, [typingAnim]);

  const handleSend = useCallback(
    (text?: string) => {
      const messageText = text || inputText.trim();
      if (!messageText) return;

      if (!canSendChat) {
        router.push("/paywall");
        return;
      }

      void incrementChat();

      if (Platform.OS !== "web") {
        void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      }

      const userMessage: Message = {
        id: Date.now().toString(),
        text: messageText,
        isUser: true,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, userMessage]);
      setInputText("");
      setIsTyping(true);
      startTypingAnimation();

      setTimeout(() => {
        const aiResponse =
          AI_RESPONSES[messageText] || AI_RESPONSES.default;
        const aiMessage: Message = {
          id: (Date.now() + 1).toString(),
          text: aiResponse,
          isUser: false,
          timestamp: new Date(),
        };
        setMessages((prev) => [...prev, aiMessage]);
        setIsTyping(false);
        typingAnim.stopAnimation();
      }, 1500);
    },
    [inputText, startTypingAnimation, typingAnim, canSendChat, incrementChat, router]
  );

  const renderMessage = ({ item }: { item: Message }) => (
    <View
      style={[
        styles.messageBubble,
        item.isUser ? styles.userBubble : styles.aiBubble,
      ]}
    >
      {!item.isUser && (
        <View style={styles.aiAvatar}>
          <Sparkles size={14} color={Colors.accent} />
        </View>
      )}
      <View
        style={[
          styles.bubbleContent,
          item.isUser ? styles.userContent : styles.aiContent,
        ]}
      >
        <Text
          style={[
            styles.messageText,
            item.isUser ? styles.userMessageText : styles.aiMessageText,
          ]}
        >
          {item.text}
        </Text>
      </View>
    </View>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <View style={styles.emptyIconContainer}>
        <Sparkles size={28} color={Colors.accent} />
      </View>
      <Text style={styles.emptyTitle}>{screenTitle}</Text>
      <Text style={styles.emptySubtitle}>{config.greeting}</Text>
      <View style={styles.suggestionsContainer}>
        {config.suggestions.map((question) => (
          <TouchableOpacity
            key={question}
            style={styles.suggestionChip}
            onPress={() => handleSend(question)}
            activeOpacity={0.7}
          >
            <Text style={styles.suggestionText}>{question}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );

  return (
    <>
      <Stack.Screen
        options={{
          title: screenTitle,
          headerLeft: () => (
            <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
              <ArrowLeft size={22} color={Colors.text} />
            </TouchableOpacity>
          ),
          headerShadowVisible: false,
          headerStyle: { backgroundColor: Colors.background },
          headerTitleStyle: { fontWeight: "600" as const, fontSize: 17, color: Colors.text },
        }}
      />
      <View style={styles.container}>
        <KeyboardAvoidingView
          style={styles.flex}
          behavior={Platform.OS === "ios" ? "padding" : undefined}
          keyboardVerticalOffset={90}
        >
          {messages.length === 0 ? (
            renderEmptyState()
          ) : (
            <FlatList
              ref={flatListRef}
              data={messages}
              renderItem={renderMessage}
              keyExtractor={(item) => item.id}
              contentContainerStyle={styles.messagesList}
              showsVerticalScrollIndicator={false}
              onContentSizeChange={() =>
                flatListRef.current?.scrollToEnd({ animated: true })
              }
              ListFooterComponent={
                isTyping ? (
                  <View style={styles.typingContainer}>
                    <View style={styles.aiAvatar}>
                      <Sparkles size={14} color={Colors.accent} />
                    </View>
                    <Animated.View
                      style={[
                        styles.typingBubble,
                        { opacity: Animated.add(0.4, Animated.multiply(typingAnim, 0.6)) },
                      ]}
                    >
                      <Text style={styles.typingText}>Thinking...</Text>
                    </Animated.View>
                  </View>
                ) : null
              }
            />
          )}

          {!isPremium && (
            <View style={styles.chatLimitBar}>
              {canSendChat ? (
                <Text style={styles.chatLimitText}>
                  {chatRemaining} free messages remaining
                </Text>
              ) : (
                <TouchableOpacity
                  style={styles.chatUpgradeBar}
                  onPress={() => router.push("/paywall")}
                  activeOpacity={0.85}
                >
                  <Lock size={14} color={Colors.accent} />
                  <Text style={styles.chatLimitTextLocked}>Free messages used up</Text>
                  <View style={styles.chatUpgradeChip}>
                    <Crown size={12} color="#FFF" />
                    <Text style={styles.chatUpgradeChipText}>Upgrade</Text>
                  </View>
                </TouchableOpacity>
              )}
            </View>
          )}

          <View
            style={[styles.inputContainer, { paddingBottom: Math.max(insets.bottom, 12) }]}
          >
            <View style={styles.inputWrapper}>
              <TextInput
                style={styles.input}
                placeholder="Type your message..."
                placeholderTextColor={Colors.textTertiary}
                value={inputText}
                onChangeText={setInputText}
                multiline
                maxLength={500}
                testID="chat-input"
              />
              <TouchableOpacity
                style={[
                  styles.sendButton,
                  (!inputText.trim() || !canSendChat) && styles.sendButtonDisabled,
                ]}
                onPress={() => handleSend()}
                disabled={!inputText.trim()}
                testID="send-button"
              >
                <Send
                  size={18}
                  color={inputText.trim() ? Colors.white : Colors.textTertiary}
                />
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  flex: {
    flex: 1,
  },
  backButton: {
    padding: 4,
  },
  emptyState: {
    flex: 1,
    justifyContent: "center" as const,
    alignItems: "center" as const,
    paddingHorizontal: 36,
  },
  emptyIconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: Colors.accentLight,
    alignItems: "center" as const,
    justifyContent: "center" as const,
    marginBottom: 20,
  },
  emptyTitle: {
    fontSize: 22,
    fontWeight: "700" as const,
    color: Colors.text,
    textAlign: "center" as const,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 15,
    color: Colors.textSecondary,
    textAlign: "center" as const,
    lineHeight: 22,
    marginBottom: 32,
  },
  suggestionsContainer: {
    gap: 10,
    width: "100%",
  },
  suggestionChip: {
    backgroundColor: Colors.surface,
    borderRadius: 14,
    paddingHorizontal: 18,
    paddingVertical: 14,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  suggestionText: {
    fontSize: 14,
    color: Colors.text,
    fontWeight: "500" as const,
  },
  messagesList: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
  },
  messageBubble: {
    flexDirection: "row" as const,
    marginBottom: 16,
    alignItems: "flex-start" as const,
  },
  userBubble: {
    justifyContent: "flex-end" as const,
  },
  aiBubble: {
    justifyContent: "flex-start" as const,
  },
  aiAvatar: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: Colors.accentLight,
    alignItems: "center" as const,
    justifyContent: "center" as const,
    marginRight: 8,
    marginTop: 2,
  },
  bubbleContent: {
    maxWidth: "78%",
    borderRadius: 18,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  userContent: {
    backgroundColor: Colors.text,
    borderBottomRightRadius: 4,
    marginLeft: "auto",
  },
  aiContent: {
    backgroundColor: Colors.surface,
    borderBottomLeftRadius: 4,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  messageText: {
    fontSize: 15,
    lineHeight: 22,
  },
  userMessageText: {
    color: Colors.white,
  },
  aiMessageText: {
    color: Colors.text,
  },
  typingContainer: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    marginBottom: 16,
  },
  typingBubble: {
    backgroundColor: Colors.surface,
    borderRadius: 18,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  typingText: {
    fontSize: 14,
    color: Colors.textTertiary,
    fontStyle: "italic" as const,
  },
  inputContainer: {
    paddingHorizontal: 16,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: Colors.borderLight,
    backgroundColor: Colors.white,
  },
  inputWrapper: {
    flexDirection: "row" as const,
    alignItems: "flex-end" as const,
    backgroundColor: Colors.surface,
    borderRadius: 24,
    paddingLeft: 18,
    paddingRight: 6,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: Colors.text,
    maxHeight: 100,
    paddingVertical: 8,
    paddingRight: 8,
  },
  sendButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.primary,
    alignItems: "center" as const,
    justifyContent: "center" as const,
  },
  sendButtonDisabled: {
    backgroundColor: Colors.borderLight,
  },
  chatLimitBar: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: Colors.accentLight,
    alignItems: "center" as const,
  },
  chatLimitText: {
    fontSize: 12,
    fontWeight: "600" as const,
    color: Colors.accent,
  },
  chatUpgradeBar: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    justifyContent: "center" as const,
    gap: 8,
    width: "100%",
  },
  chatLimitTextLocked: {
    flex: 1,
    fontSize: 12,
    fontWeight: "600" as const,
    color: Colors.accent,
  },
  chatUpgradeChip: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    backgroundColor: Colors.accent,
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 20,
    gap: 4,
  },
  chatUpgradeChipText: {
    fontSize: 11,
    fontWeight: "700" as const,
    color: "#FFF",
  },
});
