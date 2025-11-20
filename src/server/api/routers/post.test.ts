import { describe, it, expect } from "vitest";
import { postRouter } from "./post";
import { db } from "~/server/db";
import { faker } from "@faker-js/faker";

describe("PostRouter", () => {
  describe("create", () => {
    it("should create a post successfully", async () => {
      const user = await db.user.create({
        data: {
          name: "Test User",
          email: faker.internet.email(),
        },
      });

      const mockSession = {
        user,
        expires: "2030-12-31T23:59:59.999Z",
      };

      const caller = postRouter.createCaller({
        db: db,
        session: mockSession,
        headers: new Headers(),
      });

      const result = await caller.create({ name: "Test Post" });

      expect(result.name).toEqual("Test Post");

      const post = await db.post.findUnique({
        where: {
          id: result.id,
        },
      });

      expect(post).toBeDefined();
    });
  });
});
