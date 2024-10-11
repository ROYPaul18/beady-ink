import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function AdminPage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect('/sign-in');
  }

  if (session.user.role !== 'ADMIN') {
    redirect('/');
  }

  return (
    <div>
      <h1>Admin Dashboard</h1>
      {session?.user.username}
    </div>
  );
}
