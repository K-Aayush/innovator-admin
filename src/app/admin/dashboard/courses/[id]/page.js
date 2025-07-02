import { CourseDetailsPage } from "@/components/admin/course-details";

export default async function CourseDetails({ params }) {
  const { id } = await params;
  return <CourseDetailsPage courseId={id} />;
}
