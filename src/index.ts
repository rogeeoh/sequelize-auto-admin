import AdminJS from 'adminjs';
import AdminJSExpress from '@adminjs/express';
import express from 'express';
import * as AdminJSSequelize from '@adminjs/sequelize';
import randomstring from 'randomstring';
import { DatabaseConfig, prepareDatabase } from './utils/db';
import dotenv from 'dotenv';

dotenv.config();

const {
  USERNAME,
  PASSWORD,
  DATABASE,
  HOST,
  URI,
  EXCLUDES,
  ADMIN_USER = 'admin',
  ADMIN_PASSWORD = 'password',
  PROPERTY_ORDER
} = process.env;
const PORT = process.env.PORT ?? 8080;

AdminJS.registerAdapter({
  Resource: AdminJSSequelize.Resource,
  Database: AdminJSSequelize.Database
});

const authenticate = async (email: string, password: string) => {
  if (email === ADMIN_USER && password === ADMIN_PASSWORD) {
    return { email, password };
  }
  return null;
};

const main = async () => {
  let config: DatabaseConfig;
  if (URI) {
    config = { uri: URI };
  } else if (HOST && DATABASE && USERNAME && PASSWORD) {
    config = { host: HOST, database: DATABASE, username: USERNAME, password: PASSWORD };
  } else {
    console.error('not enough configuration provided');
    console.error(`URI: ${URI}, HOST: ${HOST}, DATABASE: ${DATABASE}, USERNAME: ${USERNAME}, PASSWORD: ${PASSWORD}`);
    process.exit(1);
  }

  const models = await prepareDatabase(config);
  const allowedModels = {};
  const ignoreTables = EXCLUDES ? EXCLUDES.split(',').map(table => table.toLowerCase().trim()) : [];

  // filter models specified in env EXCLUDES
  for (const key in models) {
    if (!ignoreTables.includes(key.toLowerCase())) {
      // @ts-expect-error
      allowedModels[key] = models[key];
    }
  }

  const app = express();
  const propertyOrder = PROPERTY_ORDER?.split(',').map(p => p.trim()) ?? [];

  //
  const resourceProperties = propertyOrder.reduce((prev, cur, index) => {
    return { ...prev, [cur]: { position: index + 1 } };
  }, {});
  const admin = new AdminJS({
    rootPath: '/',
    resources: Object.values(allowedModels).map((r) => {
      // @ts-ignore
      return {
        resource: r,
        options: {
          properties: resourceProperties
        }
      };
    })

  });

  const adminRouter = AdminJSExpress.buildAuthenticatedRouter(admin,
    { authenticate, cookieName: randomstring.generate(), cookiePassword: randomstring.generate() },
    null,
    { secret: randomstring.generate(), resave: false, saveUninitialized: false }
  );
  app.use(admin.options.rootPath, adminRouter);
  app.listen(PORT, () => {
    console.log(`AdminJS started on http://localhost:${PORT}${admin.options.rootPath}`);
  });
};

main();
