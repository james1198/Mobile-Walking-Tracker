import { Colors, MaxContentWidth, Spacing } from "@/constants/theme";
import { TabList, TabListProps, Tabs, TabSlot, TabTrigger, TabTriggerSlotProps } from "expo-router/ui";
import { SymbolView } from "expo-symbols";
import { Pressable, StyleSheet, useColorScheme, View } from "react-native";
import { ExternalLink } from "./external-link";
import { ThemedText } from "./themed-text";
import { ThemedView } from "./themed-view";
// This component renders the app tabs.
export default function AppTabs() {
  return (
    <Tabs>
      <TabSlot style={{ height: "100%" }} />
      <TabList asChild>
        <CustomTabList>
          <TabTrigger name="home" href="/" asChild>
            <TabButton>Home</TabButton>
          </TabTrigger>
          <TabTrigger name="explore" href="/explore" asChild>
            <TabButton>Explore</TabButton>
          </TabTrigger>
          <TabTrigger name="walk" href="/walk" asChild>
            <TabButton>Walk</TabButton>
          </TabTrigger>
        </CustomTabList>
      </TabList>
    </Tabs>
  );
}

// This component renders a tab button.
export function TabButton({
  children,
  isFocused,
  ref: _ref,
  ...props
}: TabTriggerSlotProps) {
  // This section renders the tab button.
  return (
    <Pressable
      {...props}
      style={({ pressed }) => (pressed ? styles.pressed : undefined)}
    >
      {/* This section renders the tab button view. */}
      <ThemedView
        type={isFocused ? "backgroundSelected" : "backgroundElement"}
        style={styles.tabButtonView}
      >
        {/* This section renders the tab button text. */}
        <ThemedText
          type="small"
          themeColor={isFocused ? "text" : "textSecondary"}
        >
          {/* This section renders the tab button label. */}
          {children}
        </ThemedText>
      </ThemedView>
    </Pressable>
  );
}

// This component renders the custom tab list.
export function CustomTabList(props: TabListProps) {
  const scheme = useColorScheme();
  const colors = Colors[scheme === "dark" ? "dark" : "light"];
// This section renders the custom tab list.
  return (
    <View {...props} style={styles.tabListContainer}>
      <ThemedView type="backgroundElement" style={styles.innerContainer}>
        <ThemedText type="smallBold" style={styles.brandText}>
          Expo Starter
        </ThemedText>

        {props.children}
        {/* This section renders the external link. */}
        <ExternalLink href="https://docs.expo.dev" asChild>
          <Pressable style={styles.externalPressable}>
            <ThemedText type="link">Docs</ThemedText>
            <SymbolView
              tintColor={colors.text}
              name={{ ios: "arrow.up.right.square", web: "link" }}
              size={12}
            />
          </Pressable>
        </ExternalLink>
      </ThemedView>
    </View>
  );
}
// This section defines the component styles.
const styles = StyleSheet.create({
  tabListContainer: {
    position: "absolute",
    width: "100%",
    padding: Spacing.three,
    justifyContent: "center",
    alignItems: "center",
    flexDirection: "row",
  },
  // This section defines the inner container styles.
  innerContainer: {
    paddingVertical: Spacing.two,
    paddingHorizontal: Spacing.five,
    borderRadius: Spacing.five,
    flexDirection: "row",
    alignItems: "center",
    flexGrow: 1,
    gap: Spacing.two,
    maxWidth: MaxContentWidth,
  },
  // This section defines the brand text styles.
  brandText: {
    marginRight: "auto",
  },
  // This section defines the pressed state styles.
  pressed: {
    opacity: 0.7,
  },
  // This section defines the tab button styles.
  tabButtonView: {
    paddingVertical: Spacing.one,
    paddingHorizontal: Spacing.three,
    borderRadius: Spacing.three,
  },
  // This section defines the external link styles.
  externalPressable: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: Spacing.one,
    marginLeft: Spacing.three,
  },
});