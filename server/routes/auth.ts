import { Hono } from "hono";
import { HTTPException } from "hono/http-exception";

import { db } from "@/adapter";
import type { Context } from "@/context";
import { userTable } from "@/db/schemas/auth";
import { lucia } from "@/lucia";
import { zValidator } from "@hono/zod-validator";
import { generateId } from "lucia";
import postgres from "postgres";

import { loginSchema, type SuccessResponse } from "@/common/types";

export const authRouter = new Hono<Context>().post(
  "/signup",
  zValidator("form", loginSchema),
  async (c) => {
    const { username, password } = c.req.valid("form");
    const passwordHash = await Bun.password.hash(password);
    const userId = generateId(15);

    try {
      await db.insert(userTable).values({
        id: userId,
        username,
        password_hash: passwordHash,
      });

      const session = await lucia.createSession(userId, { username });
      const sessionCookie = lucia.createSessionCookie(session.id);

      c.header("Set-Cookie", sessionCookie.serialize(), { append: true });

      return c.json<SuccessResponse>(
        {
          success: true,
          message: "User created successfully",
        },
        201,
      );
    } catch (e) {
      if (e instanceof postgres.PostgresError && e.code === "23505") {
        throw new HTTPException(409, { message: "Username already used" });
      }
      throw new HTTPException(500, { message: "Failed to create user" });
    }
  },
);
