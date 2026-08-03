import { redirect } from "next/navigation";
import { CircleDollarSign, File, HelpCircle, LayoutDashboard, ListChecks, Target } from "lucide-react";

import { db } from "@/lib/db";
import { IconBadge } from "@/components/icon-badge";
import { Banner } from "@/components/banner";

import { TitleForm } from "./_components/title-form";
import { DescriptionForm } from "./_components/description-form";
import { ImageForm } from "./_components/image-form";
import { CategoryForm } from "./_components/category-form";
import { PriceForm } from "./_components/price-form";
import { AttachmentForm } from "./_components/attachment-form";
import { ChaptersForm } from "./_components/chapters-form";
import { Actions } from "./_components/actions";
import { CourseFaqsForm } from "./_components/course-faqs-form";
import { CourseSalesForm } from "./_components/course-sales-form";
import { getAdminUserId } from "@/lib/admin";

const CourseIdPage = async ({
  params
}: {
  params: Promise<{ courseId: string }>
}) => {
  const { courseId } = await params;
  const userId = await getAdminUserId();

  if (!userId) {
    return redirect("/dashboard");
  }

  const [course, categories] = await Promise.all([
    db.course.findUnique({
      where: {
        id: courseId,
        userId,
      },
      include: {
        chapters: {
          include: {
            muxData: true,
          },
          orderBy: {
            position: "asc",
          },
        },
        attachments: {
          orderBy: {
            createdAt: "desc",
          },
        },
        faqs: {
          orderBy: {
            position: "asc",
          },
        },
      },
    }),
    db.category.findMany({
      orderBy: { name: "asc" },
      select: { id: true, name: true },
    }),
  ]);

  if (!course) {
    return redirect("/admin/cursos");
  }

  const requiredFields = [
    course.title,
    course.description,
    course.imageUrl,
    course.price,
    course.categoryId,
    course.subtitle,
    course.level,
    course.estimatedMinutes,
    course.outcomes.length > 0,
    course.targetAudience.length > 0,
    course.projectTitle,
    course.projectDescription,
    course.faqs.length > 0,
    course.chapters.some((chapter) => chapter.isPublished),
    course.chapters.some(
      (chapter) =>
        chapter.isPublished &&
        chapter.isTrailer &&
        Boolean(chapter.muxData?.playbackId),
    ),
  ];

  const totalFields = requiredFields.length;
  const completedFields = requiredFields.filter(Boolean).length;

  const completionText = `(${completedFields}/${totalFields})`;

  const isComplete = requiredFields.every(Boolean);

  return (
    <>
      {!course.isPublished && (
        <Banner
          label="Este curso está en borrador y todavía no es visible para los alumnos."
        />
      )}
      <div className="mx-auto max-w-7xl p-5 md:p-8 lg:p-10">
        <div className="flex items-center justify-between">
          <div className="flex flex-col gap-y-2">
            <h1 className="text-3xl font-extrabold tracking-[-0.04em]">
              Configuración del curso
            </h1>
            <span className="text-sm text-slate-700">
              Completá los campos obligatorios {completionText}
            </span>
          </div>
          <Actions
            disabled={!isComplete}
            courseId={courseId}
            isPublished={course.isPublished}
          />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-16">
          <div>
            <div className="flex items-center gap-x-2">
              <IconBadge icon={LayoutDashboard} />
              <h2 className="text-xl">
                  Información principal
              </h2>
            </div>
            <TitleForm
              initialData={course}
              courseId={course.id}
            />
            <DescriptionForm
              initialData={course}
              courseId={course.id}
            />
            <ImageForm
              initialData={course}
              courseId={course.id}
            />
            <CategoryForm
              initialData={course}
              courseId={course.id}
              options={categories.map((category) => ({
                label: category.name,
                value: category.id,
              }))}
            />
            <div className="mt-10 flex items-center gap-x-2">
              <IconBadge icon={Target} />
              <h2 className="text-xl">Propuesta del curso</h2>
            </div>
            <CourseSalesForm
              initialData={course}
              courseId={course.id}
            />
          </div>
          <div className="space-y-6">
            <div>
              <div className="flex items-center gap-x-2">
                <IconBadge icon={ListChecks} />
                <h2 className="text-xl">
                  Programa del curso
                </h2>
              </div>
              <ChaptersForm
                initialData={course}
                courseId={course.id}
              />
            </div>
            <div>
              <div className="flex items-center gap-x-2">
                <IconBadge icon={CircleDollarSign} />
                <h2 className="text-xl">
                  Precio y venta
                </h2>
              </div>
              <PriceForm
                initialData={course}
                courseId={course.id}
              />
            </div>
            <div>
              <div className="flex items-center gap-x-2">
                <IconBadge icon={File} />
                <h2 className="text-xl">
                  Recursos descargables
                </h2>
              </div>
              <AttachmentForm
                initialData={course}
                courseId={course.id}
              />
            </div>
            <div>
              <div className="flex items-center gap-x-2">
                <IconBadge icon={HelpCircle} />
                <h2 className="text-xl">Preguntas antes de comprar</h2>
              </div>
              <CourseFaqsForm
                initialItems={course.faqs}
                courseId={course.id}
              />
            </div>
          </div>
        </div>
      </div>
    </>
   );
}
 
export default CourseIdPage;
