import { redirect } from "next/navigation";

const TeacherLayout = ({
  children
}: {
  children: React.ReactNode;
}) => {
  void children;
  return redirect("/admin/cursos");
}
 
export default TeacherLayout;
