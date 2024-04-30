export const imageHandlerMiddleware = (propertyName) => {
    return (req, _res, next) => {
        Object.defineProperty(req, propertyName, { value: true });
        next();
    };
};
