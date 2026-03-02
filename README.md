# SincoWeb

This project was generated using [Angular CLI](https://github.com/angular/angular-cli) version 20.2.0.

## Development server

To start a local development server, run:

```bash
ng serve
```

Once the server is running, open your browser and navigate to `http://localhost:4200/`. The application will automatically reload whenever you modify any of the source files.

## Code scaffolding

Angular CLI includes powerful code scaffolding tools. To generate a new component, run:

```bash
ng generate component component-name
```

For a complete list of available schematics (such as `components`, `directives`, or `pipes`), run:

```bash
ng generate --help
```

## Building

To build the project run:

```bash
ng build
```

This will compile your project and store the build artifacts in the `dist/` directory. By default, the production build optimizes your application for performance and speed.

## Running unit tests

To execute unit tests with the [Karma](https://karma-runner.github.io) test runner, use the following command:

```bash
ng test
```

## Running end-to-end tests

For end-to-end (e2e) testing, run:

```bash
ng e2e
```

Angular CLI does not come with an end-to-end testing framework by default. You can choose one that suits your needs.

## Additional Resources

For more information on using the Angular CLI, including detailed command references, visit the [Angular CLI Overview and Command Reference](https://angular.dev/tools/cli) page.

## Docker

This project is ready to run in Docker using the provided `Dockerfile`.

Build image:

```bash
docker build -t sinco-web .
```

Run container:

```bash
docker run --rm -p 4000:4000 --env-file .env sinco-web
```

### Environment variables for Docker Compose

Create a `.env` file (you can copy from `.env.example`) with:

- `PORT`: port used by the Node SSR server inside the container.
- `API_TARGET_URL`: backend base URL used by the SSR proxy for `/api` routes. Example for compose network: `http://api:8080`.

In production build, Angular calls `/api/*` and the Node server in `src/server.ts` proxies those requests to `API_TARGET_URL`.
