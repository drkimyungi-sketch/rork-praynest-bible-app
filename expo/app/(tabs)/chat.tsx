import React, { useRef, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Animated,
  Platform,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Sparkles, BookHeart, Sun, ChevronRight } from "lucide-react-native";
import { useRouter } from "expo-router";
import * as Haptics from "expo-haptics";

import Colors from "@/constants/colors";

interface CategoryCard {
  id: string;
  title: string;
  subtitle: string;
  image: string;
  route: string;
  accent: string;
}

const AI_FRIEND: CategoryCard = {
  id: "ai-friend",
  title: "AI Bible Friend",
  subtitle: "Ask questions, seek guidance, or chat about Scripture",
  image: "https://r2-pub.rork.com/projects/q8oy0hn141gbdypujgte7/assets/56246015-77a6-472b-af49-7455f59769fb.png",
  route: "/ai-chat",
  accent: "#C8A96E",
};

const PRAYER_JOURNALS: CategoryCard[] = [
  {
    id: "healing",
    title: "Healing My Pain",
    subtitle: "Find comfort and restoration through prayer",
    image: "https://r2-pub.rork.com/projects/q8oy0hn141gbdypujgte7/assets/fbceed14-7136-4a8d-8977-79dd8b3725f7.png",
    route: "/ai-chat",
    accent: "#8B7355",
  },
  {
    id: "gratitude",
    title: "Gratitude Journal",
    subtitle: "Count your blessings and give thanks",
    image: "https://r2-pub.rork.com/projects/q8oy0hn141gbdypujgte7/assets/e23e8bb2-8afb-408c-8312-aeaa57529174.png",
    route: "/ai-chat",
    accent: "#6B8E5A",
  },
];

const DEVOTIONS: CategoryCard[] = [
  {
    id: "daily-devotion",
    title: "Daily Devotion",
    subtitle: "Personalized scripture and reflection for today",
    image: "https://r2-pub.rork.com/projects/q8oy0hn141gbdypujgte7/assets/d68537f5-1ffe-4781-ad5b-b15fb6d1a202.png",
    route: "/ai-chat",
    accent: "#9B7E5E",
  },
  {
    id: "strength",
    title: "Strength & Courage",
    subtitle: "Be strong in the Lord and His mighty power",
    image: "https://r2-pub.rork.com/projects/q8oy0hn141gbdypujgte7/assets/ed575219-a58a-40dc-a105-8c039fb882d2.png",
    route: "/ai-chat",
    accent: "#5A7D8B",
  },
  {
    id: "prayer-life",
    title: "Deeper Prayer Life",
    subtitle: "Grow closer to God through guided prayer",
    image: "https://r2-pub.rork.com/projects/q8oy0hn141gbdypujgte7/assets/1ef0190a-1645-4a9e-b0a0-9ce8bfe11e60.png",
    route: "/ai-chat",
    accent: "#7B6B8D",
  },
];

function AnimatedCard({ children, index }: { children: React.ReactNode; index: number }) {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(40)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 500,
        delay: index * 100,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 400,
        delay: index * 100,
        useNativeDriver: true,
      }),
    ]).start();
  }, [fadeAnim, slideAnim, index]);

  return (
    <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}>
      {children}
    </Animated.View>
  );
}

