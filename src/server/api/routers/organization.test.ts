import { describe, it, expect } from "vitest";
import { organizationRouter } from "./organization";
import { db } from "~/server/db";
import { Role } from "@prisma/client";
import { faker } from "@faker-js/faker";

describe("organization router", () => {
  describe("create", () => {
    it("should create an organization and make the creator an admin", async () => {
      // Create a user
      const user = await db.user.create({
        data: {
          name: faker.person.fullName(),
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
        expires: new Date().toISOString(),
      };

      const caller = organizationRouter.createCaller({
        db: db,
        session: mockSession,
        headers: new Headers(),
      });

      const orgName = "Test Org";
      const result = await caller.create({ name: orgName });

      expect(result).toBeDefined();
      expect(result.name).toBe(orgName);

      // Verify membership
      const membership = await db.member.findUnique({
        where: {
          userId_organizationId: {
            userId: user.id,
            organizationId: result.id,
          },
        },
      });

      expect(membership).toBeDefined();
      expect(membership?.role).toBe(Role.ADMIN);
    });
  });

  describe("inviteMember", () => {
    it("should create an invitation", async () => {
      // Create a user and org
      const user = await db.user.create({
        data: {
          name: faker.person.fullName(),
          email: faker.internet.email(),
        },
      });

      const org = await db.organization.create({
        data: {
          name: "Test Org",
          members: {
            create: {
              userId: user.id,
              role: Role.ADMIN,
            },
          },
        },
      });

      const mockSession = {
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          image: user.image,
        },
        expires: new Date().toISOString(),
      };

      const caller = organizationRouter.createCaller({
        db: db,
        session: mockSession,
        headers: new Headers(),
      });

      const inviteEmail = faker.internet.email();
      const result = await caller.inviteMember({
        organizationId: org.id,
        email: inviteEmail,
        role: Role.MEMBER,
      });

      expect(result).toBeDefined();
      expect(result.email).toBe(inviteEmail);
      expect(result.token).toBeDefined();

      // Verify invitation in DB
      const invitation = await db.invitation.findUnique({
        where: { token: result.token },
      });
      expect(invitation).toBeDefined();
    });
  });

  describe("acceptInvitation", () => {
    it("should add member to organization", async () => {
      // Create inviter and org
      const inviter = await db.user.create({
        data: {
          name: faker.person.fullName(),
          email: faker.internet.email(),
        },
      });

      const org = await db.organization.create({
        data: {
          name: "Test Org",
          members: {
            create: {
              userId: inviter.id,
              role: Role.ADMIN,
            },
          },
        },
      });

      // Create invitee
      const invitee = await db.user.create({
        data: {
          name: faker.person.fullName(),
          email: faker.internet.email(),
        },
      });

      // Create invitation
      const token = "test-token";
      await db.invitation.create({
        data: {
          email: invitee.email!,
          organizationId: org.id,
          role: Role.MEMBER,
          token,
          expires: new Date(Date.now() + 100000),
          inviterId: inviter.id,
        },
      });

      const mockSession = {
        user: {
          id: invitee.id,
          name: invitee.name,
          email: invitee.email,
          image: invitee.image,
        },
        expires: new Date().toISOString(),
      };

      const caller = organizationRouter.createCaller({
        db: db,
        session: mockSession,
        headers: new Headers(),
      });

      await caller.acceptInvitation({ token });

      // Verify membership
      const membership = await db.member.findUnique({
        where: {
          userId_organizationId: {
            userId: invitee.id,
            organizationId: org.id,
          },
        },
      });

      expect(membership).toBeDefined();
      expect(membership?.role).toBe(Role.MEMBER);

      // Verify invitation deleted
      const invitation = await db.invitation.findUnique({
        where: { token },
      });
      expect(invitation).toBeNull();
    });
  });
});
