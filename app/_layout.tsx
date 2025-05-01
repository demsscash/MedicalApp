import React from "react";
import { Stack } from "expo-router";
import { View } from "react-native";
import './globals.css';
import SimpleInactivityTimer from "../components/ui/SimpleInactivityTimer";
import { ActivityWrapper } from "../components/layout/ActivityWrapper";
import { ROUTES } from "../constants/routes";

export default function RootLayout() {
  return (
    <ActivityWrapper>
      <View style={{ flex: 1 }}>
        <Stack
          screenOptions={{
            headerShown: false, // 👈 désactive tous les headers
          }}
        />
        <SimpleInactivityTimer
          timeoutDuration={10}
          warningThreshold={5}
          initialDelay={5}
          disabledRoutes={[ROUTES.HOME]}
        />
      </View>
    </ActivityWrapper>
  );
}