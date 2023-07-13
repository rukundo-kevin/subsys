import express from 'express';
import helmet from 'helmet';
import compression from 'compression';
import cors from 'cors';
import httpStatus from 'http-status';
import passport from 'passport';
import cron from 'node-cron';

import { jwtStrategy } from './config/passport';
import routes from './routes/';
import { errorConverter, errorHandler } from './middlewares/error';
import ApiError from './utils/ApiError';
import config from './config/config';
import { submissionService } from './services';
const app = express();

// set security HTTP headers
app.use(
  helmet.contentSecurityPolicy({
    directives: {
      defaultSrc: ["'self'"],
      connectSrc: ["'self'", `${config.appUrl}`]
    }
  })
);

// parse json request body
app.use(express.json());

// parse urlencoded request body
app.use(express.urlencoded({ extended: true }));

// gzip compression
app.use(compression());

// enable cors
app.use(cors());
app.options('*', cors());

// jwt authentication
app.use(passport.initialize());
passport.use('jwt', jwtStrategy);

//  api routes
app.use('/api', routes);

// send back a 404 error for any unknown api request
app.use((req, res, next) => {
  next(new ApiError(httpStatus.NOT_FOUND, 'Not found'));
});

// convert error to ApiError, if needed
app.use(errorConverter);

// handle error
app.use(errorHandler);

cron.schedule('*/30 * * * * *', () => {
  submissionService.sendSubmissionNotification();
});

export default app;
