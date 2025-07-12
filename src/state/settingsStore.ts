import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Localization from 'expo-localization';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

export type UnitSystem = 'metric' | 'imperial';

interface SettingsState {
    unitSystem: UnitSystem;
    setUnitSystem: (u: UnitSystem) => void;
}

const getDefaultUnit = (): UnitSystem => {
    const imperialRegions = ['US', 'LR', 'MM'];
    const region = Localization.region?.toUpperCase() ?? '';
    return imperialRegions.includes(region) ? 'imperial' : 'metric';
};

export const useSettingsStore = create<SettingsState>()(
    persist(
        (set) => ({
            unitSystem: getDefaultUnit(),
            setUnitSystem: (u) => set({ unitSystem: u }),
        }),
        {
            name: 'hydrate-settings',
            storage: createJSONStorage(() => AsyncStorage),
        }
    )
);
