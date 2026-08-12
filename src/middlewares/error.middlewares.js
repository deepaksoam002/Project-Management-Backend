import { ApiError } from "../utils/apiError.js";


const globalErrorHandler = (err, req, res, next) => {

    let error = err;

    if (!(error instanceof ApiError)) {
        const statusCode = error.statusCode || 500;
        const message = error.message || "Something went wrong"
        console.log("status code",statusCode);
        error = new ApiError(statusCode, message, error.error || [], error.stack)
    }

    const response = {
        statusCode: error.statusCode,
        success: false,
        message: error.message,
        errors: error.errors,
        stack : process.env.NODE_ENV = "production"? undefined : error.stack
    }

    return res.status(error.statusCode).json(response);
};

export { globalErrorHandler };
