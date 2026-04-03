import React from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Linking,
  Alert,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import {
  Bookmark,
  FileText,
  Highlighter,
  Shield,
  ChevronRight,
  Info,
  Star,
  Crown,
  RotateCcw,
} from "lucide-react-native";
import { useRouter } from "expo-router";
import { useSubscription } from "@/providers/SubscriptionProvider";

import Colors from "@/constants/colors";

interface MenuItem {
  id: string;
  icon: React.ReactNode;
  label: string;
  subtitle: string;
  onPress: () => void;
}

export default function MineScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { isPremium, restore, isRestoring } = useSubscription();

  const menuItems: MenuItem[] = [
    {
      id: "bookmarks",
      icon: <Bookmark size={20} color={Colors.primary} />,
      label: "Bookmarks",
      subtitle: "Your saved scriptures",
      onPress: () => console.log("Navigate to bookmarks"),
    },
    {
      id: "notes",
      icon: <FileText size={20} color={Colors.primary} />,
      label: "Notes",
      subtitle: "Personal study notes",
      onPress: () => console.log("Navigate to notes"),
    },
    {
      id: "highlights",
      icon: <Highlighter size={20} color={Colors.primary} />,
      label: "Highlights",
      subtitle: "Highlighted passages",
      onPress: () => console.log("Navigate to highlights"),
    },
  ];

  const subscriptionItems: MenuItem[] = [
    ...(!isPremium
      ? [
          {
            id: "restore",
            icon: <RotateCcw size={20} color={Colors.textSecondary} />,
            label: "Restore Purchases",
            subtitle: isRestoring ? "Restoring..." : "Restore a previous subscription",
            onPress: () => {
              void restore().then((info) => {
                const hasPremium = info?.entitlements?.active?.premium?.isActive === true;
                if (hasPremium) {
                  Alert.alert("Restored!", "Your premium access has been restored.");
                } else {
                  Alert.alert("No Purchase Found", "We couldn't find an active subscription.");
                }
              }).catch(() => {
                Alert.alert("Restore Failed", "Please try again later.");
              });
            },
          },
        ]
      : []),
  ];

  const settingsItems: MenuItem[] = [
    {
      id: "privacy",
      icon: <Shield size={20} color={Colors.textSecondary} />,
      label: "Privacy Policy",
      subtitle: "How we handle your data",
      onPress: () => {
        void Linking.openURL("https://praynest.app/privacy").catch(() =>
          console.log("Could not open privacy policy")
        );
      },
    },
    {
      id: "about",
      icon: <Info size={20} color={Colors.textSecondary} />,
      label: "About PrayNest",
      subtitle: "Version 1.0.0",
      onPress: () => console.log("About"),
    },
    {
      id: "rate",
      icon: <Star size={20} color={Colors.textSecondary} />,
      label: "Rate the App",
      subtitle: "Share your experience",
      onPress: () => console.log("Rate app"),
    },
  ];

  const renderMenuItem = (item: MenuItem) => (
    <TouchableOpacity
      key={item.id}
      style={styles.menuItem}
      onPress={item.onPress}
      activeOpacity={0.6}
      testID={`menu-${item.id}`}
    >
      <View style={styles.menuIcon}>{item.icon}</View>
      <View style={styles.menuInfo}>
        <Text style={styles.menuLabel}>{item.label}</Text>
        <Text style={styles.menuSubtitle}>{item.subtitle}</Text>
      </View>
      <ChevronRight size={18} color={Colors.textTertiary} />
    </TouchableOpacity>
  );

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Mine</Text>
        </View>

        <View style={styles.profileCard}>
          <View style={styles.avatarContainer}>
            <Text style={styles.avatarText}>P</Text>
          </View>
          <View style={styles.profileInfo}>
            <Text style={styles.profileName}>PrayNest User</Text>
            <Text style={styles.profileSubtitle}>
              Walking in faith, one verse at a time
            </Text>
          </View>
          {isPremium && (
            <View style={styles.premiumBadge}>
              <Crown size={12} color="#FFF" />
              <Text style={styles.premiumBadgeText}>Premium</Text>
            </View>
          )}
        </View>

        {!isPremium && (
          <TouchableOpacity
            style={styles.upgradeCard}
            onPress={() => router.push("/paywall")}
            activeOpacity={0.85}
            testID="upgrade-card"
          >
            <View style={styles.upgradeIconWrap}>
              <Crown size={22} color={Colors.accent} />
            </View>
            <View style={styles.upgradeInfo}>
              <Text style={styles.upgradeTitle}>Upgrade to Premium</Text>
              <Text style={styles.upgradeSubtitle}>
                Unlimited trivia, chat & no ads
              </Text>
            </View>
            <ChevronRight size={18} color={Colors.accent} />
          </TouchableOpacity>
        )}

        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>12</Text>
            <Text style={styles.statLabel}>Bookmarks</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>5</Text>
            <Text style={styles.statLabel}>Notes</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>8</Text>
            <Text style={styles.statLabel}>Highlights</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>My Content</Text>
          <View style={styles.menuContainer}>
            {menuItems.map(renderMenuItem)}
          </View>
        </View>

        {subscriptionItems.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Subscription</Text>
            <View style={styles.menuContainer}>
              {subscriptionItems.map(renderMenuItem)}
            </View>
          </View>
        )}

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Settings</Text>
          <View style={styles.menuContainer}>
            {settingsItems.map(renderMenuItem)}
          </View>
        </View>

        <Text style={styles.footer}>
          PrayNest — Your daily companion in faith
        </Text>
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
    paddingBottom: 40,
  },
  header: {
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 8,
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: "700" as const,
    color: Colors.text,
    letterSpacing: -0.5,
  },
  profileCard: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    marginHorizontal: 20,
    marginTop: 16,
    padding: 20,
    backgroundColor: Colors.surfaceAlt,
    borderRadius: 20,
    gap: 16,
  },
  avatarContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: Colors.primary,
    alignItems: "center" as const,
    justifyContent: "center" as const,
  },
  avatarText: {
    fontSize: 22,
    fontWeight: "700" as const,
    color: Colors.white,
  },
  profileInfo: {
    flex: 1,
  },
  profileName: {
    fontSize: 18,
    fontWeight: "700" as const,
    color: Colors.text,
  },
  profileSubtitle: {
    fontSize: 13,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  statsRow: {
    flexDirection: "row" as const,
    marginHorizontal: 20,
    marginTop: 16,
    gap: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: Colors.white,
    borderRadius: 16,
    padding: 16,
    alignItems: "center" as const,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: "700" as const,
    color: Colors.text,
  },
  statLabel: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: 4,
    fontWeight: "500" as const,
  },
  section: {
    marginTop: 28,
    paddingHorizontal: 20,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: "600" as const,
    color: Colors.textTertiary,
    textTransform: "uppercase" as const,
    letterSpacing: 0.8,
    marginBottom: 12,
    marginLeft: 4,
  },
  menuContainer: {
    backgroundColor: Colors.white,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.border,
    overflow: "hidden" as const,
  },
  menuItem: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight,
  },
  menuIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: Colors.surfaceAlt,
    alignItems: "center" as const,
    justifyContent: "center" as const,
    marginRight: 14,
  },
  menuInfo: {
    flex: 1,
  },
  menuLabel: {
    fontSize: 16,
    fontWeight: "500" as const,
    color: Colors.text,
  },
  menuSubtitle: {
    fontSize: 13,
    color: Colors.textTertiary,
    marginTop: 2,
  },
  footer: {
    textAlign: "center" as const,
    fontSize: 13,
    color: Colors.textTertiary,
    marginTop: 40,
    fontStyle: "italic" as const,
  },
  premiumBadge: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    backgroundColor: Colors.accent,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
    gap: 4,
  },
  premiumBadgeText: {
    fontSize: 11,
    fontWeight: "700" as const,
    color: "#FFF",
  },
  upgradeCard: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    marginHorizontal: 20,
    marginTop: 16,
    padding: 16,
    backgroundColor: Colors.accentLight,
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: Colors.accent + "40",
  },
  upgradeIconWrap: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.accent + "20",
    alignItems: "center" as const,
    justifyContent: "center" as const,
    marginRight: 14,
  },
  upgradeInfo: {
    flex: 1,
  },
  upgradeTitle: {
    fontSize: 16,
    fontWeight: "700" as const,
    color: Colors.text,
  },
  upgradeSubtitle: {
    fontSize: 13,
    color: Colors.textSecondary,
    marginTop: 2,
  },
});
