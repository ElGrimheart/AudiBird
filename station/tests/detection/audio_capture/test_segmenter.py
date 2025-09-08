"""Test class for Segmenter class"""
import pytest
import numpy as np
from station.detection.audio_capture.segmenter import Segmenter

# Test valid configuration
def test_config_valid():
    valid_config = {'sample_rate': 44100, 'segment_duration': 5, 'segment_overlap': 2, 'dtype': 'float32'}
    segmenter_test = Segmenter(valid_config)
    assert segmenter_test._sample_rate == 44100
    assert segmenter_test._segment_duration == 5
    assert segmenter_test._segment_overlap == 2
    assert segmenter_test._dtype == 'float32'

# Test default configuration
def test_config_default():
    segmenter_test = Segmenter({})
    assert segmenter_test._sample_rate == Segmenter.SAMPLE_RATE_DEFAULT
    assert segmenter_test._segment_duration == Segmenter.SEGMENT_DURATION_DEFAULT
    assert segmenter_test._segment_overlap == Segmenter.SEGMENT_OVERLAP_DEFAULT
    assert segmenter_test._dtype == Segmenter.DTYPE_DEFAULT

# Test invalid config type
def test_config_invalid_type():
    with pytest.raises(TypeError):
        Segmenter("not_a_dict")

# Test invalid sample rate type
@pytest.mark.parametrize("invalid_type", ["not_an_int", Segmenter.SAMPLE_RATE_DEFAULT + 0.5, None])
def test_sample_rate_invalid_type(invalid_type):
    invalid_config = {'sample_rate': invalid_type}
    with pytest.raises(TypeError):
        Segmenter(invalid_config)

# Test invalid sample rate range
@pytest.mark.parametrize("invalid_value", [Segmenter.SAMPLE_RATE_MIN - 1, Segmenter.SAMPLE_RATE_MAX + 1])
def test_sample_rate_invalid_range(invalid_value):
    invalid_config = {'sample_rate': invalid_value}
    with pytest.raises(ValueError):
        Segmenter(invalid_config)

# Test invalid segment duration type
@pytest.mark.parametrize("invalid_type", ["not_an_int", Segmenter.SEGMENT_DURATION_DEFAULT + 0.5, None])
def test_segment_duration_invalid_type(invalid_type):
    invalid_config = {'segment_duration': invalid_type}
    with pytest.raises(TypeError):
        Segmenter(invalid_config)

# Test invalid segment duration range
@pytest.mark.parametrize("invalid_value", [Segmenter.SEGMENT_DURATION_MIN - 1, Segmenter.SEGMENT_DURATION_MAX + 1])
def test_segment_duration_invalid_range(invalid_value):
    invalid_config = {'segment_duration': invalid_value}
    with pytest.raises(ValueError):
        Segmenter(invalid_config)

# Test invalid segment overlap type
@pytest.mark.parametrize("invalid_type", ["not_an_int", Segmenter.SEGMENT_OVERLAP_DEFAULT + 0.5, None])
def test_segment_overlap_invalid_type(invalid_type):
    invalid_config = {'segment_overlap': invalid_type}
    with pytest.raises(TypeError):
        Segmenter(invalid_config)

# Test invalid segment overlap range
@pytest.mark.parametrize("invalid_value", [Segmenter.SEGMENT_OVERLAP_MIN - 1, Segmenter.SEGMENT_OVERLAP_MAX + 1])
def test_segment_overlap_invalid_range(invalid_value):
    invalid_config = {'segment_overlap': invalid_value}
    with pytest.raises(ValueError):
        Segmenter(invalid_config)

# Test segment_overlap >= segment_duration
def test_segment_overlap_greater_than_duration():
    invalid_config = {'segment_duration': 3, 'segment_overlap': 3}
    with pytest.raises(ValueError):
        Segmenter(invalid_config)

# Test invalid dtype
def test_invalid_dtype():
    invalid_config = {'dtype': 'int32'}
    with pytest.raises(ValueError):
        Segmenter(invalid_config)

# Test append_audio with invalid type
def test_append_audio_invalid_type():
    segmenter_test = Segmenter({})
    with pytest.raises(ValueError):
        segmenter_test.append_audio([1, 2, 3]) 

# Test append_and_get_segments
def test_append_and_get_segments():
    valid_config = {'sample_rate': 48000, 'segment_duration': 2, 'segment_overlap': 1, 'dtype': 'int16'}
    segmenter = Segmenter(valid_config)
    
    # 1Nr segment = 2secs * 48000 samples/sec = 96000 samples per segment
    # Sample overlap = 48000 samples/sec
    # Mock audio signal equivalent to 2 segments = (2 * 96000 - 48000 = 144000) and append
    audio = np.arange(144000, dtype=np.int16)
    segmenter.append_audio(audio)
    segments = segmenter.get_segments()

    # Should return 2 segments with 96000 samples in each (144000 + 48000 / 2)
    assert len(segments) == 2
    assert all(len(segment) == 96000 for segment in segments)