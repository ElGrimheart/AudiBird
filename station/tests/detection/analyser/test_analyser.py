"""Test class for Analyser class"""
import pytest
from station.detection.analyser.analyser import Analyser

# Test valid configuration
def test_config_valid():
    config_valid = {
        'lat': 51.5,
        'lon': -0.1,
        'birdnet_min_confidence': 0.2,
        'sensitivity': 1.0,
        'user_min_confidence': 0.5,
        'segments_dir': 'data/segments'
    }
    analyser_test = Analyser(config_valid)
    assert analyser_test._lat == 51.5
    assert analyser_test._lon == -0.1
    assert analyser_test._analyser_min_confidence == 0.2
    assert analyser_test._sensitivity == 1.0
    assert analyser_test._user_min_confidence == 0.5
    assert str(analyser_test._segments_dir).endswith('data/segments')

# Test default configuration
def test_config_default():
    analyser_test = Analyser({})
    assert analyser_test._lat is None
    assert analyser_test._lon is None
    assert analyser_test._analyser_min_confidence == Analyser.BIRDNET_MIN_CONFIDENCE_DEFAULT
    assert analyser_test._sensitivity == Analyser.BIRDNET_SENSITIVITY_DEFAULT
    assert analyser_test._user_min_confidence == Analyser.BIRDNET_USER_MIN_CONFIDENCE_DEFAULT
    assert str(analyser_test._segments_dir).endswith(Analyser.SEGMENTS_DIR_DEFAULT)

# Test invalid config type
def test_config_invalid_type():
    with pytest.raises(TypeError):
        Analyser("not_a_dict")

# Test invalid latitude type
@pytest.mark.parametrize("invalid_lat", ["not_a_float", None, [51.5]])
def test_lat_invalid_type(invalid_lat):
    config_invalid = {'lat': invalid_lat}
    if invalid_lat is not None:
        with pytest.raises(TypeError):
            Analyser(config_invalid)

# Test invalid latitude range
@pytest.mark.parametrize("invalid_lat", [Analyser.LAT_MIN - 1, Analyser.LAT_MAX + 1])
def test_lat_invalid_range(invalid_lat):
    config_invalid = {'lat': invalid_lat}
    with pytest.raises(ValueError):
        Analyser(config_invalid)

# Test invalid longitude type
@pytest.mark.parametrize("invalid_lon", ["not_a_float", None, [0.1]])
def test_lon_invalid_type(invalid_lon):
    config_invalid = {'lon': invalid_lon}
    if invalid_lon is not None:
        with pytest.raises(TypeError):
            Analyser(config_invalid)

# Test invalid longitude range
@pytest.mark.parametrize("invalid_lon", [Analyser.LON_MIN - 1, Analyser.LON_MAX + 1])
def test_lon_invalid_range(invalid_lon):
    config_invalid = {'lon': invalid_lon}
    with pytest.raises(ValueError):
        Analyser(config_invalid)

# Test invalid birdnet_min_confidence type
@pytest.mark.parametrize("invalid_conf", ["not_a_float", None, [0.2]])
def test_birdnet_min_confidence_invalid_type(invalid_conf):
    config_invalid = {'birdnet_min_confidence': invalid_conf}
    with pytest.raises(TypeError):
        Analyser(config_invalid)

# Test invalid birdnet_min_confidence range
@pytest.mark.parametrize("invalid_conf", [Analyser.ANALYSER_CONFIDENCE_MIN - 0.1, Analyser.ANALYSER_CONFIDENCE_MAX + 0.1])
def test_birdnet_min_confidence_invalid_range(invalid_conf):
    config_invalid = {'birdnet_min_confidence': invalid_conf}
    with pytest.raises(ValueError):
        Analyser(config_invalid)

# Test invalid sensitivity type
@pytest.mark.parametrize("invalid_sens", ["not_a_float", None, [1.0]])
def test_sensitivity_invalid_type(invalid_sens):
    config_invalid = {'sensitivity': invalid_sens}
    with pytest.raises(TypeError):
        Analyser(config_invalid)

# Test invalid sensitivity range
@pytest.mark.parametrize("invalid_sens", [Analyser.SENSITIVITY_MIN - 0.1, Analyser.SENSITIVITY_MAX + 0.1])
def test_sensitivity_invalid_range(invalid_sens):
    config = {'sensitivity': invalid_sens}
    with pytest.raises(ValueError):
        Analyser(config)

# Test invalid user_min_confidence type
@pytest.mark.parametrize("invalid_conf", ["not_a_float", None, [0.5]])
def test_user_min_confidence_invalid_type(invalid_conf):
    config_invalid = {'user_min_confidence': invalid_conf}
    with pytest.raises(TypeError):
        Analyser(config_invalid)

# Test invalid user_min_confidence range
@pytest.mark.parametrize("invalid_conf", [Analyser.USER_CONFIDENCE_MIN - 0.1, Analyser.USER_CONFIDENCE_MAX + 0.1])
def test_user_min_confidence_invalid_range(invalid_conf):
    config_invalid = {'user_min_confidence': invalid_conf}
    with pytest.raises(ValueError):
        Analyser(config_invalid)
        
# Test invalid filename
def test_analyse_segment_invalid_filename(tmp_path):
    valid_config = {'segments_dir': str(tmp_path)}
    analyser = Analyser(valid_config)
    invalid_filename = "invalid/segment:name"
    with pytest.raises((TypeError, FileNotFoundError, ValueError)):
        analyser.analyse_segment(invalid_filename)