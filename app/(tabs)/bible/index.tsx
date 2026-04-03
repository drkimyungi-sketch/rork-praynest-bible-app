import React, { useState, useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  TextInput,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Search, X } from "lucide-react-native";
import { useRouter } from "expo-router";

import Colors from "@/constants/colors";
import { bibleBooks, BibleBook } from "@/mocks/bible";

export default function BibleScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const [activeTestament, setActiveTestament] = useState<"old" | "new">("old");
  const [searchQuery, setSearchQuery] = useState("");

  const filteredBooks = useMemo(() => {
    const books = bibleBooks.filter((b) => b.testament === activeTestament);
    if (!searchQuery.trim()) return books;
    return books.filter((b) =>
      b.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [activeTestament, searchQuery]);

  const handleBookPress = (book: BibleBook) => {
    router.push({
      pathname: "/bible/chapters",
      params: { bookId: book.id.toString(), bookName: book.name, chapters: book.chapters.toString() },
    });
  };

  const renderBookItem = ({ item, index }: { item: BibleBook; index: number }) => (
    <TouchableOpacity
      style={styles.bookItem}
      onPress={() => handleBookPress(item)}
      activeOpacity={0.6}
      testID={`book-${item.id}`}
    >
      <View style={styles.bookNumber}>
        <Text style={styles.bookNumberText}>{index + 1}</Text>
      </View>
      <View style={styles.bookInfo}>
        <Text style={styles.bookName}>{item.name}</Text>
        <Text style={styles.bookChapters}>
          {item.chapters} chapter{item.chapters > 1 ? "s" : ""}
        </Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Bible</Text>
      </View>

      <View style={styles.searchContainer}>
        <View style={styles.searchBar}>
          <Search size={18} color={Colors.textTertiary} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search books..."
            placeholderTextColor={Colors.textTertiary}
            value={searchQuery}
            onChangeText={setSearchQuery}
            testID="search-input"
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery("")}>
              <X size={18} color={Colors.textTertiary} />
            </TouchableOpacity>
          )}
        </View>
      </View>

      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[
            styles.tab,
            activeTestament === "old" && styles.tabActive,
          ]}
          onPress={() => setActiveTestament("old")}
          testID="old-testament-tab"
        >
          <Text
            style={[
              styles.tabText,
              activeTestament === "old" && styles.tabTextActive,
            ]}
          >
            Old Testament
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.tab,
            activeTestament === "new" && styles.tabActive,
          ]}
          onPress={() => setActiveTestament("new")}
          testID="new-testament-tab"
        >
          <Text
            style={[
              styles.tabText,
              activeTestament === "new" && styles.tabTextActive,
            ]}
          >
            New Testament
          </Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={filteredBooks}
        renderItem={renderBookItem}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        testID="books-list"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
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
  searchContainer: {
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  searchBar: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    backgroundColor: Colors.surface,
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: Colors.border,
    gap: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: Colors.text,
    padding: 0,
  },
  tabContainer: {
    flexDirection: "row" as const,
    marginHorizontal: 20,
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: 4,
    marginBottom: 8,
  },
  tab: {
    flex: 1,
    paddingVertical: 10,
    alignItems: "center" as const,
    borderRadius: 10,
  },
  tabActive: {
    backgroundColor: Colors.white,
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  tabText: {
    fontSize: 14,
    fontWeight: "600" as const,
    color: Colors.textTertiary,
  },
  tabTextActive: {
    color: Colors.text,
  },
  listContent: {
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 24,
  },
  bookItem: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight,
  },
  bookNumber: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.surfaceAlt,
    alignItems: "center" as const,
    justifyContent: "center" as const,
    marginRight: 14,
  },
  bookNumberText: {
    fontSize: 12,
    fontWeight: "600" as const,
    color: Colors.primaryDark,
  },
  bookInfo: {
    flex: 1,
  },
  bookName: {
    fontSize: 16,
    fontWeight: "500" as const,
    color: Colors.text,
  },
  bookChapters: {
    fontSize: 13,
    color: Colors.textTertiary,
    marginTop: 2,
  },
});
