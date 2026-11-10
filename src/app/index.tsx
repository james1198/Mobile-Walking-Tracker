import { AnimatedIcon } from "@/components/animated-icon";
import { HintRow } from "@/components/hint-row";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { WebBadge } from "@/components/web-badge";
import { BottomTabInset, MaxContentWidth, Spacing } from "@/constants/theme";
import * as Device from "expo-device";
import * as Linking from "expo-linking";
import { Link } from "expo-router";
import { Platform, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
// This file serves as the main entry point for the Expo application.
function getDevMenuHint() {
  if (Platform.OS === "web") {
    return <ThemedText type="small">use browser devtools</ThemedText>;
  }
  if (Device.isDevice) {
    return (
      <ThemedText type="small">
        shake device or press <ThemedText type="code">m</ThemedText> in terminal
      </ThemedText>
    );
  }
  const shortcut = Platform.OS === "android" ? "cmd+m (or ctrl+m)" : "cmd+d";
  return (
    <ThemedText type="small">
      press <ThemedText type="code">{shortcut}</ThemedText>
    </ThemedText>
  );
}
// This component renders the home screen.
export default function HomeScreen() {
  const url = Linking.useLinkingURL();
// This section logs the URL parameters when the app is opened via a deep link.
  if (url) {
    const { hostname, path, queryParams } = Linking.parse(url);
// This section logs the parsed URL components.
    console.log(
      `Linked to app with hostname: ${hostname}, path: ${path} and data: ${JSON.stringify(
        queryParams,
      )}`,
    );
  }
// This section renders the home screen.
  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <ThemedView style={styles.heroSection}>
          <AnimatedIcon />
          <ThemedText type="title" style={styles.title}>
            Welcome to&nbsp;Expo
          </ThemedText>
        </ThemedView>

        {/* This section displays the "get started" prompt. */}
        <ThemedText type="code" style={styles.code}>
          get started
        </ThemedText>

        <ThemedView type="backgroundElement" style={styles.stepContainer}>
          <HintRow
            title="Try editing"
            hint={<ThemedText type="code">src/app/index.tsx</ThemedText>}
          />
          {/* This section displays the development tools hint. */}
          <HintRow title="Dev tools" hint={getDevMenuHint()} />
          {/* This section displays the fresh start hint. */}
          <HintRow
            title="Fresh start"
            hint={<ThemedText type="code">npm run reset-project</ThemedText>}
          />

          {/* This section displays the link to the walk screen. */}
          <Link href="/walk">
            <ThemedText type="link">Go to the walk screen</ThemedText>
          </Link>
        </ThemedView>

        {Platform.OS === "web" && <WebBadge />}
      </SafeAreaView>
    </ThemedView>
  );
}
// This section defines the styles for the home screen.
const styles = StyleSheet.create({
  // This section defines the styles for the container.
  container: {
    flex: 1,
    justifyContent: "center",
    flexDirection: "row",
  },
  // This section defines the styles for the safe area.
  safeArea: {
    flex: 1,
    paddingHorizontal: Spacing.four,
    alignItems: "center",
    gap: Spacing.three,
    paddingBottom: BottomTabInset + Spacing.three,
    maxWidth: MaxContentWidth,
  },
  // This section defines the styles for the hero section.
  heroSection: {
    alignItems: "center",
    justifyContent: "center",
    flex: 1,
    paddingHorizontal: Spacing.four,
    gap: Spacing.four,
  },
  // This section defines the styles for the title text.
  title: {
    textAlign: "center",
  },
  // This section defines the styles for the code text.
  code: {
    textTransform: "uppercase",
  },
  // This section defines the styles for the step container.
  stepContainer: {
    gap: Spacing.three,
    alignSelf: "stretch",
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.four,
    borderRadius: Spacing.four,
  },
});