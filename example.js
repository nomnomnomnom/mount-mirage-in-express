import { Model, Response, createServer } from "miragejs";
import express from "express";
import bodyParser from "body-parser";
import { inBrowser, mountMirageInExpress } from "./index.js";

/*
 * 1. Make your Express app (like normal)
 */

const app = express();

/*
 * 2. Add Express middleware and routes (like normal)
 */
app.use(bodyParser.json());

app.get("/hello", (req, res) => {
  res.send("Hello world!");
});

/*
 * 3. Create your Mirage server, with one little difference in the `routes()` section:
 */
createServer({
  models: {
    user: Model.extend({}),
  },

  fixtures: {
    users: [{ id: 2 }, { id: 1, name: "user 1", email: "user1@example.com" }],
  },

  routes() {
    /*
     * Call `mountMirageInExpress(this, app)` before registering any routes
     */
    if (!inBrowser()) mountMirageInExpress(this, app);

    this.get("/users/:id", (schema, req) => {
      return new Response(418, { hi: "world" }, schema.users.all());
    });

    this.put("/users/:id", (schema, req) => {
      return new Response(200, { bye: "world" }, "Bye from Mirage!");
    });
  },
});

/*
 * 4. Add other Express middleware and routes (like normal)
 */
app.get("/goodbye", (req, res) => {
  res.send("Good bye world!");
});

/*
 * 5. Start your Express server (like normal)
 */
const port = process.env.port ?? 3000;
app.listen(port, () => {
  console.log(`# Listening on port ${port}`);
  console.log("#");
  console.log("# try");
  console.log("curl http://localhost:3000/hello");
  console.log(`curl http://localhost:3000/users/31`);
  console.log(
    `curl --data '{"foo":"bar"}' http://localhost:3000/users/31 -X PUT -H "Content-Type: application/json"`
  );
  console.log("curl http://localhost:3000/goodbye");
});
