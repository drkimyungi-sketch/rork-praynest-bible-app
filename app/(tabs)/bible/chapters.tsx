import React, { useState, useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  FlatList,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useLocalSearchParams, useRouter, Stack } from "expo-router";
import { ArrowLeft, BookOpen } from "lucide-react-native";

import Colors from "@/constants/colors";
import { sampleVerses } from "@/mocks/bible";

export default function ChaptersScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { bookName, chapters, bookId: _bookId } = useLocalSearchParams<{
    bookName: string;
    chapters: string;
    bookId: string;
  }>();

  const [selectedChapter, setSelectedChapter] = useState<number | null>(null);
  const chapterCount = parseInt(chapters || "1", 10);

  const chapterNumbers = useMemo(
    () => Array.from({ length: chapterCount }, (_, i) => i + 1),
    [chapterCount]
  );

  const getSampleVersesForChapter = (book: string, chapter: number): string[] => {
    const key = `${book}_${chapter}`;
    if (sampleVerses[key]) return sampleVerses[key];
    return [
      "And it came to pass in those days, that the word of the Lord was upon the people.",
      "For the Lord is gracious and merciful, slow to anger, and of great kindness.",
      "Blessed are they that keep his testimonies, and that seek him with the whole heart.",
      "The heavens declare the glory of God; and the firmament sheweth his handywork.",
      "Day unto day uttereth speech, and night unto night sheweth knowledge.",
      "There is no speech nor language, where their voice is not heard.",
      "Their line is gone out through all the earth, and their words to the end of the world.",
      "In them hath he set a tabernacle for the sun.",
      "Which is as a bridegroom coming out of his chamber, and rejoiceth as a strong man to run a race.",
      "His going forth is from the end of the heaven, and his circuit unto the ends of it.",
    ];
  };

  const verses = selectedChapter
    ? getSampleVersesForChapter(bookName || "", selectedChapter)
    : [];

  if (selectedChapter !== null) {
    return (
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <Stack.Screen options={{ headerShown: false }} />
        <View style={styles.readerHeader}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => setSelectedChapter(null)}
            testID="back-to-chapters"
          >
            <ArrowLeft size={22} color={Colors.text} />
          </TouchableOpacity>
          <View style={styles.readerTitleContainer}>
            <Text style={styles.readerTitle}>
              {bookName} {selectedChapter}
            </Text>
          </View>
          <View style={styles.backButton} />
        </View>

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.versesContent}
        >
          {verses.map((verse, index) => (
            <View key={index} style={styles.verseRow}>
              <Text style={styles.verseNumber}>{index + 1}</Text>
              <Text style={styles.verseText}>{verse}</Text>
            </View>
          ))}
        </ScrollView>
      </View>
    );
  }

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <Stack.Screen options={{ headerShown: false }} />
      <View style={styles.chapterHeader}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
          testID="back-to-books"
        >
          <ArrowLeft size={22} color={Colors.text} />
        </TouchableOpacity>
        <View style={styles.chapterHeaderInfo}>
          <Text style={styles.chapterHeaderTitle}>{bookName}</Text>
          <Text style={styles.chapterHeaderSub}>
            {chapterCount} chapter{chapterCount > 1 ? "s" : ""}
          </Text>
        </View>
        <View style={styles.headerIconWrapper}>
          <BookOpen size={20} color={Colors.primary} />
        </View>
      </View>

      <Text style={styles.selectLabel}>Select a chapter</Text>

      <FlatList
        data={chapterNumbers}
        numColumns={5}
        keyExtractor={(item) => item.toString()}
        contentContainerStyle={styles.chaptersGrid}
        columnWrapperStyle={styles.chapterRow}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.chapterCell}
            onPress={() => setSelectedChapter(item)}
            activeOpacity={0.6}
            testID={`chapter-${item}`}
          >
            <Text style={styles.chapterCellText}>{item}</Text>
          </TouchableOpacity>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  chapterHeader: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center" as const,
    justifyContent: "center" as const,
  },
  chapterHeaderInfo: {
    flex: 1,
    marginLeft: 8,
  },
  chapterHeaderTitle: {
    fontSize: 22,
    fontWeight: "700" as const,
    color: Colors.text,
  },
  chapterHeaderSub: {
    fontSize: 13,
    color: Colors.textTertiary,
    marginTop: 1,
  },
  headerIconWrapper: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: Colors.surfaceAlt,
    alignItems: "center" as const,
    justifyContent: "center" as const,
  },
  selectLabel: {
    fontSize: 14,
    fontWeight: "600" as const,
    color: Colors.textTertiary,
    textTransform: "uppercase" as const,
    letterSpacing: 0.8,
    marginHorizontal: 24,
    marginTop: 20,
    marginBottom: 16,
  },
  chaptersGrid: {
    paddingHorizontal: 20,
    paddingBottom: 32,
  },
  chapterRow: {
    gap: 10,
    marginBottom: 10,
  },
  chapterCell: {
    flex: 1,
    aspectRatio: 1,
    maxWidth: "18%",
    backgroundColor: Colors.surface,
    borderRadius: 14,
    alignItems: "center" as const,
    justifyContent: "center" as const,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  chapterCellText: {
    fontSize: 16,
    fontWeight: "600" as const,
    color: Colors.text,
  },
  readerHeader: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight,
  },
  readerTitleContainer: {
    flex: 1,
    alignItems: "center" as const,
  },
  readerTitle: {
    fontSize: 18,
    fontWeight: "700" as const,
    color: Colors.text,
  },
  versesContent: {
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 40,
  },
  verseRow: {
    flexDirection: "row" as const,
    marginBottom: 8,
  },
  verseNumber: {
    fontSize: 11,
    fontWeight: "700" as const,
    color: Colors.primary,
    width: 24,
    marginTop: 4,
  },
  verseText: {
    flex: 1,
    fontSize: 17,
    lineHeight: 28,
    color: Colors.text,
    letterSpacing: 0.1,
  },
});
