import { EditCoursePage } from "@/components/admin/edit-course";

export default async function EditCourse({ params }) {
  const { id } = await params;
  return <EditCoursePage courseId={id} />;
}
