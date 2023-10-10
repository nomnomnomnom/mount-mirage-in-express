// Copyright (c) 2023 Jacob Ehrlich

import { it, suite, expect } from "./_framework.js";

suite("./example.js", async () => {
  it("typical express route handler works", async () => {
    const res = await fetch("http://127.0.0.1:3000/hello");
    expect(res.status).toBe(200);
    expect(await res.text()).toBe("Hello world!");
  });

  it("GET from mirage works: status, payload, and headers", async () => {
    const res = await fetch("http://127.0.0.1:3000/users/1");
    expect(res.status).toBe(418);
    expect(await res.json()).toEqual({
      users: [
        {
          id: "2",
        },
        {
          id: "1",
          name: "user 1",
          email: "user1@example.com",
        },
      ],
    });
    expect(res.headers.get("hi")).toBe("world");
  });

  it("PUT to mirage works: status, payload, and headers", async () => {
    const res = await fetch("http://127.0.0.1:3000/users/1", {
      method: "PUT",
      body: { x: 3 },
    });
    expect(res.status).toBe(200);
    expect(await res.text()).toBe("Bye from Mirage!");
    expect(res.headers.get("bye")).toBe("world");
  });

  it("typical express route handler works when registered after mirage handlers", async () => {
    const res = await fetch("http://127.0.0.1:3000/goodbye");
    expect(res.status).toBe(200);
    expect(await res.text()).toBe("Good bye world!");
  });
});
