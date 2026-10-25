import Constants from "expo-constants";
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
      name: "A channel is needed for the permissions prompt to appear",
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: "#FF231F7C",
    });
  }

  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;
  if (existingStatus !== "granted") {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }
  if (finalStatus !== "granted") {
    return finalStatus;
  }
  
  const projectId =
    Constants?.expoConfig?.extra?.eas?.projectId ??
    Constants?.easConfig?.projectId;
  if (!projectId) {
    throw new Error("Project ID not found");
  }

  await Notifications.getExpoPushTokenAsync({ projectId });
  return finalStatus; // Return 'granted'
}

export default function WalkScreen() {
  const [elapsedSeconds, setElapsedSeconds] = useState<number>(0);
  const [status, setStatus] = useState<"idle" | "running" | "paused">("idle");
  
  const [location, setLocation] = useState<Location.LocationObject | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const [notificationPermission, setNotificationPermission] = useState<string>("undetermined");

  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const trackingRef = useRef<Location.LocationSubscription | null>(null);
  const isStartingRef = useRef(false);

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
      
      setStatus("running");
      startTimer(); 
    } catch (error) {
      console.error("Unable to start walk tracking:", error);
      setErrorMsg("Unable to start location tracking. Please try again.");
    } finally {
      isStartingRef.current = false;
    }
  };

  const pauseWalk = () => {
    if (trackingRef.current) {
      trackingRef.current.remove();
      trackingRef.current = null;
    }
    
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    
    setStatus("paused");
  };

  const resumeWalk = () => {
    if (status === "paused") {
      void startWalk();
    }
  };

  const stopWalk = () => {
    if (trackingRef.current) {
      trackingRef.current.remove();
      trackingRef.current = null;
    }
    
    stopTimer();
    setStatus("idle");
    setLocation(null);
  };

  const handleRequestNotificationPermission = async () => {
    try {
      const finalStatus = await registerForPushNotificationsAsync();
      setNotificationPermission(finalStatus);
    } catch (error) {
      console.error("Failed setting notification permissions manually:", error);
    }
  };

  useEffect(() => {
    if (Platform.OS === "web") {
      return;
    }

    Notifications.getPermissionsAsync().then(({ status }) => {
      setNotificationPermission(status);
    });

    registerForPushNotificationsAsync()
      .then((finalStatus) => {
        setNotificationPermission(finalStatus);
      })
      .catch((error: unknown) => {
        console.error("Unable to register for push notifications:", error);
      });

    const responseListener =
      Notifications.addNotificationResponseReceivedListener((response) => {
        console.log(response);
      });

    return () => {
      responseListener.remove();
      trackingRef.current?.remove();
      trackingRef.current = null;
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  const formatTime = (totalSeconds: number) => {
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
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
      case "granted": return { text: "APPROVED", color: "green" };
      case "denied": return { text: "DENIED", color: "red" };
      default: return { text: "NOT REQUESTED YET", color: "orange" };
    }
  };
  const permissionUI = getPermissionStyles();

  return (
    <View style={styles.container}>
      <View style={styles.notificationStatusBlock}>
        <Text style={styles.notificationLabel}>
          Notifications:{" "}
          <Text style={[styles.notificationBadge, { color: permissionUI.color }]}>
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
      
      <Text style={styles.timerText}>{formatTime(elapsedSeconds)}</Text>

      <Text style={styles.paragraph}>{text}</Text>

      <View style={styles.buttonContainer}>
        {status === "idle" && (
          <Button title="Start Walk" onPress={() => void startWalk()} />
        )}

        {status === "running" && (
          <Button title="Pause" onPress={pauseWalk} color="#ffa500" />
        )}

        {status === "paused" && (
          <Button title="Resume" onPress={resumeWalk} color="#008000" />
        )}

        {status !== "idle" && (
          <Button title="Stop Walk" onPress={stopWalk} color="#ff4d4d" />
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