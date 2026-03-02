import {
  AngularNodeAppEngine,
  createNodeRequestHandler,
  isMainModule,
  writeResponseToNodeResponse,
} from '@angular/ssr/node';
import express from 'express';
import { join } from 'node:path';

const browserDistFolder = join(import.meta.dirname, '../browser');
const apiTargetUrl = (process.env['API_TARGET_URL'] || 'http://localhost:7041').replace(/\/+$/, '');

const app = express();
const angularApp = new AngularNodeAppEngine();

app.use('/api', async (req, res, next) => {
  try {
    const targetUrl = new URL(req.originalUrl, `${apiTargetUrl}/`);
    const hasBody = req.method !== 'GET' && req.method !== 'HEAD';
    const headers = Object.entries(req.headers).reduce<Record<string, string>>((acc, [key, value]) => {
      if (!value || key === 'host' || key === 'connection' || key === 'content-length') {
        return acc;
      }

      acc[key] = Array.isArray(value) ? value.join(',') : value;
      return acc;
    }, {});

    const response = await fetch(targetUrl, {
      method: req.method,
      headers,
      body: hasBody ? (req as unknown as BodyInit) : undefined,
      redirect: 'manual',
      ...(hasBody ? ({ duplex: 'half' } as RequestInit) : {}),
    });

    res.status(response.status);
    response.headers.forEach((value, key) => {
      if (key.toLowerCase() !== 'transfer-encoding') {
        res.setHeader(key, value);
      }
    });

    if (!response.body) {
      res.end();
      return;
    }

    const responseBody = Buffer.from(await response.arrayBuffer());
    res.end(responseBody);
  } catch (error) {
    next(error);
  }
});

/**
 * Serve static files from /browser
 */
app.use(
  express.static(browserDistFolder, {
    maxAge: '1y',
    index: false,
    redirect: false,
  }),
);

/**
 * Handle all other requests by rendering the Angular application.
 */
app.use((req, res, next) => {
  angularApp
    .handle(req)
    .then((response) =>
      response ? writeResponseToNodeResponse(response, res) : next(),
    )
    .catch(next);
});

/**
 * Start the server if this module is the main entry point.
 * The server listens on the port defined by the `PORT` environment variable, or defaults to 4000.
 */
if (isMainModule(import.meta.url)) {
  const port = process.env['PORT'] || 4000;
  app.listen(port, (error) => {
    if (error) {
      throw error;
    }

    console.log(`Node Express server listening on http://localhost:${port}`);
  });
}

/**
 * Request handler used by the Angular CLI (for dev-server and during build) or Firebase Cloud Functions.
 */
export const reqHandler = createNodeRequestHandler(app);
