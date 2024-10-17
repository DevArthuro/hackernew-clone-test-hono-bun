import { Hono } from "hono";
import { cors } from "hono/cors";
import { HTTPException } from "hono/http-exception";

import type { ErrorResponse } from "@/common/types";

import type { Context } from "./context";
import { lucia } from "./lucia";
import { authRouter } from "./routes/auth";

const app = new Hono<Context>();

app.use("*", cors(), async (c, next) => {
  const sessionId = lucia.readSessionCookie(c.req.header("Cookie") ?? "");
  if (!sessionId) {
    c.set("user", null);
    c.set("session", null);
    return next();
  }

  const { session, user } = await lucia.validateSession(sessionId);
  if (session && session.fresh) {
    c.header("Set-Cookie", lucia.createSessionCookie(session.id).serialize(), {
      append: true,
    });
  }
  if (!session) {
    c.header("Set-Cookie", lucia.createBlankSessionCookie().serialize(), {
      append: true,
    });
  }
  c.set("session", session);
  c.set("user", user);
  return next();
});

const routes = app.basePath("/api").route("/auth", authRouter);

app.onError((error, context) => {
  if (error instanceof HTTPException) {
    const errorResponse =
      error.res ??
      context.json<ErrorResponse>(
        {
          success: false,
          error: error.message,
          isFormError:
            error.cause &&
            typeof error.cause === "object" &&
            "form" in error.cause
              ? error.cause.form === true
              : false,
        },
        error.status,
      );
    return errorResponse;
  }

  return context.json<ErrorResponse>(
    {
      success: false,
      error:
        process.env.NODE_ENV === "prod"
          ? "INTERNAL ERROR SERVER"
          : (error.stack ?? error.message),
    },
    500,
  );
});

export default app;
export type ApiRoutes = typeof routes;
