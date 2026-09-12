import { Request, Response, NextFunction, RequestHandler } from "express";
import { ZodType } from "zod";

/**
 * Request body validation middleware using Zod.
 * Validates req.body against the provided schema before passing control to the controller.
 * Any ZodError thrown during parse is caught and passed to next(error),
 * which the global error handler transforms into a standard 400 response.
 */
export const validate = (schema: ZodType): RequestHandler => {
  return (req: Request, _res: Response, next: NextFunction): void => {
    try {
      req.body = schema.parse(req.body);
      next();
    } catch (error) {
      next(error);
    }
  };
};

/**
 * Query parameter validation middleware using Zod.
 * Validates req.query against the provided schema and safely overrides
 * req.query with validated/coerced values (compatible with Express 5 getter).
 * Any ZodError thrown during parse is caught and passed to next(error).
 */
export const validateQuery = (schema: ZodType): RequestHandler => {
  return (req: Request, _res: Response, next: NextFunction): void => {
    try {
      const parsed = schema.parse(req.query);
      Object.defineProperty(req, "query", {
        value: parsed,
        writable: true,
        enumerable: true,
        configurable: true,
      });
      next();
    } catch (error) {
      next(error);
    }
  };
};
