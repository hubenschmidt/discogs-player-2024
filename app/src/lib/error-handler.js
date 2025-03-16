module.exports = (err, req, res, next) => {
    try {
        const status = err?.response?.status || err?.status || 500;
        const message = err?.message || 'Something went wrong.';
        const details = err?.details || undefined;

        if (err?.response?.data?.response) {
            return res.status(status).json(err?.response?.data?.response);
        }

        if (err?.response?.data) {
            return res.status(status).json(err?.response?.data);
        }

        return res.status(status).json({
            message: message,
            details: details,
        });
    } catch (error) {
        console.error(error);
        res.status(500).json('Something went wrong.');
    }
};
