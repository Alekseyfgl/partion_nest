import { ArgumentsHost, Catch, ExceptionFilter, HttpException, HttpStatus } from '@nestjs/common';
import { Request, Response } from 'express';
import { ICustomErrors } from '../interfaces/error.interface';
import { HttpExceptionMessagesConst } from '../constans/http-exception-messages.const';
import { LoggerService } from '../logger/logger.service';

@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
    constructor(private readonly logger: LoggerService) {}

    catch(exception: HttpException, host: ArgumentsHost) {
        const ctx = host.switchToHttp();
        const response = ctx.getResponse<Response>();
        const request = ctx.getRequest<Request>();
        const status = exception.getStatus();

        const exceptionResponse: any = exception.getResponse();

        this.logger.debug('HttpExceptionFilter', '', { status, exceptionResponse });

        switch (status) {
            case HttpStatus.BAD_REQUEST: {
                response.status(status).json(exceptionResponse as ICustomErrors);
                break;
            }
            case HttpStatus.UNAUTHORIZED: {
                response.status(status).json({ errorsMessages: [{ message: HttpExceptionMessagesConst.UNAUTHORIZED, field: '' }] } as ICustomErrors);
                break;
            }

            case HttpStatus.INTERNAL_SERVER_ERROR: {
                response.status(status).json({ errorsMessages: [{ message: HttpExceptionMessagesConst.INTERNAL_SERVER_ERROR, field: '' }] } as ICustomErrors);
                break;
            }

            default:
                response.status(status).json(exceptionResponse);
                break;
        }
    }
}

@Catch()
export class AllExceptionFilter implements ExceptionFilter {
    constructor(private readonly logger: LoggerService) {}
    catch(exception: any, host: ArgumentsHost) {
        const ctx = host.switchToHttp();
        const response = ctx.getResponse<Response>();
        const request = ctx.getRequest<Request>();
        const status = exception instanceof HttpException ? exception.getStatus() : HttpStatus.INTERNAL_SERVER_ERROR;

        this.logger.warn('AllExceptionFilter', exception);

        const customError: ICustomErrors = { errorsMessages: [{ message: HttpExceptionMessagesConst.INTERNAL_SERVER_ERROR, field: '' }] };

        response.status(status).json(customError);
    }
}
