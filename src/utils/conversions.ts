// utils/unitConversion.ts

export type UnitSystem = 'metric' | 'imperial';

/**
 * Convert milliliters to fluid ounces
 * @param ml - Volume in milliliters
 * @returns Volume in fluid ounces, rounded to 1 decimal place
 */
export const mlToOz = (ml: number): number => {
    return Math.round(ml * 0.033814 * 10) / 10;
};

/**
 * Convert fluid ounces to milliliters
 * @param oz - Volume in fluid ounces
 * @returns Volume in milliliters, rounded to nearest whole number
 */
export const ozToMl = (oz: number): number => {
    return Math.round(oz * 29.5735);
};

/**
 * Convert volume from ml to display unit based on unit system
 * @param volumeMl - Volume in milliliters (database format)
 * @param unitSystem - Target unit system
 * @returns Volume in the specified unit system
 */
export const convertFromMl = (volumeMl: number, unitSystem: UnitSystem): number => {
    return unitSystem === 'imperial' ? mlToOz(volumeMl) : volumeMl;
};

/**
 * Convert volume to ml from display unit based on unit system
 * @param volume - Volume in display unit
 * @param unitSystem - Source unit system
 * @returns Volume in milliliters (for database storage)
 */
export const convertToMl = (volume: number, unitSystem: UnitSystem): number => {
    return unitSystem === 'imperial' ? ozToMl(volume) : volume;
};

/**
 * Get the unit suffix for display
 * @param unitSystem - Unit system
 * @returns Unit suffix string
 */
export const getUnitSuffix = (unitSystem: UnitSystem): string => {
    return unitSystem === 'imperial' ? 'fl oz' : 'ml';
};

/**
 * Get the unit display name
 * @param unitSystem - Unit system
 * @returns Display name for the unit system
 */
export const getUnitDisplayName = (unitSystem: UnitSystem): string => {
    return unitSystem === 'imperial' ? 'fl oz' : 'ml';
};

/**
 * Format volume for display with appropriate unit
 * @param volumeMl - Volume in milliliters (database format)
 * @param unitSystem - Display unit system
 * @param includeUnit - Whether to include unit suffix
 * @returns Formatted string with volume and optionally unit
 */
export const formatVolume = (
    volumeMl: number,
    unitSystem: UnitSystem,
    includeUnit: boolean = true
): string => {
    const displayVolume = convertFromMl(volumeMl, unitSystem);
    const unit = includeUnit ? getUnitSuffix(unitSystem) : '';

    // Format with appropriate decimal places
    if (unitSystem === 'imperial') {
        // Show 1 decimal for oz if not a whole number
        const formatted = displayVolume % 1 === 0
            ? displayVolume.toString()
            : displayVolume.toFixed(1);
        return `${formatted}${unit}`;
    } else {
        // Show whole numbers for ml
        return `${displayVolume}${unit}`;
    }
};