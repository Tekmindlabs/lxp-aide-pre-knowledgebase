import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Status } from "@prisma/client";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";

import { api } from "@/trpc/react";

const formSchema = z.object({
	name: z.string().min(1, "Name is required"),
	email: z.string().email("Invalid email address"),
	specialization: z.string().optional(),
	availability: z.string().optional(),
	status: z.enum([Status.ACTIVE, Status.INACTIVE, Status.ARCHIVED]),
	subjectIds: z.array(z.string()).default([]),
	classIds: z.array(z.string()).default([]),
  });

type FormValues = z.infer<typeof formSchema>;

interface TeacherFormProps {
	isOpen: boolean;
	onClose: () => void;
	selectedTeacher?: {
		id: string;
		name: string;
		email: string;
		status: Status;
		teacherProfile: {
			specialization: string | null;
			availability: string | null;
			subjects: { subject: { id: string } }[];
			classes: { class: { id: string } }[];
		};
	};
	subjects: { id: string; name: string }[];
	classes: { id: string; name: string; classGroup: { name: string } }[];
}

export const TeacherForm = ({ isOpen, onClose, selectedTeacher, subjects, classes }: TeacherFormProps) => {
	const [isSubmitting, setIsSubmitting] = useState(false);
	const utils = api.useContext();

	const form = useForm<FormValues>({
		resolver: zodResolver(formSchema),
		defaultValues: {
			name: selectedTeacher?.name || "",
			email: selectedTeacher?.email || "",
			specialization: selectedTeacher?.teacherProfile?.specialization || "",
			availability: selectedTeacher?.teacherProfile?.availability || "",
			status: selectedTeacher?.status || Status.ACTIVE,
			subjectIds: selectedTeacher?.teacherProfile?.subjects.map(s => s.subject.id) || [],
			classIds: selectedTeacher?.teacherProfile?.classes.map(c => c.class.id) || [],
		},
	});

	const createTeacher = api.teacher.createTeacher.useMutation({
		onSuccess: () => {
			utils.teacher.searchTeachers.invalidate();
			form.reset();
			onClose();
			toast({
				title: "Success",
				description: "Teacher created successfully",
			});
		},
		onError: (error) => {
			toast({
				title: "Error",
				description: error.message,
				variant: "destructive",
			});
		},
	});

	const updateTeacher = api.teacher.updateTeacher.useMutation({
		onSuccess: () => {
			utils.teacher.searchTeachers.invalidate();
			onClose();
			toast({
				title: "Success",
				description: "Teacher updated successfully",
			});
		},
		onError: (error) => {
			toast({
				title: "Error",
				description: error.message,
				variant: "destructive",
			});
		},
	});

	const onSubmit = async (values: FormValues) => {
		setIsSubmitting(true);
		try {
			if (selectedTeacher) {
				await updateTeacher.mutateAsync({
					id: selectedTeacher.id,
					...values,
				});
			} else {
				await createTeacher.mutateAsync(values);
			}
		} finally {
			setIsSubmitting(false);
		}
	};

	return (
		<Dialog open={isOpen} onOpenChange={onClose}>
			<DialogContent>
				<DialogHeader>
					<DialogTitle>{selectedTeacher ? 'Edit' : 'Create'} Teacher</DialogTitle>
				</DialogHeader>
				<Form {...form}>
			<form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
				<FormField
					control={form.control}
					name="name"
					render={({ field }) => (
						<FormItem>
							<FormLabel>Name</FormLabel>
							<FormControl>
								<Input {...field} />
							</FormControl>
							<FormMessage />
						</FormItem>
					)}
				/>

				<FormField
					control={form.control}
					name="email"
					render={({ field }) => (
						<FormItem>
							<FormLabel>Email</FormLabel>
							<FormControl>
								<Input {...field} type="email" />
							</FormControl>
							<FormMessage />
						</FormItem>
					)}
				/>

				<FormField
					control={form.control}
					name="specialization"
					render={({ field }) => (
						<FormItem>
							<FormLabel>Specialization</FormLabel>
							<FormControl>
								<Input {...field} />
							</FormControl>
							<FormMessage />
						</FormItem>
					)}
				/>

				<FormField
					control={form.control}
					name="availability"
					render={({ field }) => (
						<FormItem>
							<FormLabel>Availability</FormLabel>
							<FormControl>
								<Input {...field} />
							</FormControl>
							<FormMessage />
						</FormItem>
					)}
				/>

<FormField
  control={form.control}
  name="status"
  render={({ field }) => (
    <FormItem>
      <FormLabel>Status</FormLabel>
      <Select onValueChange={field.onChange} value={field.value || Status.ACTIVE}>
        <FormControl>
          <SelectTrigger>
            <SelectValue placeholder="Select status" />
          </SelectTrigger>
        </FormControl>
        <SelectContent>
          {Object.values(Status).map((status) => (
            <SelectItem key={status} value={status}>
              {status.toLowerCase()}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <FormMessage />
    </FormItem>
  )}
/>


<FormField
	control={form.control}
	name="subjectIds"
	render={({ field }) => (
		<FormItem>
			<FormLabel>Subjects</FormLabel>
			<div className="flex flex-wrap gap-2">
				{subjects.map((subject) => (
					<div
						key={subject.id}
						className={`cursor-pointer rounded-md px-3 py-1 text-sm ${
							field.value?.includes(subject.id)
								? 'bg-primary text-primary-foreground'
								: 'bg-secondary'
						}`}
						onClick={() => {
							const currentValues = field.value || [];
							const newValues = currentValues.includes(subject.id)
								? currentValues.filter((v) => v !== subject.id)
								: [...currentValues, subject.id];
							field.onChange(newValues);
						}}
					>
						{subject.name}
					</div>
				))}
			</div>
			<FormMessage />
		</FormItem>
	)}
/>


<FormField
	control={form.control}
	name="classIds"
	render={({ field }) => (
		<FormItem>
			<FormLabel>Classes</FormLabel>
			<div className="flex flex-wrap gap-2">
				{classes.map((cls) => (
					<div
						key={cls.id}
						className={`cursor-pointer rounded-md px-3 py-1 text-sm ${
							field.value?.includes(cls.id)
								? 'bg-primary text-primary-foreground'
								: 'bg-secondary'
						}`}
						onClick={() => {
							const currentValues = field.value || [];
							const newValues = currentValues.includes(cls.id)
								? currentValues.filter((v) => v !== cls.id)
								: [...currentValues, cls.id];
							field.onChange(newValues);
						}}
					>
						{`${cls.classGroup.name} - ${cls.name}`}
					</div>
				))}
			</div>
			<FormMessage />
		</FormItem>
	)}
/>
				<div className="flex justify-end space-x-2">
					<Button type="button" variant="outline" onClick={onClose}>
						Cancel
					</Button>
					<Button type="submit" disabled={isSubmitting}>
						{isSubmitting ? "Saving..." : selectedTeacher ? "Update" : "Create"} Teacher
					</Button>
				</div>
			</form>
		</Form>
	</DialogContent>
</Dialog>
	);
};