import logging

def station_logger():
    """
    Logger for recording station events and errors.
    Creates a logger instance with specified handlers for console and file output.
    """
    logger = logging.getLogger()
    logger.setLevel(logging.INFO)
    info_formatter = logging.Formatter("%(asctime)s %(levelname)s: %(message)s")
    
    # Console logs
    console_handler = logging.StreamHandler()
    console_handler.setLevel(logging.INFO)
    console_handler.setFormatter(info_formatter)

    # Info logs
    info_handler = logging.FileHandler("data/logs/info.log")
    info_handler.setLevel(logging.INFO)
    info_handler.setFormatter(info_formatter)

    # Error logs
    error_handler = logging.FileHandler("data/logs/error.log")
    error_handler.setLevel(logging.ERROR)
    error_formatter = logging.Formatter("%(asctime)s %(levelname)s [%(filename)s:%(lineno)d %(funcName)s]: %(message)s")
    error_handler.setFormatter(error_formatter)
    
    # Setup handlers
    logger.handlers = []
    logger.addHandler(info_handler)
    logger.addHandler(error_handler)
    logger.addHandler(console_handler)