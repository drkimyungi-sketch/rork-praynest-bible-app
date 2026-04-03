import React, { useEffect, useState, useCallback, useMemo } from "react";
import { Platform, AppState } from "react-native";
import Purchases, {
  CustomerInfo,
  PurchasesOffering,
} from "react-native-purchases";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import AsyncStorage from "@react-native-async-storage/async-storage";
import createContextHook from "@nkzw/create-context-hook";

const FREE_TRIVIA_LIMIT = 10;
const FREE_CHAT_LIMIT = 5;
const TRIVIA_COUNT_KEY = "praynest_trivia_count";
const CHAT_COUNT_KEY = "praynest_chat_count";
const ENTITLEMENT_ID = "premium";

function getRCToken() {
  if (__DEV__ || Platform.OS === "web")
    return process.env.EXPO_PUBLIC_REVENUECAT_TEST_API_KEY;
  return Platform.select({
    ios: process.env.EXPO_PUBLIC_REVENUECAT_IOS_API_KEY,
    android: process.env.EXPO_PUBLIC_REVENUECAT_ANDROID_API_KEY,
    default: process.env.EXPO_PUBLIC_REVENUECAT_TEST_API_KEY,
  });
}

let rcConfigured = false;
const apiKey = getRCToken();
if (apiKey) {
  try {
    Purchases.configure({ apiKey });
    rcConfigured = true;
    console.log("[RC] RevenueCat configured successfully");
  } catch (e) {
    console.log("[RC] RevenueCat configuration error:", e);
  }
}

export const [SubscriptionProvider, useSubscription] = createContextHook(() => {
  const queryClient = useQueryClient();
  const [triviaPlayed, setTriviaPlayed] = useState(0);
  const [chatMessagesSent, setChatMessagesSent] = useState(0);

  const customerInfoQuery = useQuery<CustomerInfo | null>({
    queryKey: ["customerInfo"],
    queryFn: async () => {
      if (!rcConfigured) return null;
      try {
        const info = await Purchases.getCustomerInfo();
        console.log("[RC] Customer info fetched:", JSON.stringify(info.entitlements.active));
        return info;
      } catch (e) {
        console.log("[RC] Error fetching customer info:", e);
        return null;
      }
    },
    staleTime: 1000 * 60 * 5,
  });

  useEffect(() => {
    const subscription = AppState.addEventListener("change", (nextState) => {
      if (nextState === "active") {
        console.log("[RC] App came to foreground, re-checking subscription");
        void queryClient.invalidateQueries({ queryKey: ["customerInfo"] });
      }
    });
    return () => subscription.remove();
  }, [queryClient]);

  const offeringsQuery = useQuery<PurchasesOffering | null>({
    queryKey: ["offerings"],
    queryFn: async () => {
      if (!rcConfigured) return null;
      try {
        const offerings = await Purchases.getOfferings();
        console.log("[RC] Offerings fetched:", JSON.stringify(offerings.current?.identifier));
        return offerings.current ?? null;
      } catch (e) {
        console.log("[RC] Error fetching offerings:", e);
        return null;
      }
    },
    staleTime: 1000 * 60 * 30,
  });

  const usageQuery = useQuery({
    queryKey: ["usageCounts"],
    queryFn: async () => {
      try {
        const [trivia, chat] = await Promise.all([
          AsyncStorage.getItem(TRIVIA_COUNT_KEY),
          AsyncStorage.getItem(CHAT_COUNT_KEY),
        ]);
        return {
          trivia: trivia ? parseInt(trivia, 10) : 0,
          chat: chat ? parseInt(chat, 10) : 0,
        };
      } catch {
        return { trivia: 0, chat: 0 };
      }
    },
  });

  useEffect(() => {
    if (usageQuery.data) {
      setTriviaPlayed(usageQuery.data.trivia);
      setChatMessagesSent(usageQuery.data.chat);
    }
  }, [usageQuery.data]);

  const isPremium =
    customerInfoQuery.data?.entitlements?.active?.[ENTITLEMENT_ID]?.isActive === true;

  const canPlayTrivia = isPremium || triviaPlayed < FREE_TRIVIA_LIMIT;
  const canSendChat = isPremium || chatMessagesSent < FREE_CHAT_LIMIT;
  const triviaRemaining = isPremium ? Infinity : Math.max(0, FREE_TRIVIA_LIMIT - triviaPlayed);
  const chatRemaining = isPremium ? Infinity : Math.max(0, FREE_CHAT_LIMIT - chatMessagesSent);

  const incrementTrivia = useCallback(async () => {
    if (isPremium) return;
    const newCount = triviaPlayed + 1;
    setTriviaPlayed(newCount);
    await AsyncStorage.setItem(TRIVIA_COUNT_KEY, String(newCount));
  }, [isPremium, triviaPlayed]);

  const incrementChat = useCallback(async () => {
    if (isPremium) return;
    const newCount = chatMessagesSent + 1;
    setChatMessagesSent(newCount);
    await AsyncStorage.setItem(CHAT_COUNT_KEY, String(newCount));
  }, [isPremium, chatMessagesSent]);

  const purchaseMutation = useMutation({
    mutationFn: async () => {
      if (!rcConfigured) throw new Error("RevenueCat not configured");
      const offerings = await Purchases.getOfferings();
      const monthlyPackage = offerings.current?.availablePackages?.[0];
      if (!monthlyPackage) throw new Error("No package available");
      const result = await Purchases.purchasePackage(monthlyPackage);
      console.log("[RC] Purchase successful:", JSON.stringify(result.customerInfo.entitlements.active));
      return result;
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["customerInfo"] });
    },
  });

  const restoreMutation = useMutation({
    mutationFn: async () => {
      if (!rcConfigured) throw new Error("RevenueCat not configured");
      const info = await Purchases.restorePurchases();
      console.log("[RC] Restore complete:", JSON.stringify(info.entitlements.active));
      return info;
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["customerInfo"] });
    },
  });

  return useMemo(() => ({
    isPremium,
    isLoading: customerInfoQuery.isLoading,
    offering: offeringsQuery.data,
    canPlayTrivia,
    canSendChat,
    triviaRemaining,
    chatRemaining,
    freeTriviaLimit: FREE_TRIVIA_LIMIT,
    freeChatLimit: FREE_CHAT_LIMIT,
    incrementTrivia,
    incrementChat,
    purchase: purchaseMutation.mutateAsync,
    isPurchasing: purchaseMutation.isPending,
    purchaseError: purchaseMutation.error,
    restore: restoreMutation.mutateAsync,
    isRestoring: restoreMutation.isPending,
  }), [
    isPremium,
    customerInfoQuery.isLoading,
    offeringsQuery.data,
    canPlayTrivia,
    canSendChat,
    triviaRemaining,
    chatRemaining,
    incrementTrivia,
    incrementChat,
    purchaseMutation.mutateAsync,
    purchaseMutation.isPending,
    purchaseMutation.error,
    restoreMutation.mutateAsync,
    restoreMutation.isPending,
  ]);
});
