'use client';

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import { PlusCircle } from "lucide-react";
import { Status } from "@prisma/client";
import { api } from "@/utils/api";
import { SubjectList } from "./SubjectList";
import { SubjectForm } from "./SubjectForm";

interface SearchFilters {
	search: string;
	classGroupId?: string;
	programId?: string;
	status?: Status;
	teacherId?: string;
}

export const SubjectManagement = () => {
	const [selectedSubjectId, setSelectedSubjectId] = useState<string | null>(null);
	const [isFormOpen, setIsFormOpen] = useState(false);
	const [filters, setFilters] = useState<SearchFilters>({
		search: "",
	});

	const { data: subjects, isLoading } = api.subject.searchSubjects.useQuery(filters);
	const { data: classGroups } = api.classGroup.getAllClassGroups.useQuery();
	const { data: programs } = api.program.getAll.useQuery({
		page: 1,
		pageSize: 10
	});
	const { data: teachers } = api.subject.getAvailableTeachers.useQuery();

	const handleCreate = () => {
		setSelectedSubjectId(null);
		setIsFormOpen(true);
	};

	const handleEdit = (id: string) => {
		setSelectedSubjectId(id);
		setIsFormOpen(true);
	};

	const handleFormSuccess = () => {
		setIsFormOpen(false);
		setSelectedSubjectId(null);
	};

	if (isLoading) {
		return <div>Loading...</div>;
	}

	return (
		<div className="space-y-4">
			<Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Subject Management</CardTitle>
          <Button onClick={handleCreate}>
            <PlusCircle className="mr-2 h-4 w-4" />
            Create Subject
          </Button>
        </CardHeader>
				<CardContent>
					<div className="mb-6 space-y-4">
						<div className="flex space-x-4">
							<Input
								placeholder="Search subjects..."
								value={filters.search}
								onChange={(e) => setFilters({ ...filters, search: e.target.value })}
								className="max-w-sm"
							/>
							<Select
								value={filters.programId || "all"}
								onValueChange={(value) => setFilters({ ...filters, programId: value === "all" ? undefined : value })}
							>
								<SelectTrigger className="w-[200px]">
									<SelectValue placeholder="Filter by Program" />
								</SelectTrigger>
								<SelectContent>
									<SelectItem value="all">All Programs</SelectItem>
									{programs?.programs?.map((program: any) => (
										<SelectItem key={program.id} value={program.id}>
											{program.name}
										</SelectItem>
									))}
								</SelectContent>
							</Select>
							<Select
								value={filters.classGroupId || "all"}
								onValueChange={(value) => setFilters({ ...filters, classGroupId: value === "all" ? undefined : value })}
							>
								<SelectTrigger className="w-[200px]">
									<SelectValue placeholder="Filter by Class Group" />
								</SelectTrigger>
								<SelectContent>
									<SelectItem value="all">All Class Groups</SelectItem>
									{classGroups?.map((group) => (
										<SelectItem key={group.id} value={group.id}>
											{group.name}
										</SelectItem>
									))}
								</SelectContent>
							</Select>
							<Select
								value={filters.teacherId || "all"}
								onValueChange={(value) => setFilters({ ...filters, teacherId: value === "all" ? undefined : value })}
							>
								<SelectTrigger className="w-[200px]">
									<SelectValue placeholder="Filter by Teacher" />
								</SelectTrigger>
								<SelectContent>
									<SelectItem value="all">All Teachers</SelectItem>
									{teachers?.map((teacher) => (
										<SelectItem key={teacher.id} value={teacher.id}>
											{teacher.user.name}
										</SelectItem>
									))}
								</SelectContent>
							</Select>
							<Select
								value={filters.status || "all"}
								onValueChange={(value) => setFilters({ ...filters, status: value === "all" ? undefined : value as Status })}
							>
								<SelectTrigger className="w-[180px]">
									<SelectValue placeholder="Status" />
								</SelectTrigger>
								<SelectContent>
									<SelectItem value="all">All Status</SelectItem>
									{Object.values(Status).map((status) => (
										<SelectItem key={status} value={status}>
											{status}
										</SelectItem>
									))}
								</SelectContent>
							</Select>
						</div>
					</div>

					<div className="space-y-4">
						<SubjectList 
						  subjects={subjects || []} 
						  onSelect={handleEdit}
						/>
						<Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
						  <SubjectForm 
							selectedSubject={subjects?.find(s => s.id === selectedSubjectId)}
							classGroups={classGroups || []}
							teachers={teachers || []}
							onSuccess={handleFormSuccess}
						  />
						</Dialog>
					</div>
				</CardContent>
			</Card>
		</div>
	);
};