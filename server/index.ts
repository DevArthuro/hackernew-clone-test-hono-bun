import { Hono } from "hono";
import { HTTPException } from "hono/http-exception";

import type { ErrorResponse } from "@/common/types";

const app = new Hono();

// error handler
// throw new HTTPException(404, {
//   message: "error unexpected",
//   cause: { form: true },
// });

app.get("/", (c) => {
  return c.text("Hello Hono!");
});

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
