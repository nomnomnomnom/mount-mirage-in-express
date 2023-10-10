# Mount mirage.js routes in express.js

Mount your Mirage JS routes into an Express app with one line of code.

Why? I won't ask. Maybe you like Mirage JS in-memory data store, fixtures, factories, or ORM. Maybe you like the flexibility to run a server both standalone and embedded in the client code. Maybe you don't want to rewrite a ton of route handlers or maintain two sets. Whatever the reason, this is what you're looking for.

It's Mirage _inside_ Express.

## Install

```sh
npm i --save-dev mount-mirage-in-express
```

## Use

```js
import { inBrowser, mountMirageInExpress } from "mount-mirage-in-express";

/*
 * 1. Make your Express app (like normal)
 *    and add middleware and routes (like normal)
 */
const app = express();

/*
 * 2. Then create your Mirage server,
 *    and mount it to your express app in the `routes()` section
 */
createServer({
  routes() {
    /*
     * Call `mountMirageInExpress(this, app)` like this at the top
     */
    if (!inBrowser()) mountMirageInExpress(this, app);

    this.get("/hi", (schema, req) => {
      return new Response(200, { hello: "world" }, "Hi from Mirage!");
    });
  },
});

/*
 * 3. Start your Express server (like normal)
 */
const port = process.env.port ?? 3000;
app.listen(port, () => {
  console.log(`Listening on port ${port}`);
});
```
