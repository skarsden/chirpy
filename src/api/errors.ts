export class BadRequestError extends Error {
    constructor(message: string) {
        super(message);
        const errorCode = 400;
    }
}

export class UnauthorizedError extends Error {
    constructor(message: string) {
        super(message);
        const errorCode = 401;
    }
}

export class ForbiddenError extends Error {
    constructor(message: string) {
        super(message);
        const errorCode = 403;
    }
}

export class NotFoundError extends Error {
    constructor(message: string) {
        super(message);
        const errorCode = 404;
    }
}