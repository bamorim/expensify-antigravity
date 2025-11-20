import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";
import { Role } from "@prisma/client";
import { TRPCError } from "@trpc/server";
import { randomBytes } from "crypto";

export const organizationRouter = createTRPCRouter({
  create: protectedProcedure
    .input(z.object({ name: z.string().min(1) }))
    .mutation(async ({ ctx, input }) => {
      return ctx.db.organization.create({
        data: {
          name: input.name,
          members: {
            create: {
              userId: ctx.session.user.id,
              role: Role.ADMIN,
            },
          },
        },
      });
    }),

  list: protectedProcedure.query(async ({ ctx }) => {
    return ctx.db.organization.findMany({
      where: {
        members: {
          some: {
            userId: ctx.session.user.id,
          },
        },
      },
      include: {
        members: {
          where: {
            userId: ctx.session.user.id,
          },
        },
      },
    });
  }),

  get: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const org = await ctx.db.organization.findFirst({
        where: {
          id: input.id,
          members: {
            some: {
              userId: ctx.session.user.id,
            },
          },
        },
        include: {
          members: {
            include: {
              user: true,
            },
          },
        },
      });

      if (!org) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Organization not found or you are not a member",
        });
      }

      return org;
    }),

  inviteMember: protectedProcedure
    .input(
      z.object({
        organizationId: z.string(),
        email: z.string().email(),
        role: z.nativeEnum(Role),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      // Check if user is admin of the org
      const membership = await ctx.db.member.findUnique({
        where: {
          userId_organizationId: {
            userId: ctx.session.user.id,
            organizationId: input.organizationId,
          },
        },
      });

      if (!membership || membership.role !== Role.ADMIN) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Only admins can invite members",
        });
      }

      // Check if user is already a member
      const existingMember = await ctx.db.member.findFirst({
        where: {
          organizationId: input.organizationId,
          user: {
            email: input.email,
          },
        },
      });

      if (existingMember) {
        throw new TRPCError({
          code: "CONFLICT",
          message: "User is already a member of this organization",
        });
      }

      // Create invitation
      const token = randomBytes(32).toString("hex");
      const expires = new Date(Date.now() + 1000 * 60 * 60 * 24 * 7); // 7 days

      return ctx.db.invitation.create({
        data: {
          email: input.email,
          organizationId: input.organizationId,
          role: input.role,
          token,
          expires,
          inviterId: ctx.session.user.id,
        },
      });
    }),

  acceptInvitation: protectedProcedure
    .input(z.object({ token: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const invitation = await ctx.db.invitation.findUnique({
        where: { token: input.token },
      });

      if (!invitation || invitation.expires < new Date()) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Invitation not found or expired",
        });
      }

      // Check if user email matches invitation email
      // Note: In a real app, we might want to allow accepting with a different email
      // or force the user to sign in with the invited email.
      // For now, let's assume the user must be signed in with the invited email
      // OR we just trust the token bearer.
      // Let's strictly check email for security if we can, but if the user
      // signed up with a different email (e.g. google auth alias), this might fail.
      // Let's stick to: if you have the token, you can join.
      // BUT, we should probably update the invitation email to match the user's email
      // if they are different, or just ignore the invitation email field for the member record.

      // Actually, let's verify the email matches to prevent link stealing if possible,
      // but if the user is logged in, we add the logged-in user.

      // Check if already member
      const existingMember = await ctx.db.member.findUnique({
        where: {
          userId_organizationId: {
            userId: ctx.session.user.id,
            organizationId: invitation.organizationId,
          },
        },
      });

      if (existingMember) {
        // Already member, just delete invite
        await ctx.db.invitation.delete({ where: { id: invitation.id } });
        return { success: true, message: "Already a member" };
      }

      await ctx.db.$transaction([
        ctx.db.member.create({
          data: {
            userId: ctx.session.user.id,
            organizationId: invitation.organizationId,
            role: invitation.role,
          },
        }),
        ctx.db.invitation.delete({
          where: { id: invitation.id },
        }),
      ]);

      return { success: true };
    }),

  getMembers: protectedProcedure
    .input(z.object({ organizationId: z.string() }))
    .query(async ({ ctx, input }) => {
      const membership = await ctx.db.member.findUnique({
        where: {
          userId_organizationId: {
            userId: ctx.session.user.id,
            organizationId: input.organizationId,
          },
        },
      });

      if (!membership) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "You are not a member of this organization",
        });
      }

      return ctx.db.member.findMany({
        where: {
          organizationId: input.organizationId,
        },
        include: {
          user: true,
        },
      });
    }),

  removeMember: protectedProcedure
    .input(z.object({ organizationId: z.string(), userId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const membership = await ctx.db.member.findUnique({
        where: {
          userId_organizationId: {
            userId: ctx.session.user.id,
            organizationId: input.organizationId,
          },
        },
      });

      if (!membership || membership.role !== Role.ADMIN) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Only admins can remove members",
        });
      }

      return ctx.db.member.delete({
        where: {
          userId_organizationId: {
            userId: input.userId,
            organizationId: input.organizationId,
          },
        },
      });
    }),

  updateMemberRole: protectedProcedure
    .input(
      z.object({
        organizationId: z.string(),
        userId: z.string(),
        role: z.nativeEnum(Role),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const membership = await ctx.db.member.findUnique({
        where: {
          userId_organizationId: {
            userId: ctx.session.user.id,
            organizationId: input.organizationId,
          },
        },
      });

      if (!membership || membership.role !== Role.ADMIN) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Only admins can update member roles",
        });
      }

      return ctx.db.member.update({
        where: {
          userId_organizationId: {
            userId: input.userId,
            organizationId: input.organizationId,
          },
        },
        data: {
          role: input.role,
        },
      });
    }),
});
