import { Request, Response, NextFunction } from 'express';

/**
 * CatchAsyncError is a utility function that takes an asynchronous function
 * with Express route handler signature and returns a new function with the
 * proper Express middleware signature, allowing for the automatic handling
 * of asynchronous errors.
 *
 * @param theFunc - The asynchronous function to be wrapped.
 * @returns A new function with Express middleware signature.
 */
export const CatchAsyncError = (theFunc: (req: Request, res: Response, next: NextFunction) => Promise<any>) => (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  // Wrap the asynchronous function with Promise.resolve
  // to handle asynchronous errors automatically.
  Promise.resolve(theFunc(req, res, next)).catch(next);
};
