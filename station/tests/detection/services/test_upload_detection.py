"""Test class for upload_detection function"""
import pytest
from station.detection.services.upload_detection import upload_detection

# Mock test data
@pytest.fixture
def valid_config():
    return {
        "station_id": "station123",
        "station_api_key": "apikey123"
    }

@pytest.fixture
def valid_detection():
    return {
        "common_name": "Robin",
        "scientific_name": "Erithacus rubecula",
        "confidence": 0.95,
        "duration": 3.0,
        "filesize": 123456
    }

@pytest.fixture
def valid_station_metadata():
    return {"location": "Test Station"}

@pytest.fixture
def valid_audio_metadata():
    return {"sample_rate": 48000}

@pytest.fixture
def valid_processing_metadata():
    return {"method": "birdnet"}



# Test invalid config type
def test_invalid_config_type(valid_detection, valid_station_metadata, valid_audio_metadata, valid_processing_metadata):
    with pytest.raises(TypeError):
        upload_detection("20250820_120000_000000.wav", valid_detection, "not_a_dict", valid_station_metadata, valid_audio_metadata, valid_processing_metadata)

# Test invalid api key
@pytest.mark.parametrize("missing_key", ["station_id", "station_api_key"])
def test_config_missing_required_key(missing_key, valid_config, valid_detection, valid_station_metadata, valid_audio_metadata, valid_processing_metadata):
    invalid_config = valid_config.copy()
    del invalid_config[missing_key]
    with pytest.raises(ValueError):
        upload_detection("20250820_120000_000000.wav", valid_detection, invalid_config, valid_station_metadata, valid_audio_metadata, valid_processing_metadata)

# Test invalid detection type
def test_invalid_detection_type(valid_config, valid_station_metadata, valid_audio_metadata, valid_processing_metadata):
    with pytest.raises(TypeError):
        upload_detection("20250820_120000_000000.wav", "not_a_dict", valid_config, valid_station_metadata, valid_audio_metadata, valid_processing_metadata)

# Test invalid detection dict
@pytest.mark.parametrize("missing_key", ["common_name", "scientific_name", "confidence"])
def test_detection_missing_required_key(missing_key, valid_config, valid_detection, valid_station_metadata, valid_audio_metadata, valid_processing_metadata):
    invalid_detection = valid_detection.copy()
    del invalid_detection[missing_key]
    with pytest.raises(ValueError):
        upload_detection("20250820_120000_000000.wav", invalid_detection, valid_config, valid_station_metadata, valid_audio_metadata, valid_processing_metadata)

# Test invalid filename
def test_invalid_filename_type(valid_config, valid_detection, valid_station_metadata, valid_audio_metadata, valid_processing_metadata):
    with pytest.raises(AttributeError):
        upload_detection(12345, valid_detection, valid_config, valid_station_metadata, valid_audio_metadata, valid_processing_metadata)

# Test invalid datetime format
def test_invalid_filename_format(valid_config, valid_detection, valid_station_metadata, valid_audio_metadata, valid_processing_metadata):
    with pytest.raises(ValueError):
        upload_detection("not_a_timestamp.wav", valid_detection, valid_config, valid_station_metadata, valid_audio_metadata, valid_processing_metadata)