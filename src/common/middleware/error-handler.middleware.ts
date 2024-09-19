import { Injectable, NestMiddleware, HttpException, HttpStatus } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { CustomError } from '../errors/custom-error';

@Injectable()
export class ErrorHandlerMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    try {
      next();
    } catch (error) {
      if (error instanceof CustomError) {
        res.status(error.statusCode).json({
          status: 'error',
          statusCode: error.statusCode,
          message: error.message,
        });
      } else if (error instanceof HttpException) {
        res.status(error.getStatus()).json({
          status: 'error',
          statusCode: error.getStatus(),
          message: error.message,
        });
      } else {
        console.error(error);
        res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
          status: 'error',
          statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
          message: 'Internal server error',
        });
      }
    }
  }
}