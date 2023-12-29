export const CatchAsyncError = (theFunc:any) => (err: any, req: any, res: any, next: ((reason: any) => PromiseLike<never>) | null | undefined) => {
    Promise.resolve(theFunc(err, req, res, next)).catch(next)
}