"""Test class for AudioCapture class"""
import pytest
from unittest.mock import Mock
from station.detection.audio_capture.audio_capture import AudioCapture

# Mock dependencies and methods
@pytest.fixture
def mock_segmenter():
    mock_segmenter = Mock()
    mock_segmenter.append_audio = Mock()
    mock_segmenter.get_segments = Mock(return_value=[])
    return mock_segmenter

@pytest.fixture
def mock_segment_handler():
    mock_segment_handler = Mock()
    mock_segment_handler.save_segment = Mock()
    return mock_segment_handler


# Test valid configuration
def test_config_valid(mock_segmenter, mock_segment_handler):
    valid_config = {'sample_rate': 44100, 'channels': 2, 'dtype': 'float32'}
    audio_cap_test = AudioCapture(valid_config, mock_segmenter, mock_segment_handler)
    assert audio_cap_test._sample_rate == 44100
    assert audio_cap_test._channels == 2
    assert audio_cap_test._dtype == 'float32'

# Test invalid configuration type
def test_config_invalid_type(mock_segmenter, mock_segment_handler):
    invalid_config = "not_a_dict"
    with pytest.raises(TypeError):
        AudioCapture(invalid_config, mock_segmenter, mock_segment_handler)

# Test default configuration
def test_config_default(mock_segmenter, mock_segment_handler):
    empty_config = {}
    audio_cap_test = AudioCapture(empty_config, mock_segmenter, mock_segment_handler)
    assert audio_cap_test._sample_rate == AudioCapture.SAMPLE_RATE_DEFAULT
    assert audio_cap_test._channels == AudioCapture.CHANNELS_DEFAULT
    assert audio_cap_test._dtype == AudioCapture.DTYPE_DEFAULT

# Test invalid sample rate type
@pytest.mark.parametrize("invalid_type", ["not_an_int", 7.5, None])
def test_sample_rate_invalid_type(invalid_type, mock_segmenter, mock_segment_handler):
    invalid_config = {'sample_rate': invalid_type}
    with pytest.raises(TypeError):
        AudioCapture(invalid_config, mock_segmenter, mock_segment_handler)

# Test invalid sample rate range
@pytest.mark.parametrize("invalid_value", [AudioCapture.SAMPLE_RATE_MIN - 1, AudioCapture.SAMPLE_RATE_MAX + 1])
def test_sample_rate_invalid_range(invalid_value, mock_segmenter, mock_segment_handler):
    invalid_config = {'sample_rate': invalid_value}
    with pytest.raises(ValueError):
        AudioCapture(invalid_config, mock_segmenter, mock_segment_handler)

# Test invalid channels type
@pytest.mark.parametrize("invalid_type", ["not_an_int", AudioCapture.CHANNELS_MAX + 0.5, None])
def test_invalid_channels_type(invalid_type, mock_segmenter, mock_segment_handler):
    invalid_config = {'channels': invalid_type}
    with pytest.raises(TypeError):
        AudioCapture(invalid_config, mock_segmenter, mock_segment_handler)

# Test invalid channels range
@pytest.mark.parametrize("invalid_value", [AudioCapture.CHANNELS_MIN - 1, AudioCapture.CHANNELS_MAX + 1])
def test_invalid_channels_range(invalid_value, mock_segmenter, mock_segment_handler):
    invalid_config = {'channels': invalid_value}
    with pytest.raises(ValueError):
        AudioCapture(invalid_config, mock_segmenter, mock_segment_handler)

# Test invalid dtype
def test_invalid_dtype(mock_segmenter, mock_segment_handler):
    invalid_config = {'dtype': 'int32'}
    with pytest.raises(ValueError):
        AudioCapture(invalid_config, mock_segmenter, mock_segment_handler)

# Test invalid segmenter
def test_invalid_segmenter(mock_segment_handler):
    invalid_segmenter = object()
    config = {}
    with pytest.raises(ValueError):
        AudioCapture(config, invalid_segmenter, mock_segment_handler)

# Test invalid segment handler
def test_invalid_segment_handler(mock_segmenter):
    invalid_segment_handler = object()
    config = {}
    with pytest.raises(ValueError):
        AudioCapture(config, mock_segmenter, invalid_segment_handler)