"""Test class for DetectionAggregator class"""
import pytest
import tempfile
import shutil
import os
import numpy as np
from station.detection.services.detection_aggregator import DetectionAggregator

# Mock temp directory
@pytest.fixture
def temp_output_dir():
    temp_dir = tempfile.mkdtemp()
    yield temp_dir
    shutil.rmtree(temp_dir)


# Test valid configuration
def test_config_valid(temp_output_dir):
    valid_config = {'recordings_dir': temp_output_dir, 'sample_rate': 44100, 'segment_overlap': 2}
    aggreagator_test = DetectionAggregator(valid_config)
    assert aggreagator_test._output_dir == temp_output_dir
    assert aggreagator_test._sample_rate == 44100
    assert aggreagator_test._segment_overlap == 2

# Test default configuration
def test_config_default():
    aggreagator_test = DetectionAggregator({})
    assert aggreagator_test._output_dir == DetectionAggregator.OUTPUT_DIR_DEFAULT
    assert aggreagator_test._sample_rate == DetectionAggregator.SAMPLE_RATE_DEFAULT
    assert aggreagator_test._segment_overlap == DetectionAggregator.SEGMENT_OVERLAP_DEFAULT

# Test invalid config type
def test_config_invalid_type():
    with pytest.raises(TypeError):
        DetectionAggregator("not_a_dict")

# Test invalid sample rate range
@pytest.mark.parametrize("invalid_value", [DetectionAggregator.SAMPLE_RATE_MIN - 1, DetectionAggregator.SAMPLE_RATE_MAX + 1])
def test_sample_rate_invalid_range(temp_output_dir, invalid_value):
    aggreagator_test = {'recordings_dir': temp_output_dir, 'sample_rate': invalid_value}
    with pytest.raises(ValueError):
        DetectionAggregator(aggreagator_test)

# Test invalid segment_overlap type
@pytest.mark.parametrize("invalid_type", ["not_an_int", 2.5, None])
def test_segment_overlap_invalid_type(temp_output_dir, invalid_type):
    invalid_config = {'recordings_dir': temp_output_dir, 'segment_overlap': invalid_type}
    with pytest.raises(ValueError):
        DetectionAggregator(invalid_config)

# Test invalid segment_overlap value (negative)
def test_segment_overlap_negative(temp_output_dir):
    invalid_config = {'recordings_dir': temp_output_dir, 'segment_overlap': -1}
    with pytest.raises(ValueError):
        DetectionAggregator(invalid_config)

# Test invalid output directory (not a directory)
def test_invalid_output_dir(tmp_path):
    file_path = tmp_path / "not_a_dir"
    file_path.write_text("This is a file")
    invalid_config = {'recordings_dir': str(file_path)}
    with pytest.raises(TypeError):
        DetectionAggregator(invalid_config)

# Test aggregate with empty detections
def test_aggregate_empty():
    aggreagator_test = DetectionAggregator({})
    result = aggreagator_test.aggregate([])
    assert result == []

# Test aggregate with invalid detections type
def test_aggregate_invalid_type():
    aggreagator_test = DetectionAggregator({})
    with pytest.raises(TypeError):
        aggreagator_test.aggregate("not_a_list")

# Test _merge_audio_segments with invalid type
def test_merge_audio_segments_invalid_type():
    aggreagator_test = DetectionAggregator({})
    with pytest.raises(TypeError):
        aggreagator_test._merge_audio_segments("not_a_list")

# Test _merge_audio_segments with non-string in list
def test_merge_audio_segments_non_string(temp_output_dir):
    aggreagator_test = DetectionAggregator({'recordings_dir': temp_output_dir})
    with pytest.raises(TypeError):
        aggreagator_test._merge_audio_segments([123, "valid.wav"])

# Test _merge_audio_segments with non-existent file
def test_merge_audio_segments_file_not_found(temp_output_dir):
    aggreagator_test = DetectionAggregator({'recordings_dir': temp_output_dir})
    with pytest.raises(FileNotFoundError):
        aggreagator_test._merge_audio_segments(["does_not_exist.wav"])

# Test _save_merged_audio with invalid audio_data type
def test_save_merged_audio_invalid_type(temp_output_dir):
    aggreagator_test = DetectionAggregator({'recordings_dir': temp_output_dir})
    with pytest.raises(TypeError):
        aggreagator_test._save_merged_audio([1, 2, 3], 1.0)