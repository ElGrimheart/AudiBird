"""Test class for SegmentHandler class"""
import pytest
import tempfile
import shutil
from pathlib import Path
import numpy as np
from station.detection.audio_capture.segment_handler import SegmentHandler

# Mock segments directory
@pytest.fixture
def temp_segments_dir():
    temp_dir = tempfile.mkdtemp()
    yield temp_dir
    shutil.rmtree(temp_dir)



# Test valid configuration
def test_config_valid(temp_segments_dir):
    valid_config = {'segments_dir': temp_segments_dir, 'sample_rate': 44100}
    segment_handler_test = SegmentHandler(valid_config)
    assert segment_handler_test._segments_dir == Path(temp_segments_dir).resolve()
    assert segment_handler_test._sample_rate == 44100

# Test default configuration
def test_config_default():
    segment_handler_test = SegmentHandler({})
    assert segment_handler_test._segments_dir == Path(SegmentHandler.SEGMENTS_DIR_DEFAULT).resolve()
    assert segment_handler_test._sample_rate == SegmentHandler.SAMPLE_RATE_DEFAULT

# Test invalid configuration
def test_config_invalid_type():
    with pytest.raises(ValueError):
        SegmentHandler("not_a_dict")

# Test invalid sample_rate type
@pytest.mark.parametrize("invalid_type", ["not_an_int", SegmentHandler.SAMPLE_RATE_DEFAULT + 0.5, None])
def test_sample_rate_invalid_type(temp_segments_dir, invalid_type):
    invalid_config = {'segments_dir': temp_segments_dir, 'sample_rate': invalid_type}
    with pytest.raises(TypeError):
        SegmentHandler(invalid_config)

# Test invalid sample_rate range
@pytest.mark.parametrize("invalid_value", [SegmentHandler.SAMPLE_RATE_MIN - 1, SegmentHandler.SAMPLE_RATE_MAX + 1])
def test_sample_rate_invalid_range(temp_segments_dir, invalid_value):
    invalid_config = {'segments_dir': temp_segments_dir, 'sample_rate': invalid_value}
    with pytest.raises(ValueError):
        SegmentHandler(invalid_config)

# Test invalid segments directory
def test_invalid_segments_dir(tmp_path):
    file_path = tmp_path / "not_a_dir"
    file_path.write_text("This is a file")
    invalid_config = {'segments_dir': str(file_path)}
    with pytest.raises(ValueError):
        SegmentHandler(invalid_config)

# Test save_segment with invalid type
def test_save_segment_invalid_type(temp_segments_dir):
    segment_handler_test = SegmentHandler({'segments_dir': temp_segments_dir})
    with pytest.raises(TypeError):
        segment_handler_test.save_segment([1, 2, 3], "test_invalid")

# Test save_segment and delete_segment valid
def test_save_and_delete_segment(temp_segments_dir):
    handler = SegmentHandler({'segments_dir': temp_segments_dir, 'sample_rate': 48000})
    segment = np.zeros((48000,), dtype=np.int16)
    filename = "test_segment"

    # Test save_segment
    handler.save_segment(segment, filename)
    saved_file = Path(temp_segments_dir) / f"{filename}.wav"
    assert saved_file.exists()

    # Test delete_segment
    handler.delete_segment(f"{filename}.wav")
    assert not saved_file.exists()