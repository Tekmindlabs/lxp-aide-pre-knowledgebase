import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "../trpc";
import { Status } from "@prisma/client";

export const subjectRouter = createTRPCRouter({
	createSubject: protectedProcedure
		.input(z.object({
			name: z.string(),
			code: z.string(),
			description: z.string().optional(),
			classGroupIds: z.array(z.string()).optional(),
			teacherIds: z.array(z.string()).optional(),
			status: z.enum([Status.ACTIVE, Status.INACTIVE, Status.ARCHIVED]).default(Status.ACTIVE),
		}))
		.mutation(async ({ ctx, input }) => {
			const { classGroupIds, teacherIds, ...subjectData } = input;
			
			const subject = await ctx.prisma.subject.create({
				data: {
					...subjectData,
					...(classGroupIds && {
						classGroups: {
							connect: classGroupIds.map(id => ({ id })),
						},
					}),
				},
				include: {
					classGroups: true,
					teachers: {
						include: {
							teacher: {
								include: {
									user: true,
								},
							},
						},
					},
				},
			});

			if (teacherIds && teacherIds.length > 0) {
				await ctx.prisma.teacherSubject.createMany({
					data: teacherIds.map(teacherId => ({
						subjectId: subject.id,
						teacherId,
						status: Status.ACTIVE,
					})),
				});
			}

			return subject;
		}),

	updateSubject: protectedProcedure
		.input(z.object({
			id: z.string(),
			name: z.string().optional(),
			code: z.string().optional(),
			description: z.string().optional(),
			classGroupIds: z.array(z.string()).optional(),
			teacherIds: z.array(z.string()).optional(),
			status: z.enum([Status.ACTIVE, Status.INACTIVE, Status.ARCHIVED]).optional(),
		}))
		.mutation(async ({ ctx, input }) => {
			const { id, classGroupIds, teacherIds, ...data } = input;

			const subject = await ctx.prisma.subject.update({
				where: { id },
				data: {
					...data,
					...(classGroupIds && {
						classGroups: {
							set: classGroupIds.map(id => ({ id })),
						},
					}),
				},
				include: {
					classGroups: true,
					teachers: {
						include: {
							teacher: {
								include: {
									user: true,
								},
							},
						},
					},
				},
			});

			if (teacherIds) {
				// Remove existing teacher assignments
				await ctx.prisma.teacherSubject.deleteMany({
					where: { subjectId: id },
				});

				// Add new teacher assignments
				if (teacherIds.length > 0) {
					await ctx.prisma.teacherSubject.createMany({
						data: teacherIds.map(teacherId => ({
							subjectId: id,
							teacherId,
							status: Status.ACTIVE,
						})),
					});
				}
			}

			return subject;
		}),

	deleteSubject: protectedProcedure
		.input(z.string())
		.mutation(async ({ ctx, input }) => {
			return ctx.prisma.subject.delete({
				where: { id: input },
			});
		}),

	getSubject: protectedProcedure
		.input(z.string())
		.query(async ({ ctx, input }) => {
			return ctx.prisma.subject.findUnique({
				where: { id: input },
				include: {
					classGroups: {
						include: {
							program: true,
						},
					},
					teachers: {
						include: {
							teacher: {
								include: {
									user: true,
								},
							},
						},
					},
					periods: {
						include: {
							timetable: true,
							classroom: true,
						},
					},
				},
			});
		}),

	searchSubjects: protectedProcedure
		.input(z.object({
			search: z.string().optional(),
			classGroupId: z.string().optional(),
			programId: z.string().optional(),
			status: z.enum([Status.ACTIVE, Status.INACTIVE, Status.ARCHIVED]).optional(),
			teacherId: z.string().optional(),
		}))
		.query(async ({ ctx, input }) => {
			const { search, classGroupId, programId, status, teacherId } = input;

			return ctx.prisma.subject.findMany({
				where: {
					...(search && {
						OR: [
							{ name: { contains: search, mode: 'insensitive' } },
							{ code: { contains: search, mode: 'insensitive' } },
							{ description: { contains: search, mode: 'insensitive' } },
						],
					}),
					...(classGroupId && {
						classGroups: {
							some: { id: classGroupId },
						},
					}),
					...(programId && {
						classGroups: {
							some: { programId },
						},
					}),
					...(status && { status }),
					...(teacherId && {
						teachers: {
							some: { teacherId },
						},
					}),
				},
				include: {
					classGroups: {
						include: {
							program: true,
						},
					},
					teachers: {
						include: {
							teacher: {
								include: {
									user: true,
								},
							},
						},
					},
				},
				orderBy: {
					name: 'asc',
				},
			});
		}),

	getAvailableTeachers: protectedProcedure
		.input(z.object({
			classGroupId: z.string().optional(),
			subjectId: z.string().optional(),
		}).optional())
		.query(async ({ ctx, input }) => {
			const { classGroupId, subjectId } = input || {};

			return ctx.prisma.teacherProfile.findMany({
				where: {
					user: {
						status: Status.ACTIVE,
					},
					...(classGroupId && {
						classGroups: {
							some: { id: classGroupId },
						},
					}),
					...(subjectId && {
						subjects: {
							some: { subjectId },
						},
					}),
				},
				include: {
					user: true,
					subjects: true,
				},
			});
		}),
});
