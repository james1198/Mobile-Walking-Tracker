import PermissionsButton from "@/components/permissions-button";
import { ThemedText } from "@/components/themed-text";
import WalkMap from "@/components/walk-map";
import { useTheme } from "@/hooks/use-theme";
import Constants from "expo-constants";
import * as Location from "expo-location";
import * as Notifications from "expo-notifications";
import { AndroidImportance } from "expo-notifications";
import { useEffect, useState } from "react";
import { Button, Platform, StyleSheet, View } from "react-native";

//this section configures how notifications are displayed
if (Platform.OS !== "web") {
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldPlaySound: false,
      shouldSetBadge: false,
      shouldShowBanner: true,
      shouldShowList: true,
    }),
  });
}
//this function registers for push notifications and returns the Expo push token
async function registerForPushNotificationsAsync() {
  if (Platform.OS === "web") {
    return "";
  }

  let token;
//this section creates a notification channel for Android
  if (Platform.OS === "android") {
    await Notifications.setNotificationChannelAsync("myNotificationChannel", {
      name: "A channel is needed for the permissions prompt to appear",
      importance: AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: "#FF231F7C",
    });
  }
//this section checks and requests notification permissions
  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;
  if (existingStatus !== "granted") {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }
  //this section checks if notification permissions were granted
  if (finalStatus !== "granted") {
    alert("Failed to get push token for push notification!");
    return;
  }
  // Learn more about projectId:
  // https://docs.expo.dev/push-notifications/push-notifications-setup/#configure-projectid
  // EAS projectId is used here.
  //this section retrieves the Expo push token using the project ID
  try {
    const projectId =
      Constants?.expoConfig?.extra?.eas?.projectId ??
      Constants?.easConfig?.projectId;
    if (!projectId) {
      throw new Error("Project ID not found");
    }
    token = (
      await Notifications.getExpoPushTokenAsync({
        projectId,
      })
    ).data;
    console.log(token);
  } catch (e) {
    token = `${e}`;
  }

  return token;
}
//this function schedules a push notification
async function schedulePushNotification() {
  if (Platform.OS === "web") {
    console.warn("Notifications are not available in the browser preview.");
    return;
  }

  await Notifications.scheduleNotificationAsync({
    content: {
      title: "You've got mail! 📬",
      body: "Here is the notification body",
      data: { data: "goes here", test: { test1: "more data" } },
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
      seconds: 2,
    },
  });
}
//this component renders the walk screen
export default function WalkScreen() {
  const theme = useTheme();
  const [location, setLocation] = useState<Location.LocationObject | null>(
    null,
  );
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [expoPushToken, setExpoPushToken] = useState("");
  const [channels, setChannels] = useState<Notifications.NotificationChannel[]>(
    [],
  );
  const [notification, setNotification] = useState<
    Notifications.Notification | undefined
  >(undefined);
//this effect hook runs once when the component mounts
  useEffect(() => {
    async function getCurrentLocation() {
      if (Platform.OS === "web") {
        setErrorMsg("Location tracking is only available in the mobile app.");
        return;
      }

      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== "granted") {
          setErrorMsg("Permission to access location was denied");
          return;
        }

        const servicesEnabled = await Location.hasServicesEnabledAsync();
        if (!servicesEnabled) {
          setErrorMsg("Enable location services on your device to get your location.");
          return;
        }

        const lastKnownLocation = await Location.getLastKnownPositionAsync();
        if (lastKnownLocation) {
          setLocation(lastKnownLocation);
        }

        const location = await Location.getCurrentPositionAsync({});
        setLocation(location);
      } catch (error) {
        console.error("Failed to get the current location:", error);
        setErrorMsg("Could not get your location. Check your device location settings and try again.");
      }
    }
//this function sets up push notifications
    async function setupNotification() {
      if (Platform.OS === "web") {
        return;
      }

      registerForPushNotificationsAsync().then(
        (token) => token && setExpoPushToken(token),
      );
      //this section retrieves notification channels on Android
      if (Platform.OS === "android") {
        Notifications.getNotificationChannelsAsync().then((value) =>
          setChannels(value ?? []),
        );
      }
      //this listener handles received notifications
      const notificationListener =
        Notifications.addNotificationReceivedListener((notification) => {
          setNotification(notification);
        });
      //this listener handles responses to notifications
      const responseListener =
        Notifications.addNotificationResponseReceivedListener((response) => {
          console.log(response);
        });

      //this cleanup function removes the notification listeners
      return () => {
        notificationListener.remove();
        responseListener.remove();
      };
    }
//this section calls the functions to get the current location and set up notifications
    getCurrentLocation();
    setupNotification();
  }, []);

//this section determines the text to display based on the error message or location
  let text = "Waiting for a GPS location...";
  if (errorMsg) {
    text = errorMsg;
  } else if (location) {
    const { latitude, longitude } = location?.coords ?? {
      latitude: "N/A",
      longitude: "N/A",
    };
    text = `Latitude: ${latitude}, Longitude: ${longitude}`;
  }

//this section returns the JSX for the walk screen
  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <PermissionsButton title="Start Walk" />
      <ThemedText style={styles.paragraph}>{text}</ThemedText>
      <View style={[styles.walkMap, { backgroundColor: theme.backgroundElement }]}>
        <WalkMap />
      </View>
      <View style={[styles.notificationInfo, { backgroundColor: theme.background }]}>
        <ThemedText themeColor="text">Your expo push token: {expoPushToken}</ThemedText>
        <ThemedText themeColor="text">{`Channels: ${JSON.stringify(
          channels.map((c) => c.id),
          null,
          2,
        )}`}</ThemedText>
        <Button
          title="Press to schedule a notification"
          onPress={async () => {
            await schedulePushNotification();
          }}
        />
        {/* this section displays the details of the received notification */}
        <ThemedText themeColor="text">
          Title: {notification && notification.request.content.title}{" "}
        </ThemedText>
        <ThemedText themeColor="text">Body: {notification && notification.request.content.body}</ThemedText>
        <ThemedText themeColor="text">
          Data:{" "}
          {notification && JSON.stringify(notification.request.content.data)}
        </ThemedText>
      </View>
    </View>
  );
}
//this section defines the styles for the walk screen
const styles = StyleSheet.create({
  //this style defines the layout of the main container
  container: {
    flex: 1,
    alignItems: "stretch",
    justifyContent: "flex-start",
  },
  //this style defines the appearance of the paragraph text
  paragraph: {
    fontSize: 18,
    textAlign: "center",
    marginTop: 20,
    paddingHorizontal: 16,
    color: "#ffffff",
  },
  //this style defines the layout of the notification information
  notificationInfo: {
    alignItems: "center",
    justifyContent: "center",
    padding: 16,
    gap: 8,
  },
  walkMap: {
    flex: 1,
  },
  walkMapContainer: {
    flex: 1,
  },
});
