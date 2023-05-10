import express from 'express';
import docsRoute from './docs.route';
import config from '../config/config';

const router = express.Router();

router.get('/', (req, res) => {
  res.send({ message: 'Welcome to the API!' });
});

const defaultRoutes = [
  {
    path: '/docs',
    route: docsRoute
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
