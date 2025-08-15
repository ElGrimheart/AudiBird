function handleError(res, err, message, status = 500) {
    console.error(message, err);
    res.status(status).json({
        status: "error",
        message,
        error: err.message || err
    });
}

export default handleError;