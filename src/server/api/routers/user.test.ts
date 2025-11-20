import { describe, it, expect } from "vitest";
import { userRouter } from "./user";
import { db } from "~/server/db";
import { faker } from "@faker-js/faker";

describe("UserRouter", () => {
  describe("me", () => {
    it("should return the current user", async () => {
      const user = await db.user.create({
        data: {
          name: "Test User",
          email: faker.internet.email(),
        },
      });

      const mockSession = {
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          image: user.image,
        },
        expires: "2030-12-31T23:59:59.999Z",
      };

      const caller = userRouter.createCaller({
        db: db,
        session: mockSession,
        headers: new Headers(),
      });

      const result = await caller.me();

      expect(result).toBeDefined();
      expect(result?.id).toBe(user.id);
      expect(result?.email).toBe(user.email);
    });
  });

  describe("updateProfile", () => {
    it("should update the user profile", async () => {
      const user = await db.user.create({
        data: {
          name: "Old Name",
          email: faker.internet.email(),
        },
      });

      const mockSession = {
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          image: user.image,
        },
        expires: "2030-12-31T23:59:59.999Z",
      };

      const caller = userRouter.createCaller({
        db: db,
        session: mockSession,
        headers: new Headers(),
      });

      const newName = "New Name";
      const newImage = faker.image.avatar();

      const result = await caller.updateProfile({
        name: newName,
        image: newImage,
      });

      expect(result.name).toBe(newName);
      expect(result.image).toBe(newImage);

      const updatedUser = await db.user.findUnique({
        where: { id: user.id },
      });

      expect(updatedUser?.name).toBe(newName);
      expect(updatedUser?.image).toBe(newImage);
    });
  });
});
