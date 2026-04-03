import React, { useState, useRef, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Animated,
  Share,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Bookmark, Share2, ChevronRight } from "lucide-react-native";
import * as Haptics from "expo-haptics";
import { Platform } from "react-native";

import Colors from "@/constants/colors";
import { dailyScriptures, DailyScripture } from "@/mocks/daily";

export default function DailyScreen() {
  const insets = useSafeAreaInsets();
  const [savedIds, setSavedIds] = useState<string[]>([]);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 600,
        useNativeDriver: true,
      }),
    ]).start();
  }, [fadeAnim, slideAnim]);

  const todayScripture = dailyScriptures[0];
  const pastScriptures = dailyScriptures.slice(1);

  const handleSave = (id: string) => {
    if (Platform.OS !== "web") {
      void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    setSavedIds((prev) =>
      prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id]
    );
  };

  const handleShare = async (scripture: DailyScripture) => {
    try {
      await Share.share({
        message: `"${scripture.verse}"\n\n— ${scripture.reference}\n\nShared from PrayNest`,
      });
    } catch (error) {
      console.log("Share error:", error);
    }
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 17) return "Good afternoon";
    return "Good evening";
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <Animated.View
          style={[
            styles.header,
            { opacity: fadeAnim, transform: [{ translateY: slideAnim }] },
          ]}
        >
          <Text style={styles.greeting}>{getGreeting()}</Text>
          <Text style={styles.headerTitle}>Daily Word</Text>
          <Text style={styles.headerDate}>
            {new Date().toLocaleDateString("en-US", {
              weekday: "long",
              month: "long",
              day: "numeric",
            })}
          </Text>
        </Animated.View>

        <Animated.View
          style={[
            styles.todayCard,
            { opacity: fadeAnim, transform: [{ translateY: slideAnim }] },
          ]}
        >
          <View style={styles.topicBadge}>
            <Text style={styles.topicText}>{todayScripture.topic}</Text>
          </View>

          <Text style={styles.verseText}>"{todayScripture.verse}"</Text>

          <Text style={styles.referenceText}>{todayScripture.reference}</Text>

          <View style={styles.divider} />

          <Text style={styles.reflectionLabel}>Reflection</Text>
          <Text style={styles.reflectionText}>
            {todayScripture.reflection}
          </Text>

          <View style={styles.cardActions}>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => handleSave(todayScripture.id)}
              testID="save-today"
            >
              <Bookmark
                size={20}
                color={
                  savedIds.includes(todayScripture.id)
                    ? Colors.primary
                    : Colors.textSecondary
                }
                fill={
                  savedIds.includes(todayScripture.id)
                    ? Colors.primary
                    : "transparent"
                }
              />
              <Text
                style={[
                  styles.actionText,
                  savedIds.includes(todayScripture.id) && {
                    color: Colors.primary,
                  },
                ]}
              >
                {savedIds.includes(todayScripture.id) ? "Saved" : "Save"}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => handleShare(todayScripture)}
              testID="share-today"
            >
              <Share2 size={20} color={Colors.textSecondary} />
              <Text style={styles.actionText}>Share</Text>
            </TouchableOpacity>
          </View>
        </Animated.View>

        <View style={styles.pastSection}>
          <Text style={styles.pastTitle}>Previous Days</Text>
          {pastScriptures.map((scripture) => (
            <TouchableOpacity
              key={scripture.id}
              style={styles.pastCard}
              activeOpacity={0.7}
              testID={`past-${scripture.id}`}
            >
              <View style={styles.pastCardLeft}>
                <View style={styles.pastTopicBadge}>
                  <Text style={styles.pastTopicText}>{scripture.topic}</Text>
                </View>
                <Text style={styles.pastDate}>{scripture.date}</Text>
                <Text style={styles.pastVerse} numberOfLines={2}>
                  "{scripture.verse}"
                </Text>
                <Text style={styles.pastReference}>
                  {scripture.reference}
                </Text>
              </View>
              <ChevronRight size={18} color={Colors.textTertiary} />
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scrollContent: {
    paddingBottom: 32,
  },
  header: {
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 8,
  },
  greeting: {
    fontSize: 15,
    color: Colors.primary,
    fontWeight: "500" as const,
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: "700" as const,
    color: Colors.text,
    letterSpacing: -0.5,
  },
  headerDate: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginTop: 4,
  },
  todayCard: {
    marginHorizontal: 20,
    marginTop: 24,
    backgroundColor: Colors.white,
    borderRadius: 20,
    padding: 24,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  topicBadge: {
    alignSelf: "flex-start",
    backgroundColor: Colors.surfaceAlt,
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 20,
    marginBottom: 20,
  },
  topicText: {
    fontSize: 12,
    fontWeight: "600" as const,
    color: Colors.primary,
    textTransform: "uppercase" as const,
    letterSpacing: 1,
  },
  verseText: {
    fontSize: 20,
    lineHeight: 32,
    color: Colors.text,
    fontWeight: "400" as const,
    fontStyle: "italic" as const,
    letterSpacing: 0.2,
  },
  referenceText: {
    fontSize: 14,
    fontWeight: "600" as const,
    color: Colors.primary,
    marginTop: 16,
  },
  divider: {
    height: 1,
    backgroundColor: Colors.borderLight,
    marginVertical: 20,
  },
  reflectionLabel: {
    fontSize: 11,
    fontWeight: "700" as const,
    color: Colors.textTertiary,
    textTransform: "uppercase" as const,
    letterSpacing: 1.5,
    marginBottom: 8,
  },
  reflectionText: {
    fontSize: 15,
    lineHeight: 24,
    color: Colors.textSecondary,
  },
  cardActions: {
    flexDirection: "row" as const,
    gap: 24,
    marginTop: 20,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: Colors.borderLight,
  },
  actionButton: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    gap: 6,
  },
  actionText: {
    fontSize: 14,
    color: Colors.textSecondary,
    fontWeight: "500" as const,
  },
  pastSection: {
    paddingHorizontal: 20,
    marginTop: 36,
  },
  pastTitle: {
    fontSize: 20,
    fontWeight: "700" as const,
    color: Colors.text,
    marginBottom: 16,
    letterSpacing: -0.3,
  },
  pastCard: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    backgroundColor: Colors.white,
    borderRadius: 16,
    padding: 18,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  pastCardLeft: {
    flex: 1,
    marginRight: 12,
  },
  pastTopicBadge: {
    alignSelf: "flex-start",
    backgroundColor: Colors.surfaceAlt,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
    marginBottom: 8,
  },
  pastTopicText: {
    fontSize: 10,
    fontWeight: "600" as const,
    color: Colors.primaryDark,
    textTransform: "uppercase" as const,
    letterSpacing: 0.8,
  },
  pastDate: {
    fontSize: 12,
    color: Colors.textTertiary,
    marginBottom: 6,
  },
  pastVerse: {
    fontSize: 14,
    lineHeight: 20,
    color: Colors.text,
    fontStyle: "italic" as const,
  },
  pastReference: {
    fontSize: 12,
    fontWeight: "600" as const,
    color: Colors.primary,
    marginTop: 6,
  },
});