export default function ChatHubScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();

  const handlePress = (card: CategoryCard) => {
    if (Platform.OS !== "web") {
      void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    router.push({
      pathname: "/ai-chat" as any,
      params: { topic: card.id, title: card.title },
    });
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Explore</Text>
          <Text style={styles.headerSubtitle}>Your spiritual companion & journals</Text>
        </View>

        <AnimatedCard index={0}>
          <TouchableOpacity
            style={styles.heroCard}
            activeOpacity={0.85}
            onPress={() => handlePress(AI_FRIEND)}
            testID="ai-friend-card"
          >
            <Image
              source={{ uri: AI_FRIEND.image }}
              style={styles.heroImage}
            />
            <View style={styles.heroOverlay} />
            <View style={styles.heroContent}>
              <View style={styles.heroBadge}>
                <Sparkles size={14} color="#FFF" />
                <Text style={styles.heroBadgeText}>AI Powered</Text>
              </View>
              <Text style={styles.heroTitle}>{AI_FRIEND.title}</Text>
              <Text style={styles.heroSubtitle}>{AI_FRIEND.subtitle}</Text>
              <View style={styles.heroAction}>
                <Text style={styles.heroActionText}>Start chatting</Text>
                <ChevronRight size={16} color="#FFF" />
              </View>
            </View>
          </TouchableOpacity>
        </AnimatedCard>

        <AnimatedCard index={1}>
          <View style={styles.sectionHeader}>
            <BookHeart size={18} color={Colors.text} />
            <Text style={styles.sectionTitle}>Prayer Journals</Text>
          </View>
        </AnimatedCard>

        <View style={styles.journalGrid}>
          {PRAYER_JOURNALS.map((journal, index) => (
            <AnimatedCard key={journal.id} index={index + 2}>
              <TouchableOpacity
                style={styles.journalCard}
                activeOpacity={0.85}
                onPress={() => handlePress(journal)}
                testID={`journal-${journal.id}`}
              >
                <Image
                  source={{ uri: journal.image }}
                  style={styles.journalImage}
                />
                <View style={styles.journalOverlay} />
                <View style={styles.journalContent}>
                  <Text style={styles.journalTitle}>{journal.title}</Text>
                  <Text style={styles.journalSubtitle} numberOfLines={2}>
                    {journal.subtitle}
                  </Text>
                </View>
              </TouchableOpacity>
            </AnimatedCard>
          ))}
        </View>

        <AnimatedCard index={4}>
          <View style={styles.sectionHeader}>
            <Sun size={18} color={Colors.text} />
            <Text style={styles.sectionTitle}>Personalized Devotions</Text>
          </View>
        </AnimatedCard>

        {DEVOTIONS.map((devotion, index) => (
          <AnimatedCard key={devotion.id} index={index + 5}>
            <TouchableOpacity
              style={styles.devotionCard}
              activeOpacity={0.85}
              onPress={() => handlePress(devotion)}
              testID={`devotion-${devotion.id}`}
            >
              <Image
                source={{ uri: devotion.image }}
                style={styles.devotionImage}
              />
              <View style={styles.devotionInfo}>
                <Text style={styles.devotionTitle}>{devotion.title}</Text>
                <Text style={styles.devotionSubtitle} numberOfLines={2}>
                  {devotion.subtitle}
                </Text>
              </View>
              <ChevronRight size={18} color={Colors.textTertiary} />
            </TouchableOpacity>
          </AnimatedCard>
        ))}

        <View style={{ height: 32 }} />
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
    paddingBottom: 20,
  },
  header: {
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 20,
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: "700" as const,
    color: Colors.text,
    letterSpacing: -0.5,
  },
  headerSubtitle: {
    fontSize: 15,
    color: Colors.textSecondary,
    marginTop: 4,
  },
  heroCard: {
    marginHorizontal: 20,
    borderRadius: 20,
    overflow: "hidden" as const,
    height: 200,
  },
  heroImage: {
    width: "100%",
    height: "100%",
    position: "absolute" as const,
  },
  heroOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.45)",
  },
  heroContent: {
    flex: 1,
    justifyContent: "flex-end" as const,
    padding: 20,
  },
  heroBadge: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    gap: 6,
    backgroundColor: "rgba(255,255,255,0.2)",
    alignSelf: "flex-start" as const,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
    marginBottom: 10,
  },
  heroBadgeText: {
    fontSize: 12,
    fontWeight: "600" as const,
    color: "#FFF",
  },
  heroTitle: {
    fontSize: 24,
    fontWeight: "700" as const,
    color: "#FFF",
    letterSpacing: -0.3,
  },
  heroSubtitle: {
    fontSize: 14,
    color: "rgba(255,255,255,0.85)",
    marginTop: 4,
    lineHeight: 20,
  },
  heroAction: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    gap: 4,
    marginTop: 12,
  },
  heroActionText: {
    fontSize: 14,
    fontWeight: "600" as const,
    color: "#FFF",
  },
  sectionHeader: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    gap: 8,
    paddingHorizontal: 24,
    marginTop: 28,
    marginBottom: 14,
  },
  sectionTitle: {
    fontSize: 19,
    fontWeight: "700" as const,
    color: Colors.text,
    letterSpacing: -0.3,
  },
  journalGrid: {
    flexDirection: "row" as const,
    paddingHorizontal: 20,
    gap: 12,
  },
  journalCard: {
    flex: 1,
    borderRadius: 16,
    overflow: "hidden" as const,
    height: 180,
  },
  journalImage: {
    width: "100%",
    height: "100%",
    position: "absolute" as const,
  },
  journalOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.35)",
  },
  journalContent: {
    flex: 1,
    justifyContent: "flex-end" as const,
    padding: 14,
  },
  journalTitle: {
    fontSize: 16,
    fontWeight: "700" as const,
    color: "#FFF",
    letterSpacing: -0.2,
  },
  journalSubtitle: {
    fontSize: 12,
    color: "rgba(255,255,255,0.8)",
    marginTop: 3,
    lineHeight: 16,
  },
  devotionCard: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    marginHorizontal: 20,
    marginBottom: 12,
    backgroundColor: Colors.white,
    borderRadius: 16,
    padding: 12,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  devotionImage: {
    width: 64,
    height: 64,
    borderRadius: 12,
  },
  devotionInfo: {
    flex: 1,
    marginLeft: 14,
    marginRight: 8,
  },
  devotionTitle: {
    fontSize: 15,
    fontWeight: "600" as const,
    color: Colors.text,
    letterSpacing: -0.2,
  },
  devotionSubtitle: {
    fontSize: 13,
    color: Colors.textSecondary,
    marginTop: 3,
    lineHeight: 18,
  },
});
