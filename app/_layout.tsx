import '@/global.css';
import { Feather } from '@expo/vector-icons';
import { Tabs } from 'expo-router';
import { SQLiteProvider, type SQLiteDatabase } from 'expo-sqlite';
import { Suspense } from 'react';
import { ActivityIndicator } from 'react-native';

export default function RootLayout() {
  return (
    <Suspense fallback={<ActivityIndicator />}>
      <SQLiteProvider
        useSuspense
        databaseName="hydrate.db"
        onInit={migrateDbIfNeeded}
      >
        <Tabs
          screenOptions={{
            tabBarActiveTintColor: '#1793c6',
            tabBarInactiveTintColor: '#7eb3c9',
          }}
        >
          <Tabs.Screen
            name="index"
            options={{
              title: 'Home',
              headerShown: false,
              tabBarIcon: ({ color, size }) => (
                <Feather name="home" size={size} color={color} />
              ),
            }}
          />
          <Tabs.Screen
            name="history"
            options={{
              title: 'History',
              headerShown: false,
              tabBarIcon: ({ color, size }) => (
                <Feather name="calendar" size={size} color={color} />
              ),
            }}
          />
          <Tabs.Screen
            name="settings"
            options={{
              title: 'Settings',
              headerShown: false,
              tabBarIcon: ({ color, size }) => (
                <Feather name="settings" size={size} color={color} />
              ),
            }}
          />
        </Tabs></SQLiteProvider></Suspense>
  );
}

async function migrateDbIfNeeded(db: SQLiteDatabase) {
  const DATABASE_VERSION = 1;
  let version = await db.getFirstAsync<{ user_version: number }>(
    'PRAGMA user_version'
  );
  if (!version) return;

  let currentDbVersion = version.user_version;
  // Only run code if version has been updated.
  if (currentDbVersion >= DATABASE_VERSION) {
    return;
  }

  if (currentDbVersion === 0) {
    await db.execAsync(`
    PRAGMA journal_mode = 'wal';
      CREATE TABLE IF NOT EXISTS water_log (
        id INTEGER PRIMARY KEY AUTOINCREMENT, 
        drank_at INTEGER NOT NULL, 
        amount_ml INTEGER NOT NULL
      );
      CREATE TABLE IF NOT EXISTS goal_history (
        id INTEGER PRIMARY KEY NOT NULL,
        changed_at INTEGER NOT NULL, 
        goal_ml INTEGER NOT NULL
      );
  ` );

    await db.execAsync(`
      INSERT INTO goal_history (id, changed_at, goal_ml) 
      VALUES (1, ${Date.now()}, 3000);
    `);

    currentDbVersion = 1;

  }

  await db.execAsync(`PRAGMA user_version = ${DATABASE_VERSION}`);
}
