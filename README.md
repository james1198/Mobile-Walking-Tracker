# Walk Tracker Privacy

This Expo app lets a user view their current position, start and stop a walk, collect location points while walking, and save those location records locally on the device.

## Features

- Current latitude and longitude display
- Tracking status indicator
- Get Current Location action with foreground permission request
- Start, pause, resume, and stop walking controls
- Local persistence for saved records across app restarts
- Background location task support via Expo Task Manager for minimal tracking continuity
- Privacy notice explaining data collection and storage practices

## Local setup

1. Install dependencies:

   ```bash
   npm install
   ```

2. Start the Expo app:

   ```bash
   npx expo start
   ```

3. Open the app on a device or emulator:
   - iOS simulator
   - Android emulator
   - physical device via Expo Go or a development build

## Required permissions

The app requests:

- Foreground location permission for current location checks
- Background location permission for walk-tracking sessions

If the user denies location permission, the screen shows a clear message explaining that location access is required to use tracking features.

## Testing checklist

- Location permission approved
- Location permission denied
- Tracking started and coordinates update
- Tracking paused and resumed
- Tracking stopped
- App closed and reopened to confirm saved records remain available

## Privacy notice

The privacy notice on the tracking screen states that the app collects latitude, longitude, date, and time, only while a walk is being tracked, and stores records locally on the device.

## Notes

This project uses the Expo location APIs and Expo Task Manager to support background tracking. Background location behavior is limited by platform/device permissions and may require a development build on a real device for full testing.
