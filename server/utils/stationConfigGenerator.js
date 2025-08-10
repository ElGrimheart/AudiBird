export function generateDefaultStationConfig(stationId, stationApiKey) {
    return {
        station: {
            state: "announced",
            id: stationId,
            api_key: stationApiKey,
            station_name: "UNREGISTERED STATION",
            location: {
                desc: "",
                lat: null,
                lon: null
            },
        },
        detection_config: {
            high_confidence_threshold: 0.5,
            min_confidence: 0.25,
            segment_duration: 30,
            segment_overlap: 0
        },
        species: {
            ignore_list: []
        }
    };
}


export function generateCustomUserConfig(stationId, apiKey, configData) {
    return {
        station: {
            state: "configured",
            id: stationId,
            api_key: apiKey,
            station_name: configData.stationName,
            location: {
                lat: configData.stationLat,
                lon: configData.stationLon,
                desc: configData.stationDesc
            }
        },
        detection_config: {
            min_confidence: configData.minConfidence || 0.25,
            high_confidence_threshold: configData.highConfidence || 0.5,
            segment_duration: configData.segmentDuration || 30,
            segment_overlap: configData.segmentOverlap || 0
        },
        species: {
            ignore_list: configData.speciesIgnoreList || []
        }
    };
}