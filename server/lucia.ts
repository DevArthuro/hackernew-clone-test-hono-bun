import { Lucia } from "lucia";

import { adapter } from "./adapter";

export const lucia = new Lucia(adapter, {
  sessionCookie: {
    attributes: {
      // Set to true when using HTTPS
      secure: process.env.NODE_ENV === "prod",
    },
  },
  getUserAttributes: (att) => ({
    username: att.username,
  }),
});

// Important !
declare module "lucia" {
  interface Register {
    Lucia: typeof lucia;
    DatabaseUserAttributes: { username: string };
  }
}
