import express from 'express';
import config from '../config/config';
import docsRoute from './docs.route';
import authRoute from './auth.route';

const router = express.Router();

router.get('/', (req, res) => {
  res.send({ message: 'Welcome to the API!' });
});

const defaultRoutes = [
  {
    path: '/docs',
    route: docsRoute
  },
  {
    path: '/auth',
    route: authRoute
  }
];

const devRoutes = [
  {
    path: '/docs',
    route: docsRoute
  }
];

defaultRoutes.forEach((route) => {
  router.use(route.path, route.route);
});

if (config.env === 'development') {
  devRoutes.forEach((route) => {
    router.use(route.path, route.route);
  });
}

export default router;
