import React, { useRef, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Alert,
  Platform,
  Animated,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useRouter, Stack } from "expo-router";
import {
  X,
  Crown,
  Infinity as InfinityIcon,
  MessageCircle,
  BrainCircuit,
  ShieldOff,
  Check,
} from "lucide-react-native";
import * as Haptics from "expo-haptics";

import Colors from "@/constants/colors";
import { useSubscription } from "@/providers/SubscriptionProvider";

const FEATURES = [
  {
    icon: InfinityIcon,
    title: "Unlimited Bible Trivia",
    description: "Play as many rounds as you want",
    color: "#C8A96E",
  },
  {
    icon: MessageCircle,
    title: "Unlimited AI Chat",
    description: "No limits on conversations with your AI friend",
    color: "#5A7D8B",
  },
  {
    icon: ShieldOff,
    title: "No Ads",
    description: "Enjoy a clean, distraction-free experience",
    color: "#6B8E5A",
  },
  {
    icon: BrainCircuit,
    title: "All Devotions & Journals",
    description: "Full access to every prayer journal and devotion",
    color: "#8B7355",
  },
];

export default function PaywallScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const {
    purchase,
    isPurchasing,
    restore,
    isRestoring,
    offering,
    isPremium,
  } = useSubscription();

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const featureAnims = useRef(FEATURES.map(() => new Animated.Value(0))).current;
  const buttonScale = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 450,
        useNativeDriver: true,
      }),
    ]).start();

    featureAnims.forEach((anim, i) => {
      Animated.timing(anim, {
        toValue: 1,
        duration: 400,
        delay: 200 + i * 100,
        useNativeDriver: true,
      }).start();
    });
  }, [fadeAnim, slideAnim, featureAnims]);

  const monthlyPackage = offering?.availablePackages?.[0];
  const priceString = monthlyPackage?.product?.priceString ?? "$4.99";

  const handlePurchase = async () => {
    if (Platform.OS !== "web") {
      void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }

    Animated.sequence([
      Animated.timing(buttonScale, { toValue: 0.95, duration: 80, useNativeDriver: true }),
      Animated.timing(buttonScale, { toValue: 1, duration: 80, useNativeDriver: true }),
    ]).start();

    try {
      await purchase();
      if (Platform.OS !== "web") {
        void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }
      Alert.alert(
        "Welcome to Premium!",
        "You now have unlimited access to all features.",
        [{ text: "Let's Go!", onPress: () => router.back() }]
      );
    } catch (e: any) {
      if (e?.userCancelled) return;
      const message = e?.message ?? "Something went wrong. Please try again.";
      Alert.alert("Purchase Failed", message);
    }
  };

  const handleRestore = async () => {
    if (Platform.OS !== "web") {
      void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    try {
      const info = await restore();
      const hasPremium = info?.entitlements?.active?.premium?.isActive === true;
      if (hasPremium) {
        Alert.alert("Restored!", "Your premium access has been restored.", [
          { text: "Great!", onPress: () => router.back() },
        ]);
      } else {
        Alert.alert("No Purchase Found", "We couldn't find an active subscription for this account.");
      }
    } catch (e: any) {
      Alert.alert("Restore Failed", e?.message ?? "Please try again later.");
    }
  };

  if (isPremium) {
    return (
      <>
        <Stack.Screen options={{ headerShown: false }} />
        <View style={[styles.container, { paddingTop: insets.top }]}>
          <View style={styles.premiumActive}>
            <View style={styles.premiumIconWrap}>
              <Crown size={40} color={Colors.accent} />
            </View>
            <Text style={styles.premiumTitle}>You're Premium!</Text>
            <Text style={styles.premiumSubtitle}>
              You have unlimited access to all features.
            </Text>
            <TouchableOpacity
              style={styles.doneButton}
              onPress={() => router.back()}
            >
              <Text style={styles.doneButtonText}>Done</Text>
            </TouchableOpacity>
          </View>
        </View>
      </>
    );
  }

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <TouchableOpacity
          style={styles.closeButton}
          onPress={() => router.back()}
          testID="close-paywall"
        >
          <X size={22} color={Colors.textSecondary} />
        </TouchableOpacity>

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + 20 }]}
        >
          <Animated.View
            style={[
              styles.headerSection,
              { opacity: fadeAnim, transform: [{ translateY: slideAnim }] },
            ]}
          >
            <View style={styles.crownContainer}>
              <View style={styles.crownGlow} />
              <Crown size={44} color={Colors.accent} />
            </View>
            <Text style={styles.title}>Unlock PrayNest Premium</Text>
            <Text style={styles.subtitle}>
              Deepen your faith with unlimited access
            </Text>
          </Animated.View>

          <View style={styles.featuresContainer}>
            {FEATURES.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <Animated.View
                  key={feature.title}
                  style={[
                    styles.featureRow,
                    {
                      opacity: featureAnims[index],
                      transform: [
                        {
                          translateX: featureAnims[index].interpolate({
                            inputRange: [0, 1],
                            outputRange: [-30, 0],
                          }),
                        },
                      ],
                    },
                  ]}
                >
                  <View style={[styles.featureIcon, { backgroundColor: feature.color + "18" }]}>
                    <Icon size={20} color={feature.color} />
                  </View>
                  <View style={styles.featureText}>
                    <Text style={styles.featureTitle}>{feature.title}</Text>
                    <Text style={styles.featureDescription}>
                      {feature.description}
                    </Text>
                  </View>
                  <Check size={18} color={Colors.correct} />
                </Animated.View>
              );
            })}
          </View>

          <View style={styles.priceCard}>
            <View style={styles.priceHeader}>
              <Text style={styles.priceLabel}>Monthly</Text>
              <View style={styles.priceBadge}>
                <Text style={styles.priceBadgeText}>Best Value</Text>
              </View>
            </View>
            <View style={styles.priceRow}>
              <Text style={styles.priceAmount}>{priceString}</Text>
              <Text style={styles.pricePeriod}>/month</Text>
            </View>
            <Text style={styles.priceNote}>Cancel anytime</Text>
          </View>

          <Animated.View style={{ transform: [{ scale: buttonScale }] }}>
            <TouchableOpacity
              style={styles.purchaseButton}
              onPress={handlePurchase}
              disabled={isPurchasing || isRestoring}
              activeOpacity={0.85}
              testID="purchase-button"
            >
              {isPurchasing ? (
                <ActivityIndicator color="#FFF" size="small" />
              ) : (
                <>
                  <Crown size={18} color="#FFF" />
                  <Text style={styles.purchaseButtonText}>
                    Subscribe for {priceString}/mo
                  </Text>
                </>
              )}
            </TouchableOpacity>
          </Animated.View>

          <TouchableOpacity
            style={styles.restoreButton}
            onPress={handleRestore}
            disabled={isPurchasing || isRestoring}
            testID="restore-button"
          >
            {isRestoring ? (
              <ActivityIndicator color={Colors.textSecondary} size="small" />
            ) : (
              <Text style={styles.restoreText}>Restore Purchases</Text>
            )}
          </TouchableOpacity>

          <Text style={styles.legalText}>
            Payment will be charged to your account at confirmation of purchase.
            Subscription automatically renews unless auto-renew is turned off at
            least 24 hours before the end of the current period.
          </Text>
        </ScrollView>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  closeButton: {
    position: "absolute" as const,
    top: 56,
    right: 20,
    zIndex: 10,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.surface,
    alignItems: "center" as const,
    justifyContent: "center" as const,
  },
  scrollContent: {
    paddingHorizontal: 24,
  },
  headerSection: {
    alignItems: "center" as const,
    paddingTop: 40,
    paddingBottom: 32,
  },
  crownContainer: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: Colors.accentLight,
    alignItems: "center" as const,
    justifyContent: "center" as const,
    marginBottom: 20,
  },
  crownGlow: {
    position: "absolute" as const,
    width: 110,
    height: 110,
    borderRadius: 55,
    backgroundColor: Colors.accent + "10",
  },
  title: {
    fontSize: 26,
    fontWeight: "800" as const,
    color: Colors.text,
    textAlign: "center" as const,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 16,
    color: Colors.textSecondary,
    textAlign: "center" as const,
    marginTop: 8,
    lineHeight: 24,
  },
  featuresContainer: {
    gap: 4,
    marginBottom: 28,
  },
  featureRow: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    paddingVertical: 14,
    paddingHorizontal: 16,
    backgroundColor: Colors.white,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: Colors.borderLight,
  },
  featureIcon: {
    width: 42,
    height: 42,
    borderRadius: 12,
    alignItems: "center" as const,
    justifyContent: "center" as const,
    marginRight: 14,
  },
  featureText: {
    flex: 1,
  },
  featureTitle: {
    fontSize: 15,
    fontWeight: "600" as const,
    color: Colors.text,
  },
  featureDescription: {
    fontSize: 13,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  priceCard: {
    backgroundColor: Colors.surface,
    borderRadius: 18,
    padding: 20,
    marginBottom: 24,
    borderWidth: 2,
    borderColor: Colors.accent,
  },
  priceHeader: {
    flexDirection: "row" as const,
    justifyContent: "space-between" as const,
    alignItems: "center" as const,
    marginBottom: 8,
  },
  priceLabel: {
    fontSize: 15,
    fontWeight: "600" as const,
    color: Colors.textSecondary,
  },
  priceBadge: {
    backgroundColor: Colors.accent + "20",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
  },
  priceBadgeText: {
    fontSize: 12,
    fontWeight: "700" as const,
    color: Colors.accent,
  },
  priceRow: {
    flexDirection: "row" as const,
    alignItems: "baseline" as const,
  },
  priceAmount: {
    fontSize: 32,
    fontWeight: "800" as const,
    color: Colors.text,
  },
  pricePeriod: {
    fontSize: 16,
    fontWeight: "500" as const,
    color: Colors.textSecondary,
    marginLeft: 4,
  },
  priceNote: {
    fontSize: 13,
    color: Colors.textTertiary,
    marginTop: 6,
  },
  purchaseButton: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    justifyContent: "center" as const,
    backgroundColor: Colors.accent,
    borderRadius: 16,
    paddingVertical: 18,
    gap: 8,
  },
  purchaseButtonText: {
    fontSize: 17,
    fontWeight: "700" as const,
    color: "#FFF",
  },
  restoreButton: {
    alignItems: "center" as const,
    paddingVertical: 16,
  },
  restoreText: {
    fontSize: 14,
    fontWeight: "600" as const,
    color: Colors.textSecondary,
  },
  legalText: {
    fontSize: 11,
    color: Colors.textTertiary,
    textAlign: "center" as const,
    lineHeight: 16,
    paddingHorizontal: 12,
  },
  premiumActive: {
    flex: 1,
    justifyContent: "center" as const,
    alignItems: "center" as const,
    paddingHorizontal: 40,
  },
  premiumIconWrap: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: Colors.accentLight,
    alignItems: "center" as const,
    justifyContent: "center" as const,
    marginBottom: 20,
  },
  premiumTitle: {
    fontSize: 26,
    fontWeight: "800" as const,
    color: Colors.text,
    marginBottom: 8,
  },
  premiumSubtitle: {
    fontSize: 16,
    color: Colors.textSecondary,
    textAlign: "center" as const,
    lineHeight: 24,
    marginBottom: 32,
  },
  doneButton: {
    backgroundColor: Colors.primary,
    borderRadius: 16,
    paddingVertical: 16,
    paddingHorizontal: 48,
  },
  doneButtonText: {
    fontSize: 17,
    fontWeight: "700" as const,
    color: Colors.white,
  },
});
