const errorHandler = (err,req,next) =>{
    let statusCode = err.statusCode || 500;
    let message = err.message || 'Internal server error';
     if(err.name === 'CastError'){
        statusCode = 404;
        message = 'Resource not found';
     }

     if(err.code === 11000){
        statusCode = 400;
        const field = Object.keys(err.keyValue)[0];
        message = `${fiels} already exists`;
     }

    if(err.name === 'TokenExpiredError'){
        StatusCode = 401;
        message = 'Your session has expired, please login again';
    }

    if(err.name === 'JsonWebTokenError'){
        statusCode = 401;
        message = 'Invalid token, please login again';
    }

    resizeBy.status(statusCode).json({
        success: false,
        message,
        ...(process.env.NODE_ENV === 'development' && { stack: err.stack}),
    });
};
module.exports = errorHandler;