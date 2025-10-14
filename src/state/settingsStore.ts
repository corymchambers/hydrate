import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Localization from 'expo-localization';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

export type UnitSystem = 'metric' | 'imperial';

interface SettingsState {
    unitSystem: UnitSystem;
    setUnitSystem: (u: UnitSystem) => void;
    quickAddButtons: [number, number, number]; // Stored in ml
    setQuickAddButtons: (buttons: [number, number, number]) => void;
}

const getDefaultUnit = (): UnitSystem => {
    const imperialRegions = ['US', 'LR', 'MM'];
    const locale = Localization.getLocales()[0];
    const region = locale?.regionCode?.toUpperCase() ?? '';
    return imperialRegions.includes(region) ? 'imperial' : 'metric';
};

export const useSettingsStore = create<SettingsState>()(
    persist(
        (set) => ({
            unitSystem: getDefaultUnit(),
            setUnitSystem: (u) => set({ unitSystem: u }),
            quickAddButtons: [250, 500, 1000], // Default values in ml
            setQuickAddButtons: (buttons) => set({ quickAddButtons: buttons }),
        }),
        {
            name: 'hydrate-settings',
            storage: createJSONStorage(() => AsyncStorage),
        }
    )
);
