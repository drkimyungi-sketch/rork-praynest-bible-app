import React, { useState, useRef, useCallback, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Animated,
  Platform,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import {
  Trophy,
  ChevronRight,
  RotateCcw,
  BookOpen,
  Zap,
  Check,
  X,
} from "lucide-react-native";
import * as Haptics from "expo-haptics";

import Colors from "@/constants/colors";
import {
  triviaQuestions,
  triviaCategories,
  TriviaQuestion,
} from "@/mocks/trivia";
import { useSubscription } from "@/providers/SubscriptionProvider";
import { useRouter } from "expo-router";
import { Crown, Lock } from "lucide-react-native";

type GameState = "menu" | "playing" | "result";

export default function TriviaScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { canPlayTrivia, triviaRemaining, isPremium, incrementTrivia } = useSubscription();
  const [gameState, setGameState] = useState<GameState>("menu");
  const [activeCategory, setActiveCategory] = useState("All");
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [showExplanation, setShowExplanation] = useState(false);
  const [score, setScore] = useState(0);
  const [answered, setAnswered] = useState(0);
  const [questions, setQuestions] = useState<TriviaQuestion[]>([]);
  const [streak, setStreak] = useState(0);
  const [bestStreak, setBestStreak] = useState(0);

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;
  const optionAnims = useRef<Animated.Value[]>([]).current;
  const progressAnim = useRef(new Animated.Value(0)).current;
  const shakeAnim = useRef(new Animated.Value(0)).current;

  const animateIn = useCallback(() => {
    fadeAnim.setValue(0);
    slideAnim.setValue(30);
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 350,
        useNativeDriver: true,
      }),
    ]).start();
  }, [fadeAnim, slideAnim]);

  const animateOptions = useCallback(() => {
    const currentQ = questions[currentIndex];
    if (!currentQ) return;

    while (optionAnims.length < currentQ.options.length) {
      optionAnims.push(new Animated.Value(0));
    }

    optionAnims.forEach((a) => a.setValue(0));
    const animations = currentQ.options.map((_, i) =>
      Animated.timing(optionAnims[i], {
        toValue: 1,
        duration: 300,
        delay: i * 80,
        useNativeDriver: true,
      })
    );
    Animated.stagger(80, animations).start();
  }, [optionAnims, questions, currentIndex]);

  useEffect(() => {
    if (gameState === "playing") {
      animateIn();
      animateOptions();
      Animated.timing(progressAnim, {
        toValue: (currentIndex + 1) / questions.length,
        duration: 400,
        useNativeDriver: false,
      }).start();
    }
  }, [gameState, currentIndex, animateIn, animateOptions, progressAnim, questions.length]);

  const shuffleQuestions = useCallback(
    (category: string) => {
      let filtered =
        category === "All"
          ? [...triviaQuestions]
          : triviaQuestions.filter((q) => q.category === category);
      for (let i = filtered.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [filtered[i], filtered[j]] = [filtered[j], filtered[i]];
      }
      return filtered.slice(0, 10);
    },
    []
  );

  const startGame = useCallback(
    (category: string) => {
      if (!canPlayTrivia) {
        router.push("/paywall");
        return;
      }
      if (Platform.OS !== "web") {
        void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      }
      void incrementTrivia();
      const q = shuffleQuestions(category);
      setQuestions(q);
      setCurrentIndex(0);
      setScore(0);
      setAnswered(0);
      setSelectedAnswer(null);
      setShowExplanation(false);
      setStreak(0);
      setGameState("playing");
      progressAnim.setValue(0);
    },
    [shuffleQuestions, progressAnim, canPlayTrivia, incrementTrivia, router]
  );

  const handleAnswer = useCallback(
    (option: string) => {
      if (selectedAnswer) return;
      const currentQ = questions[currentIndex];
      if (!currentQ) return;

      setSelectedAnswer(option);
      const isCorrect = option === currentQ.answer;

      if (Platform.OS !== "web") {
        if (isCorrect) {
          void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        } else {
          void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
        }
      }

      if (isCorrect) {
        setScore((s) => s + 1);
        setStreak((s) => {
          const newStreak = s + 1;
          setBestStreak((b) => Math.max(b, newStreak));
          return newStreak;
        });
      } else {
        setStreak(0);
        Animated.sequence([
          Animated.timing(shakeAnim, { toValue: 10, duration: 50, useNativeDriver: true }),
          Animated.timing(shakeAnim, { toValue: -10, duration: 50, useNativeDriver: true }),
          Animated.timing(shakeAnim, { toValue: 6, duration: 50, useNativeDriver: true }),
          Animated.timing(shakeAnim, { toValue: -6, duration: 50, useNativeDriver: true }),
          Animated.timing(shakeAnim, { toValue: 0, duration: 50, useNativeDriver: true }),
        ]).start();
      }

      setAnswered((a) => a + 1);
      setShowExplanation(true);
    },
    [selectedAnswer, questions, currentIndex, shakeAnim]
  );

  const handleNext = useCallback(() => {
    if (Platform.OS !== "web") {
      void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    if (currentIndex + 1 >= questions.length) {
      setGameState("result");
    } else {
      setCurrentIndex((i) => i + 1);
      setSelectedAnswer(null);
      setShowExplanation(false);
    }
  }, [currentIndex, questions.length]);

  const currentQuestion = questions[currentIndex];

  const getScoreMessage = () => {
    const pct = questions.length > 0 ? score / questions.length : 0;
    if (pct === 1) return "Perfect score! You truly know your Bible!";
    if (pct >= 0.8) return "Amazing! You have great biblical knowledge!";
    if (pct >= 0.6) return "Well done! Keep studying the Word!";
    if (pct >= 0.4) return "Good effort! There's always more to learn!";
    return "Keep reading! The Bible has so much to discover!";
  };

  if (gameState === "menu") {
    return (
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          <View style={styles.header}>
            <Text style={styles.headerTitle}>Bible Trivia</Text>
            <Text style={styles.headerSubtitle}>
              Test your knowledge of Scripture
            </Text>
          </View>

          <View style={styles.heroSection}>
            <View style={styles.heroIconContainer}>
              <Trophy size={36} color={Colors.accent} />
            </View>
            <Text style={styles.heroTitle}>Ready to play?</Text>
            <Text style={styles.heroDescription}>
              Choose a category and answer 10 questions. See how well you know
              your Bible!
            </Text>
          </View>

          <View style={styles.categorySection}>
            <Text style={styles.sectionLabel}>Category</Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.categoryScroll}
            >
              {triviaCategories.map((cat) => (
                <TouchableOpacity
                  key={cat}
                  style={[
                    styles.categoryChip,
                    activeCategory === cat && styles.categoryChipActive,
                  ]}
                  onPress={() => setActiveCategory(cat)}
                  testID={`category-${cat}`}
                >
                  <Text
                    style={[
                      styles.categoryChipText,
                      activeCategory === cat && styles.categoryChipTextActive,
                    ]}
                  >
                    {cat}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>

          {!isPremium && (
            <View style={styles.limitBanner}>
              <Lock size={14} color={Colors.accent} />
              <Text style={styles.limitBannerText}>
                {canPlayTrivia
                  ? `${triviaRemaining} free rounds remaining`
                  : "Free rounds used up"}
              </Text>
              {!canPlayTrivia && (
                <TouchableOpacity
                  style={styles.upgradeChip}
                  onPress={() => router.push("/paywall")}
                >
                  <Crown size={12} color="#FFF" />
                  <Text style={styles.upgradeChipText}>Upgrade</Text>
                </TouchableOpacity>
              )}
            </View>
          )}

          <TouchableOpacity
            style={[styles.startButton, !canPlayTrivia && styles.startButtonDisabled]}
            onPress={() => startGame(activeCategory)}
            activeOpacity={0.85}
            testID="start-trivia"
          >
            <Zap size={20} color={Colors.white} />
            <Text style={styles.startButtonText}>
              {canPlayTrivia ? "Start Trivia" : "Unlock Premium"}
            </Text>
          </TouchableOpacity>

          <View style={styles.statsPreview}>
            <View style={styles.statBox}>
              <Text style={styles.statBoxNumber}>
                {triviaQuestions.length}
              </Text>
              <Text style={styles.statBoxLabel}>Questions</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statBox}>
              <Text style={styles.statBoxNumber}>
                {triviaCategories.length - 1}
              </Text>
              <Text style={styles.statBoxLabel}>Categories</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statBox}>
              <Text style={styles.statBoxNumber}>10</Text>
              <Text style={styles.statBoxLabel}>Per Round</Text>
            </View>
          </View>
        </ScrollView>
      </View>
    );
  }

  if (gameState === "result") {
    const pct = questions.length > 0 ? Math.round((score / questions.length) * 100) : 0;
    return (
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.resultContent}
        >
          <View style={styles.resultHeader}>
            <View style={styles.resultIconContainer}>
              <Trophy
                size={48}
                color={pct >= 60 ? Colors.correct : Colors.accent}
              />
            </View>
            <Text style={styles.resultTitle}>
              {pct >= 80 ? "Excellent!" : pct >= 60 ? "Great Job!" : "Good Try!"}
            </Text>
            <Text style={styles.resultMessage}>{getScoreMessage()}</Text>
          </View>

          <View style={styles.resultScoreCard}>
            <View style={styles.resultScoreRow}>
              <Text style={styles.resultScoreLabel}>Score</Text>
              <Text style={styles.resultScoreValue}>
                {score}/{questions.length}
              </Text>
            </View>
            <View style={styles.resultDivider} />
            <View style={styles.resultScoreRow}>
              <Text style={styles.resultScoreLabel}>Accuracy</Text>
              <Text style={styles.resultScoreValue}>{pct}%</Text>
            </View>
            <View style={styles.resultDivider} />
            <View style={styles.resultScoreRow}>
              <Text style={styles.resultScoreLabel}>Best Streak</Text>
              <Text style={styles.resultScoreValue}>
                {bestStreak} 🔥
              </Text>
            </View>
          </View>

          <TouchableOpacity
            style={styles.startButton}
            onPress={() => startGame(activeCategory)}
            activeOpacity={0.85}
            testID="play-again"
          >
            <RotateCcw size={18} color={Colors.white} />
            <Text style={styles.startButtonText}>Play Again</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.backToMenuButton}
            onPress={() => {
              setGameState("menu");
              setScore(0);
              setAnswered(0);
              setBestStreak(0);
            }}
            testID="back-to-menu"
          >
            <Text style={styles.backToMenuText}>Back to Categories</Text>
          </TouchableOpacity>
        </ScrollView>
      </View>
    );
  }

  if (!currentQuestion) return null;

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.gameHeader}>
        <TouchableOpacity
          style={styles.quitButton}
          onPress={() => setGameState("menu")}
          testID="quit-trivia"
        >
          <X size={20} color={Colors.textSecondary} />
        </TouchableOpacity>
        <View style={styles.progressContainer}>
          <Animated.View
            style={[
              styles.progressBar,
              {
                width: progressAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: ["0%", "100%"],
                }),
              },
            ]}
          />
        </View>
        <View style={styles.scoreIndicator}>
          <Text style={styles.scoreIndicatorText}>
            {score}/{answered}
          </Text>
        </View>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.gameContent}
      >
        <Animated.View
          style={[
            styles.questionContainer,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }, { translateX: shakeAnim }],
            },
          ]}
        >
          <View style={styles.questionMeta}>
            <View style={styles.categoryTag}>
              <BookOpen size={12} color={Colors.primary} />
              <Text style={styles.categoryTagText}>
                {currentQuestion.category}
              </Text>
            </View>
            <Text style={styles.questionCount}>
              {currentIndex + 1} of {questions.length}
            </Text>
          </View>

          <Text style={styles.questionText}>{currentQuestion.question}</Text>
        </Animated.View>

        <View style={styles.optionsContainer}>
          {currentQuestion.options.map((option, index) => {
            const isSelected = selectedAnswer === option;
            const isCorrectOption = option === currentQuestion.answer;
            const showCorrect = showExplanation && isCorrectOption;
            const showWrong = showExplanation && isSelected && !isCorrectOption;

            const animValue =
              index < optionAnims.length
                ? optionAnims[index]
                : new Animated.Value(1);

            return (
              <Animated.View
                key={`${currentQuestion.id}-${option}`}
                style={{
                  opacity: animValue,
                  transform: [
                    {
                      translateX: animValue.interpolate({
                        inputRange: [0, 1],
                        outputRange: [40, 0],
                      }),
                    },
                  ],
                }}
              >
                <TouchableOpacity
                  style={[
                    styles.optionButton,
                    showCorrect && styles.optionCorrect,
                    showWrong && styles.optionIncorrect,
                    isSelected && !showExplanation && styles.optionSelected,
                  ]}
                  onPress={() => handleAnswer(option)}
                  disabled={!!selectedAnswer}
                  activeOpacity={0.7}
                  testID={`option-${index}`}
                >
                  <View style={styles.optionContent}>
                    <View
                      style={[
                        styles.optionLetter,
                        showCorrect && styles.optionLetterCorrect,
                        showWrong && styles.optionLetterIncorrect,
                      ]}
                    >
                      {showCorrect ? (
                        <Check size={14} color={Colors.correct} />
                      ) : showWrong ? (
                        <X size={14} color={Colors.incorrect} />
                      ) : (
                        <Text style={styles.optionLetterText}>
                          {String.fromCharCode(65 + index)}
                        </Text>
                      )}
                    </View>
                    <Text
                      style={[
                        styles.optionText,
                        showCorrect && styles.optionTextCorrect,
                        showWrong && styles.optionTextIncorrect,
                      ]}
                    >
                      {option}
                    </Text>
                  </View>
                </TouchableOpacity>
              </Animated.View>
            );
          })}
        </View>

        {showExplanation && (
          <View style={styles.explanationCard}>
            <View style={styles.explanationHeader}>
              <BookOpen size={16} color={Colors.accent} />
              <Text style={styles.explanationTitle}>Explanation</Text>
            </View>
            <Text style={styles.explanationText}>
              {currentQuestion.explanation}
            </Text>
          </View>
        )}

        {showExplanation && (
          <TouchableOpacity
            style={styles.nextButton}
            onPress={handleNext}
            activeOpacity={0.85}
            testID="next-question"
          >
            <Text style={styles.nextButtonText}>
              {currentIndex + 1 >= questions.length
                ? "See Results"
                : "Next Question"}
            </Text>
            <ChevronRight size={18} color={Colors.white} />
          </TouchableOpacity>
        )}

        {streak >= 3 && !showExplanation && (
          <View style={styles.streakBadge}>
            <Text style={styles.streakText}>🔥 {streak} streak!</Text>
          </View>
        )}
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
    paddingBottom: 4,
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
  heroSection: {
    alignItems: "center" as const,
    paddingVertical: 32,
    paddingHorizontal: 40,
  },
  heroIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: Colors.accentLight,
    alignItems: "center" as const,
    justifyContent: "center" as const,
    marginBottom: 16,
  },
  heroTitle: {
    fontSize: 22,
    fontWeight: "700" as const,
    color: Colors.text,
    marginBottom: 8,
  },
  heroDescription: {
    fontSize: 15,
    color: Colors.textSecondary,
    textAlign: "center" as const,
    lineHeight: 22,
  },
  categorySection: {
    marginBottom: 24,
  },
  sectionLabel: {
    fontSize: 13,
    fontWeight: "600" as const,
    color: Colors.textTertiary,
    textTransform: "uppercase" as const,
    letterSpacing: 0.8,
    paddingHorizontal: 24,
    marginBottom: 12,
  },
  categoryScroll: {
    paddingHorizontal: 20,
    gap: 8,
  },
  categoryChip: {
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 24,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  categoryChipActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  categoryChipText: {
    fontSize: 14,
    fontWeight: "500" as const,
    color: Colors.textSecondary,
  },
  categoryChipTextActive: {
    color: Colors.white,
  },
  startButton: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    justifyContent: "center" as const,
    marginHorizontal: 24,
    paddingVertical: 16,
    backgroundColor: Colors.primary,
    borderRadius: 16,
    gap: 8,
  },
  startButtonText: {
    fontSize: 17,
    fontWeight: "700" as const,
    color: Colors.white,
  },
  statsPreview: {
    flexDirection: "row" as const,
    marginHorizontal: 24,
    marginTop: 28,
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: 20,
  },
  statBox: {
    flex: 1,
    alignItems: "center" as const,
  },
  statBoxNumber: {
    fontSize: 22,
    fontWeight: "700" as const,
    color: Colors.text,
  },
  statBoxLabel: {
    fontSize: 12,
    color: Colors.textTertiary,
    marginTop: 4,
    fontWeight: "500" as const,
  },
  statDivider: {
    width: 1,
    backgroundColor: Colors.border,
  },
  gameHeader: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    paddingHorizontal: 20,
    paddingVertical: 12,
    gap: 12,
  },
  quitButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.surface,
    alignItems: "center" as const,
    justifyContent: "center" as const,
  },
  progressContainer: {
    flex: 1,
    height: 6,
    backgroundColor: Colors.surface,
    borderRadius: 3,
    overflow: "hidden" as const,
  },
  progressBar: {
    height: "100%",
    backgroundColor: Colors.primary,
    borderRadius: 3,
  },
  scoreIndicator: {
    backgroundColor: Colors.surface,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  scoreIndicatorText: {
    fontSize: 14,
    fontWeight: "700" as const,
    color: Colors.text,
  },
  gameContent: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  questionContainer: {
    marginTop: 12,
    marginBottom: 24,
  },
  questionMeta: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    justifyContent: "space-between" as const,
    marginBottom: 16,
  },
  categoryTag: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    gap: 6,
    backgroundColor: Colors.surfaceAlt,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
  },
  categoryTagText: {
    fontSize: 12,
    fontWeight: "600" as const,
    color: Colors.primary,
  },
  questionCount: {
    fontSize: 13,
    color: Colors.textTertiary,
    fontWeight: "500" as const,
  },
  questionText: {
    fontSize: 22,
    fontWeight: "600" as const,
    color: Colors.text,
    lineHeight: 32,
    letterSpacing: -0.3,
  },
  optionsContainer: {
    gap: 10,
  },
  optionButton: {
    backgroundColor: Colors.white,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: Colors.border,
    padding: 16,
  },
  optionSelected: {
    borderColor: Colors.primary,
    backgroundColor: Colors.surfaceAlt,
  },
  optionCorrect: {
    borderColor: Colors.correct,
    backgroundColor: Colors.correctLight,
  },
  optionIncorrect: {
    borderColor: Colors.incorrect,
    backgroundColor: Colors.incorrectLight,
  },
  optionContent: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    gap: 14,
  },
  optionLetter: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.surface,
    alignItems: "center" as const,
    justifyContent: "center" as const,
  },
  optionLetterCorrect: {
    backgroundColor: Colors.correctLight,
  },
  optionLetterIncorrect: {
    backgroundColor: Colors.incorrectLight,
  },
  optionLetterText: {
    fontSize: 14,
    fontWeight: "700" as const,
    color: Colors.textSecondary,
  },
  optionText: {
    fontSize: 16,
    color: Colors.text,
    flex: 1,
    fontWeight: "500" as const,
  },
  optionTextCorrect: {
    color: Colors.correct,
    fontWeight: "600" as const,
  },
  optionTextIncorrect: {
    color: Colors.incorrect,
    fontWeight: "600" as const,
  },
  explanationCard: {
    marginTop: 20,
    backgroundColor: Colors.accentLight,
    borderRadius: 14,
    padding: 18,
    borderWidth: 1,
    borderColor: Colors.accent + "30",
  },
  explanationHeader: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    gap: 8,
    marginBottom: 8,
  },
  explanationTitle: {
    fontSize: 14,
    fontWeight: "700" as const,
    color: Colors.accent,
    textTransform: "uppercase" as const,
    letterSpacing: 0.5,
  },
  explanationText: {
    fontSize: 15,
    lineHeight: 22,
    color: Colors.text,
  },
  nextButton: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    justifyContent: "center" as const,
    marginTop: 20,
    paddingVertical: 16,
    backgroundColor: Colors.primary,
    borderRadius: 16,
    gap: 6,
  },
  nextButtonText: {
    fontSize: 16,
    fontWeight: "700" as const,
    color: Colors.white,
  },
  streakBadge: {
    alignSelf: "center" as const,
    marginTop: 16,
    backgroundColor: Colors.accentLight,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  streakText: {
    fontSize: 14,
    fontWeight: "600" as const,
    color: Colors.accent,
  },
  resultContent: {
    paddingHorizontal: 24,
    paddingBottom: 40,
    alignItems: "center" as const,
  },
  resultHeader: {
    alignItems: "center" as const,
    paddingTop: 40,
    paddingBottom: 24,
  },
  resultIconContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: Colors.accentLight,
    alignItems: "center" as const,
    justifyContent: "center" as const,
    marginBottom: 20,
  },
  resultTitle: {
    fontSize: 28,
    fontWeight: "700" as const,
    color: Colors.text,
    letterSpacing: -0.5,
  },
  resultMessage: {
    fontSize: 16,
    color: Colors.textSecondary,
    textAlign: "center" as const,
    marginTop: 8,
    lineHeight: 24,
    paddingHorizontal: 20,
  },
  resultScoreCard: {
    width: "100%",
    backgroundColor: Colors.surface,
    borderRadius: 20,
    padding: 24,
    marginBottom: 24,
  },
  resultScoreRow: {
    flexDirection: "row" as const,
    justifyContent: "space-between" as const,
    alignItems: "center" as const,
    paddingVertical: 10,
  },
  resultScoreLabel: {
    fontSize: 16,
    color: Colors.textSecondary,
    fontWeight: "500" as const,
  },
  resultScoreValue: {
    fontSize: 18,
    fontWeight: "700" as const,
    color: Colors.text,
  },
  resultDivider: {
    height: 1,
    backgroundColor: Colors.border,
  },
  backToMenuButton: {
    marginTop: 16,
    paddingVertical: 14,
  },
  backToMenuText: {
    fontSize: 15,
    color: Colors.textSecondary,
    fontWeight: "600" as const,
  },
  limitBanner: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    marginHorizontal: 24,
    marginBottom: 16,
    backgroundColor: Colors.accentLight,
    borderRadius: 12,
    padding: 12,
    gap: 8,
  },
  limitBannerText: {
    flex: 1,
    fontSize: 13,
    fontWeight: "600" as const,
    color: Colors.accent,
  },
  upgradeChip: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    backgroundColor: Colors.accent,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    gap: 4,
  },
  upgradeChipText: {
    fontSize: 12,
    fontWeight: "700" as const,
    color: "#FFF",
  },
  startButtonDisabled: {
    backgroundColor: Colors.accent,
  },
});
