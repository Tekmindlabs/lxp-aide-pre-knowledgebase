'use client';

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Status } from "@prisma/client";
import { api } from "@/utils/api";
import { TeacherList } from "./TeacherList";
import { TeacherForm } from "./TeacherForm";
import { TeacherView } from "./TeacherView";
import { Button } from "@/components/ui/button";
import { UserType } from "@/types/user";

// Define interfaces for the component
interface Subject {
  id: string;
  name: string;
}

interface Class {
  id: string;
  name: string;
  classGroup: {
    name: string;
  };
}

interface TeacherProfile {
  specialization: string | null;
  availability: string | null;
  subjects: {
    subject: {
      id: string;
      name: string;
    };
  }[];
  classes: {
    class: {
      id: string;
      name: string;
      classGroup: {
        name: string;
      };
    };
  }[];
}

interface Teacher extends UserType {
  teacherProfile: TeacherProfile;
}

interface SearchFilters {
  search: string;
  subjectId?: string;
  classId?: string;
  status?: Status;
}

export const TeacherManagement = () => {
  const [selectedTeacherId, setSelectedTeacherId] = useState<string | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [filters, setFilters] = useState<SearchFilters>({
    search: "",
    subjectId: "all",
    classId: "all",
    status: undefined
  });

  // Process filters before making API calls
  const processedFilters = {
    search: filters.search,
    subjectId: filters.subjectId === "all" ? undefined : filters.subjectId,
    classId: filters.classId === "all" ? undefined : filters.classId,
    status: filters.status === "all" ? undefined : filters.status,
  };

  // API queries with proper typing
  const { data: teachers, isLoading } = api.teacher.searchTeachers.useQuery(processedFilters);
  const { data: subjects } = api.subject.searchSubjects.useQuery({});
  const { data: classes } = api.class.searchClasses.useQuery({});

  const handleEdit = (id: string) => {
    setSelectedTeacherId(id);
    setIsFormOpen(true);
  };

  const handleCreate = () => {
    setSelectedTeacherId(null);
    setIsFormOpen(true);
  };

  const handleView = (id: string) => {
    setSelectedTeacherId(id);
    setIsViewOpen(true);
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Teacher Management</CardTitle>
          <Button onClick={handleCreate}>Create Teacher</Button>
        </CardHeader>
        <CardContent>
          <div className="mb-6 space-y-4">
            <div className="flex space-x-4">
              <Input
                placeholder="Search teachers..."
                value={filters.search}
                onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                className="max-w-sm"
              />
              <Select
                value={filters.subjectId}
                onValueChange={(value) => setFilters({ ...filters, subjectId: value })}
              >
                <SelectTrigger className="w-[200px]">
                  <SelectValue placeholder="Filter by Subject" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Subjects</SelectItem>
                  {subjects?.map((subject: Subject) => (
                    <SelectItem key={subject.id} value={subject.id}>
                      {subject.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select
                value={filters.classId}
                onValueChange={(value) => setFilters({ ...filters, classId: value })}
              >
                <SelectTrigger className="w-[200px]">
                  <SelectValue placeholder="Filter by Class" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Classes</SelectItem>
                  {classes?.map((cls: Class) => (
                    <SelectItem key={cls.id} value={cls.id}>
                      {cls.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select
                value={filters.status}
                onValueChange={(value) => setFilters({ ...filters, status: value as Status })}
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
            <TeacherList 
              teachers={teachers || []} 
              onSelect={handleView}
              onEdit={handleEdit}
            />
            <TeacherForm 
              isOpen={isFormOpen}
              onClose={() => setIsFormOpen(false)}
              selectedTeacher={teachers?.find((t: Teacher) => t.id === selectedTeacherId)}
              subjects={subjects || []}
              classes={classes || []}
            />
            {selectedTeacherId && (
              <TeacherView
              isOpen={isViewOpen}
              onClose={() => setIsViewOpen(false)}
              teacherId={selectedTeacherId}
              onEdit={() => {
                setIsViewOpen(false);
                handleEdit(selectedTeacherId);
              }}
              />
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default TeacherManagement;