import * as Location from "expo-location";
import * as Notifications from "expo-notifications";
import { useEffect, useRef, useState } from "react";
import { Button, Platform, StyleSheet, Text, View } from "react-native";

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldPlaySound: false,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

async function registerForPushNotificationsAsync() {
  if (Platform.OS === "web") return "undetermined";

  if (Platform.OS === "android") {
    await Notifications.setNotificationChannelAsync("myNotificationChannel", {
      name: "Walking reminders",
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: "#FF231F7C",
    });
  }

  const { status: existingStatus } =
    await Notifications.getPermissionsAsync();

  let finalStatus = existingStatus;

  if (existingStatus !== "granted") {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  return finalStatus;
}

export default function WalkScreen() {
  const [elapsedSeconds, setElapsedSeconds] = useState<number>(0);
  const [status, setStatus] = useState<"idle" | "running" | "paused">("idle");
  const [location, setLocation] = useState<Location.LocationObject | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [notificationPermission, setNotificationPermission] =
    useState<string>("undetermined");
  const [notificationMessage, setNotificationMessage] = useState("");
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const trackingRef = useRef<Location.LocationSubscription | null>(null);
  const isStartingRef = useRef(false);
  const pauseNotificationRef = useRef<string | null>(null);
  const goalNotificationSentRef = useRef(false);
  const startTimer = () => {
    if (timerRef.current !== null) return;

    timerRef.current = setInterval(() => {
      setElapsedSeconds((prev) => prev + 1);
    }, 1000);
  };

  const stopTimer = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    setElapsedSeconds(0);
  };

  const cancelPauseReminder = async () => {
    if (pauseNotificationRef.current !== null) {
      try {
        await Notifications.cancelScheduledNotificationAsync(
          pauseNotificationRef.current,
        );
      } catch {
        // The reminder may already have been delivered.
      }

      pauseNotificationRef.current = null;
      setNotificationMessage("Pause reminder canceled.");
    }
  };

  const startWalk = async () => {
    if (trackingRef.current !== null || isStartingRef.current) return;

    isStartingRef.current = true;
    setErrorMsg(null);

    try {
      const { status: permissionStatus } =
        await Location.requestForegroundPermissionsAsync();

      if (permissionStatus !== "granted") {
        setErrorMsg("Permission to access location was denied");
        return;
      }

      trackingRef.current = await Location.watchPositionAsync(
        {
          accuracy: Location.Accuracy.High,
          timeInterval: 2000,
          distanceInterval: 1,
        },
        (newLocation) => {
          setLocation(newLocation);
        },
      );

      if (elapsedSeconds === 0) {
        goalNotificationSentRef.current = false;
      }

      setStatus("running");
      startTimer();
    } catch (error) {
      console.error("Unable to start walk tracking:", error);
      setErrorMsg("Unable to start location tracking. Please try again.");
    } finally {
      isStartingRef.current = false;
    }
  };

  const pauseWalk = async () => {
    if (trackingRef.current) {
      trackingRef.current.remove();
      trackingRef.current = null;
    }

    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }

    setStatus("paused");

    if (notificationPermission === "granted") {
      try {
        await cancelPauseReminder();

        pauseNotificationRef.current =
          await Notifications.scheduleNotificationAsync({
            content: {
              title: "Walk Paused",
              body: "Your walk is still paused. Open the app when you are ready to continue.",
            },
            trigger: {
              type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
              seconds: 10,
              ...(Platform.OS === "android"
                ? { channelId: "myNotificationChannel" }
                : {}),
            },
          });

        setNotificationMessage("Pause reminder scheduled.");
      } catch {
        setNotificationMessage("Could not schedule pause reminder.");
      }
    } else {
      setNotificationMessage(
        "Notifications are disabled. Reminders will not appear.",
      );
    }
  };

  const resumeWalk = async () => {
    if (status === "paused") {
      await cancelPauseReminder();
      await startWalk();
    }
  };

  const stopWalk = async () => {
    await cancelPauseReminder();

    if (trackingRef.current) {
      trackingRef.current.remove();
      trackingRef.current = null;
    }

    stopTimer();
    setStatus("idle");
    setLocation(null);
    goalNotificationSentRef.current = false;
  };

  const handleRequestNotificationPermission = async () => {
    try {
      const finalStatus = await registerForPushNotificationsAsync();

      setNotificationPermission(finalStatus);

      setNotificationMessage(
        finalStatus === "granted"
          ? "Notifications are enabled."
          : "Notifications are disabled. Reminders will not appear.",
      );
    } catch (error) {
      console.error("Failed setting notification permissions:", error);
      setNotificationMessage("Could not check notification permissions.");
    }
  };

  useEffect(() => {
    if (Platform.OS === "web") return;

    registerForPushNotificationsAsync()
      .then((finalStatus) => {
        setNotificationPermission(finalStatus);

        setNotificationMessage(
          finalStatus === "granted"
            ? "Notifications are enabled."
            : "Notifications are disabled. Reminders will not appear.",
        );
      })
      .catch((error: unknown) => {
        console.error("Unable to request notification permission:", error);
        setNotificationMessage("Could not check notification permissions.");
      });

    const responseListener =
      Notifications.addNotificationResponseReceivedListener((response) => {
        console.log(response);
      });

    return () => {
      responseListener.remove();
      trackingRef.current?.remove();
      trackingRef.current = null;

      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, []);

  // Notify once when the 60-second goal is reached.
  useEffect(() => {
    if (elapsedSeconds < 60 || goalNotificationSentRef.current) return;

    goalNotificationSentRef.current = true;

    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }

    trackingRef.current?.remove();
    trackingRef.current = null;

    setStatus("idle");
    setNotificationMessage("Walking goal reached!");

    if (notificationPermission === "granted") {
      void Notifications.scheduleNotificationAsync({
        content: {
          title: "Goal Reached",
          body: "Great job! You completed your walking goal.",
        },
        trigger: null,
      }).catch((error) => {
        console.error("Unable to send goal notification:", error);
      });
    }
  }, [elapsedSeconds, notificationPermission]);

  const formatTime = (totalSeconds: number) => {
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;

    return `${minutes.toString().padStart(2, "0")}:${seconds
      .toString()
      .padStart(2, "0")}`;
  };

  let text = "Press Start to begin your walk.";

  if (status === "paused") {
    text = "Walk Paused.";
  } else if (errorMsg) {
    text = errorMsg;
  } else if (location) {
    const { latitude, longitude } = location.coords;
    text = `Latitude: ${latitude}\nLongitude: ${longitude}`;
  }

  const getPermissionStyles = () => {
    switch (notificationPermission) {
      case "granted":
        return { text: "APPROVED", color: "green" };
      case "denied":
        return { text: "DENIED", color: "red" };
      default:
        return { text: "NOT REQUESTED YET", color: "orange" };
    }
  };

  const permissionUI = getPermissionStyles();

  return (
    <View style={styles.container}>
      <View style={styles.notificationStatusBlock}>
        <Text style={styles.notificationLabel}>
          Notifications:{" "}
          <Text
            style={[
              styles.notificationBadge,
              { color: permissionUI.color },
            ]}
          >
            {permissionUI.text}
          </Text>
        </Text>

        {notificationPermission !== "granted" && (
          <Button
            title="Ask Permission"
            onPress={() => void handleRequestNotificationPermission()}
          />
        )}
      </View>

      <Text style={styles.statusText}>STATUS: {status.toUpperCase()}</Text>

      <Text style={styles.timerText}>
        {formatTime(Math.min(elapsedSeconds, 60))}
      </Text>

      <Text style={styles.paragraph}>Goal: 01:00</Text>

      {notificationMessage !== "" && (
        <Text style={styles.paragraph}>{notificationMessage}</Text>
      )}

      <Text style={styles.paragraph}>{text}</Text>

      <View style={styles.buttonContainer}>
        {status === "idle" && (
          <Button title="Start Walk" onPress={() => void startWalk()} />
        )}

        {status === "running" && (
          <Button
            title="Pause"
            onPress={() => void pauseWalk()}
            color="#ffa500"
          />
        )}

        {status === "paused" && (
          <Button
            title="Resume"
            onPress={() => void resumeWalk()}
            color="#008000"
          />
        )}

        {status !== "idle" && (
          <Button
            title="Stop Walk"
            onPress={() => void stopWalk()}
            color="#ff4d4d"
          />
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
  },
  notificationStatusBlock: {
    marginBottom: 40,
    alignItems: "center",
    backgroundColor: "#f4f4f4",
    padding: 12,
    borderRadius: 8,
    width: "100%",
    maxWidth: 300,
    gap: 8,
  },
  notificationLabel: {
    fontSize: 14,
    color: "#333",
  },
  notificationBadge: {
    fontWeight: "bold",
  },
  statusText: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#666",
    marginBottom: 5,
  },
  timerText: {
    fontSize: 48,
    fontWeight: "300",
    fontVariant: ["tabular-nums"],
    marginVertical: 10,
  },
  paragraph: {
    fontSize: 18,
    textAlign: "center",
    marginVertical: 20,
  },
  buttonContainer: {
    flexDirection: "row",
    gap: 12,
    alignItems: "center",
  },
});