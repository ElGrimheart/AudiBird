
// Generates a default station config - issued to each station during 'announcement'
export function generateDefaultStationConfig(stationName, stationId, stationApiKey) {
    console.log("Generating default station config for stationId:", stationId, "and apiKey:", stationApiKey);
    return {
        station: {
            state: "announced",
            id: stationId,
            api_key: stationApiKey,
            station_name: stationName,
            location: {
                desc: "",
                lat: null,
                lon: null
            },
        },
        detection_config: {
            min_confidence: 0.5,
            species_ignore_list: []
        },
        storage_manager: {
            storage_policy: "Default",
            max_storage_usage_percent: 90
        }
    };
}

// Generates a custom station config using user updated values in the format required by the station
export function generateCustomUserConfig(stationId, apiKey, configData) {
    return {
        station: {
            state: "configured",
            id: stationId,
            api_key: apiKey,
            station_name: configData.stationName,
            location: {
                lat: configData.lat,
                lon: configData.lon,
                desc: configData.locationDesc
            }
        },
        detection_config: {
            min_confidence: (configData.minConfidence/100) || 0.25,
            species_ignore_list: configData.speciesIgnoreList || []
        },
        storage_manager: {
            storage_policy: "Default",
            max_storage_usage_percent: configData.maxStoragePercent || 90
        }
    };
}