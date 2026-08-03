import { redirect } from "next/navigation";

import { db } from "@/lib/db";

import { DataTable } from "./_components/data-table";
import { columns } from "./_components/columns";
import { getAdminUserId } from "@/lib/admin";

const CoursesPage = async () => {
  const userId = await getAdminUserId();

  if (!userId) {
    return redirect("/dashboard");
  }

  const courses = await db.course.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      title: true,
      price: true,
      isPublished: true,
    },
  });
  const rows = courses.map((course) => ({
    ...course,
    price: course.price ? Number(course.price) : null,
  }));

  return ( 
    <div className="mx-auto max-w-7xl p-5 md:p-8 lg:p-10">
      <div className="mb-6">
        <p className="text-xs font-extrabold uppercase tracking-[0.18em] text-accent">Administración</p>
        <h1 className="mt-2 text-3xl font-extrabold tracking-[-0.04em]">Cursos</h1>
      </div>
      <DataTable columns={columns} data={rows} />
    </div>
   );
}
 
export default CoursesPage;
