import { UserDetailsPage } from "@/components/admin/user-details";

export default async function UserDetails({ params }) {
  const { id } = await params;
  return <UserDetailsPage userId={id} />;
}
