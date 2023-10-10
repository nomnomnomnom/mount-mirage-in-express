// Copyright (c) 2023 Jacob Ehrlich

import { spawn } from "child_process";

const runtime = process.env.RUNTIME ?? "node";

const all = [];
let failed = false;

export function it(name, cb) {
  all.push(async () => {
    try {
      await cb();
      console.log(`✅ ${name}`);
    } catch (e) {
      console.log(`🚫 ${name}`);
      console.error(e);
      console.error(e.stack);
      failed = true;
    }
  });
}

export async function suite(file, cb) {
  await startServer(file, async () => {
    await cb();
    await Promise.all(all.map((test) => test()));
  });

  if (failed) {
    process.exit(1);
  }
}

async function startServer(file, cb) {
  const child = spawn(runtime, [file]);

  try {
    await waitUntilServerStarts();
    await cb();
  } finally {
    child.kill();
  }
}

async function waitUntilServerStarts() {
  for (let i = 0; i < 100; i++) {
    try {
      await sleep(19);
      await fetch("http://localhost:3000/hello");
      break;
    } catch (err) {
      if (
        // bun
        err.code === "ConnectionRefused" ||
        // nodejs
        err.cause?.code === "ECONNREFUSED"
      ) {
        continue;
      }
      throw err;
    }
  }
}

async function sleep(time) {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve();
    }, time);
  });
}

export function pp(arg) {
  return JSON.stringify(arg);
}

export function expect(val) {
  return {
    toBe(arg) {
      if (val !== arg) {
        throw new Error(`\nExpected\n  ${pp(val)}\nto be\n  ${pp(arg)}`);
      }
    },
    toEqual(arg) {
      if (!deepEqual(val, arg)) {
        throw new Error(`\nExpected\n  ${pp(val)}\nto equal\n  ${pp(arg)}`);
      }
    },
  };
}

export function deepEqual(a, b) {
  // if the number of keys is different, they are different
  if (Object.keys(a).length !== Object.keys(b).length) {
    return false;
  }
  for (const key in a) {
    const a_value = a[key];
    const b_value = b[key];
    if (
      (a_value instanceof Object && !deepEqual(a_value, b_value)) ||
      (!(a_value instanceof Object) && a_value !== b_value)
    ) {
      return false;
    }
  }
  return true;
}
