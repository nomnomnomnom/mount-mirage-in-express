// Copyright (c) 2023 Jacob Ehrlich

import { Response as MirageResponse, Server } from "miragejs";
import express from "express";
/** @typedef {"get"|"post"|"put"|"delete"|"patch"|"options"|"head"} Method */
/** @type {Method[]} */
const methods = ["get", "post", "put", "delete", "patch", "options", "head"];

/**
 * Calls to mirage's `server.get`, `.put`, `.patch`, etc., are wrapped in an
 * adapter to convert between req/res types and given directly to express for
 * routing.  Mirage serializers and mirage middleware behave as expected.
 *
 * TODO: passthroughs
 *
 * @param {Server} mirage
 * @param {express} express
 */
export function mountMirageInExpress(mirage, express) {
  /**
   * Convert Express Request to Mirage Request
   * @param {express.Request} req
   * @returns {MirageRequest}
   */
  function mirageReqFromExpressReq(req) {
    return {
      requestBody: req.body,
      url: req.url,
      requestHeaders: req.headers,
      params: req.params,
      queryParams: req.query,
    };
  }

  /**
   * Convert Mirage Response to Express Response
   * @param {MirageResponse} mirageRes
   * @param {express.Response} expressRes
   */
  function expressResFromMirageRes(mirageRes, expressRes) {
    const [statusCode, headers, payload] =
      mirageRes.toRackResponse?.() ?? mirageRes;

    Object.entries(headers).forEach(([k, v]) => expressRes.setHeader(k, v));
    expressRes.statusCode = statusCode;
    expressRes.send(payload);
  }

  /**
   * Register a mirage route handler with express.  This wraps the mirage route
   * handler with a layer which translates the express request to a mirage
   * request and translates the mirage response to an express response
   * @param {} method (a.k.a. verb)
   * @param {string} path
   * @param {(req: MirageRequest) => [number, {}, any]} cb
   */
  function registerHandlerWithExpress(method, path, cb) {
    express[method](
      path,
      /**
       * @param {express.Request} req
       * @param {express.Response} res
       */
      async (req, res) => {
        const mirageReq = mirageReqFromExpressReq(req);
        const mirageRes = await cb(mirageReq);
        return expressResFromMirageRes(mirageRes, res);
      }
    );
  }

  /**
   * Real shit.
   */
  methods.forEach((method) => {
    // swap the real mirage[method] route registration (which uses pretender)
    // with this:
    mirage[method] = (path, cb) => {
      // Register the handler with mirage to get a wrapped handler back witch
      // invokes mirage serialization and mirage middleware, too.
      let handler = mirage.registerRouteHandler(method, path, cb);
      // Then register _that_ handler with express.
      registerHandlerWithExpress(method, path, handler);
    };
  });
}
