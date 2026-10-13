import { useEffect, useRef, useState } from 'react';
import {ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View,
} from 'react-native';
import * as Location from 'expo-location';

type TrackingStatus = 'inactive' | 'tracking';

type LocationRecord = {
  id: string;
  latitude: number;
  longitude: number;
  timestamp: string;
};

export default function WalkScreen() {
  const [currentLocation, setCurrentLocation] = useState<{ latitude: number; longitude: number } | null>(null);
  const [trackingStatus, setTrackingStatus] = useState<TrackingStatus>('inactive');
  const [records, setRecords] = useState<LocationRecord[]>([]);
  const [notice, setNotice] = useState<string | null>(null);
  const [isBusy, setIsBusy] = useState(false);
  const watcherRef = useRef<Location.LocationSubscription | null>(null);

  useEffect(() => {
    return () => {
      if (watcherRef.current) {
        watcherRef.current.remove();
      }
    };
  }, []);

  const requestForegroundLocation = async () => {
    const { status } = await Location.requestForegroundPermissionsAsync();

    if (status !== 'granted') {
      setNotice('Location access is required to use the tracking features. Please enable location permission to continue.');
      return false;
    }

    setNotice(null);
    return true;
  };

  const handleGetCurrentLocation = async () => {
    if (!(await requestForegroundLocation())) {
      return;
    }

    setIsBusy(true);

    try {
      const result = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });

      setCurrentLocation({
        latitude: result.coords.latitude,
        longitude: result.coords.longitude,
      });
      setNotice(null);
    } catch {
      setNotice('Unable to read your current location right now. Please try again.');
    } finally {
      setIsBusy(false);
    }
  };

  const handleStartWalk = async () => {
    if (!(await requestForegroundLocation())) {
      return;
    }

    if (!(await Location.hasServicesEnabledAsync())) {
      setNotice('Location services are disabled. Please enable them to start tracking.');
      return;
    }

    if (watcherRef.current) {
      watcherRef.current.remove();
    }

    const watcher = await Location.watchPositionAsync(
      {
        accuracy: Location.Accuracy.High,
        timeInterval: 5000,
        distanceInterval: 10,
      },
      (location) => {
        const { latitude, longitude } = location.coords;
        const nextLocation = { latitude, longitude };
        const uniqueId = `${location.timestamp}-${latitude}-${longitude}-${Math.random()
          .toString(36)
          .slice(2, 10)}`;

        setCurrentLocation(nextLocation);
        setRecords((previous) => [
          ...previous,
          {
            id: uniqueId,
            latitude,
            longitude,
            timestamp: new Date(location.timestamp).toISOString(),
          },
        ]);
      },
    );

    watcherRef.current = watcher;
    setTrackingStatus('tracking');
    setNotice(null);
  };

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={styles.title}>Walking Tracker</Text>

        <View style={styles.card}>
          <Text style={styles.label}>Current location</Text>
          {isBusy ? (
            <ActivityIndicator size="small" color="#0066cc" />
          ) : currentLocation ? (
            <Text style={styles.locationText}>
              {currentLocation.latitude.toFixed(6)}, {currentLocation.longitude.toFixed(6)}
            </Text>
          ) : (
            <Text style={styles.placeholderText}>No location available yet.</Text>
          )}
        </View>

        <View style={styles.card}>
          <Text style={styles.label}>Tracking status</Text>
          <Text style={styles.statusText}>{trackingStatus.toUpperCase()}</Text>
        </View>

        {notice ? <Text style={styles.notice}>{notice}</Text> : null}

        <View style={styles.buttonGroup}>
          <Pressable style={styles.primaryButton} onPress={handleGetCurrentLocation}>
            <Text style={styles.primaryButtonText}>Get Current Location</Text>
          </Pressable>

          <Pressable
            style={styles.primaryButton}
            onPress={handleStartWalk}
            disabled={trackingStatus === 'tracking'}
          >
            <Text style={styles.primaryButtonText}>Start Walk</Text>
          </Pressable>
        </View>

        <View style={styles.noticeBox}>
          <Text style={styles.noticeTitle}>Privacy notice</Text>
          <Text style={styles.noticeText}>
            This app collects latitude, longitude, date, and time while a walk is being tracked. Location data is only kept on this device while the app is active.
          </Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.label}>Saved location records</Text>
          {records.length === 0 ? (
            <Text style={styles.placeholderText}>No saved records yet.</Text>
          ) : (
            records.map((record) => (
              <View key={record.id} style={styles.recordItem}>
                <Text style={styles.recordText}>
                  {record.latitude.toFixed(6)}, {record.longitude.toFixed(6)}
                </Text>
                <Text style={styles.recordMeta}>{new Date(record.timestamp).toLocaleString()}</Text>
              </View>
            ))
          )}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f4f7fb',
  },
  scrollContent: {
    padding: 20,
    gap: 16,
  },
  title: {
    fontSize: 30,
    fontWeight: '700',
    color: '#0f172a',
    marginBottom: 8,
    textAlign: 'center',
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 18,
    padding: 18,
    shadowColor: '#0f172a',
    shadowOpacity: 0.08,
    shadowOffset: { width: 0, height: 6 },
    shadowRadius: 8,
    elevation: 3,
  },
  label: {
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.8,
    textTransform: 'uppercase',
    color: '#475569',
    marginBottom: 8,
  },
  locationText: { fontSize: 22, fontWeight: '600', color: '#0f172a' },
  statusText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0066cc',
    textTransform: 'uppercase',
  },
  placeholderText: { color: '#64748b', fontSize: 15 },
  notice: {
    backgroundColor: '#fff1f2',
    color: '#9f1239',
    borderColor: '#fecdd3',
    borderWidth: 1,
    borderRadius: 12,
    padding: 12,
    fontWeight: '600',
  },
  buttonGroup: { gap: 12 },
  primaryButton: {
    backgroundColor: '#2563eb',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  primaryButtonText: { color: '#ffffff', fontWeight: '700', fontSize: 16 },
  noticeBox: {
    backgroundColor: '#eff6ff',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#bfdbfe',
    padding: 16,
  },
  noticeTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1e3a8a',
    marginBottom: 6,
  },
  noticeText: {
    color: '#1e3a8a',
    fontSize: 14,
    lineHeight: 20,
  },
  recordItem: {
    borderTopWidth: 1,
    borderTopColor: '#e2e8f0',
    paddingTop: 10,
    marginTop: 10,
  },
  recordText: { color: '#0f172a', fontWeight: '600', fontSize: 14 },
  recordMeta: { color: '#64748b', marginTop: 4, fontSize: 12 },
});
