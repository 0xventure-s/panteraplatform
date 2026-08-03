import { randomUUID } from "node:crypto";

import { hashPassword, verifyPassword } from "better-auth/crypto";
import pg from "pg";

const { Client } = pg;

const ADMIN_EMAIL = "alonsofranco1999@gmail.com";
const ADMIN_NAME = "Equipo Kiwi Academia";

const categories = [
  { id: "30000000-0000-4000-8000-000000000001", name: "IA aplicada" },
  { id: "30000000-0000-4000-8000-000000000002", name: "Producto" },
  { id: "30000000-0000-4000-8000-000000000003", name: "Automatización" },
  { id: "30000000-0000-4000-8000-000000000004", name: "Prototipado" },
  { id: "30000000-0000-4000-8000-000000000005", name: "Agentes" },
];

const courses = [
  {
    id: "10000000-0000-4000-8000-000000000001",
    title: "Construí productos con IA",
    description:
      "<p>Convertí una idea en un producto claro, usable y listo para validar. Un recorrido práctico para definir el problema, diseñar la experiencia y construir una primera versión con IA.</p>",
    imageUrl: "/course-covers/productos-con-ia.svg",
    price: 59000,
    category: "Producto",
    chapters: [
      "Elegir un problema que valga la pena resolver",
      "Definir la propuesta y el usuario",
      "Diseñar el recorrido principal",
      "Construir y validar la primera versión",
    ],
  },
  {
    id: "10000000-0000-4000-8000-000000000002",
    title: "Agentes de IA para operaciones",
    description:
      "<p>Diseñá agentes que ejecuten tareas concretas, usen herramientas y entreguen resultados verificables dentro de un proceso real.</p>",
    imageUrl: "/course-covers/agentes-operativos.svg",
    price: 79000,
    category: "Agentes",
    chapters: [
      "Qué tarea delegar a un agente",
      "Contexto, instrucciones y límites",
      "Herramientas, memoria y decisiones",
      "Pruebas, control y puesta en marcha",
    ],
  },
  {
    id: "10000000-0000-4000-8000-000000000003",
    title: "Automatizaciones con IA de punta a punta",
    description:
      "<p>Conectá datos, reglas e IA para transformar tareas repetitivas en flujos confiables, medibles y fáciles de mantener.</p>",
    imageUrl: "/course-covers/automatizaciones-ia.svg",
    price: 54000,
    category: "Automatización",
    chapters: [
      "Detectar oportunidades de automatización",
      "Mapear entradas, decisiones y resultados",
      "Conectar servicios sin perder control",
      "Monitorear errores y mejorar el flujo",
    ],
  },
  {
    id: "10000000-0000-4000-8000-000000000004",
    title: "Prototipos con IA: de idea a prueba",
    description:
      "<p>Pasá de una hipótesis a una experiencia navegable para aprender rápido antes de invertir en el desarrollo completo.</p>",
    imageUrl: "/course-covers/prototipos-ia.svg",
    price: 45000,
    category: "Prototipado",
    chapters: [
      "Definir qué necesita demostrar el prototipo",
      "Traducir la idea en pantallas y estados",
      "Crear una experiencia navegable",
      "Probar, observar y decidir el siguiente paso",
    ],
  },
  {
    id: "10000000-0000-4000-8000-000000000005",
    title: "IA aplicada al trabajo diario",
    description:
      "<p>Incorporá IA en tareas de análisis, escritura y organización con criterios claros para obtener resultados útiles y consistentes.</p>",
    imageUrl: "/course-covers/ia-trabajo-diario.svg",
    price: 39000,
    category: "IA aplicada",
    chapters: [
      "Elegir la herramienta según la tarea",
      "Dar contexto e instrucciones precisas",
      "Revisar calidad, fuentes y riesgos",
      "Crear un sistema personal reutilizable",
    ],
  },
];

const chapterDescription = (title) =>
  `<p>${title}. Conceptos, decisiones y una práctica concreta para aplicar lo aprendido al proyecto del curso.</p>`;

const chapterIdFor = (courseId, position) =>
  `seed-chapter-${courseId}-${position}`;

function getDatabaseConfig() {
  if (!process.env.DATABASE_URL) {
    throw new Error("Falta DATABASE_URL en el entorno.");
  }

  const databaseUrl = new URL(process.env.DATABASE_URL);
  const sslMode = databaseUrl.searchParams.get("sslmode");
  const isLocal = ["localhost", "127.0.0.1"].includes(databaseUrl.hostname);
  const useSsl = sslMode !== "disable" && !isLocal;

  databaseUrl.searchParams.delete("sslmode");
  databaseUrl.searchParams.delete("channel_binding");

  return {
    connectionString: databaseUrl.toString(),
    ssl: useSsl ? { rejectUnauthorized: true } : false,
  };
}

function getAdminPassword() {
  const password = process.env.SEED_ADMIN_PASSWORD?.trim();

  if (!password || password.length < 8) {
    throw new Error(
      "Definí SEED_ADMIN_PASSWORD con una contraseña de al menos 8 caracteres.",
    );
  }

  return password;
}

async function upsertAdmin(client, password) {
  const passwordHash = await hashPassword(password);
  const existingUser = await client.query(
    `SELECT "id"
     FROM "User"
     WHERE LOWER("email") = LOWER($1)
     LIMIT 1`,
    [ADMIN_EMAIL],
  );
  const userId = existingUser.rows[0]?.id ?? randomUUID();

  if (existingUser.rowCount) {
    await client.query(
      `UPDATE "User"
       SET "name" = $2,
           "email" = $1,
           "emailVerified" = true,
           "role" = 'admin',
           "updatedAt" = NOW()
       WHERE "id" = $3`,
      [ADMIN_EMAIL, ADMIN_NAME, userId],
    );
  } else {
    await client.query(
      `INSERT INTO "User" (
         "id", "name", "email", "emailVerified", "role", "createdAt", "updatedAt"
       )
       VALUES ($1, $2, $3, true, 'admin', NOW(), NOW())`,
      [userId, ADMIN_NAME, ADMIN_EMAIL],
    );
  }

  const existingCredential = await client.query(
    `SELECT "id"
     FROM "Account"
     WHERE "userId" = $1 AND "providerId" = 'credential'
     LIMIT 1`,
    [userId],
  );

  if (existingCredential.rowCount) {
    await client.query(
      `UPDATE "Account"
       SET "accountId" = $1,
           "password" = $2,
           "updatedAt" = NOW()
       WHERE "id" = $3`,
      [userId, passwordHash, existingCredential.rows[0].id],
    );
  } else {
    await client.query(
      `INSERT INTO "Account" (
         "id", "accountId", "providerId", "userId", "password", "createdAt", "updatedAt"
       )
       VALUES ($1, $2, 'credential', $2, $3, NOW(), NOW())`,
      [randomUUID(), userId, passwordHash],
    );
  }

  return userId;
}

async function upsertCategories(client) {
  const categoryIds = new Map();

  for (const category of categories) {
    const result = await client.query(
      `INSERT INTO "Category" ("id", "name")
       VALUES ($1, $2)
       ON CONFLICT ("name") DO UPDATE SET "name" = EXCLUDED."name"
       RETURNING "id", "name"`,
      [category.id, category.name],
    );

    categoryIds.set(result.rows[0].name, result.rows[0].id);
  }

  return categoryIds;
}

async function upsertCourses(client, adminUserId, categoryIds) {
  let chapterCount = 0;

  for (const course of courses) {
    await client.query(
      `INSERT INTO "Course" (
         "id", "userId", "title", "description", "imageUrl", "price",
         "isPublished", "categoryId", "createdAt", "updatedAt"
       )
       VALUES ($1, $2, $3, $4, $5, $6, true, $7, NOW(), NOW())
       ON CONFLICT ("id") DO UPDATE SET
         "userId" = EXCLUDED."userId",
         "title" = EXCLUDED."title",
         "description" = EXCLUDED."description",
         "imageUrl" = EXCLUDED."imageUrl",
         "price" = EXCLUDED."price",
         "isPublished" = true,
         "categoryId" = EXCLUDED."categoryId",
         "updatedAt" = NOW()`,
      [
        course.id,
        adminUserId,
        course.title,
        course.description,
        course.imageUrl,
        course.price,
        categoryIds.get(course.category),
      ],
    );

    for (const [index, title] of course.chapters.entries()) {
      const position = index + 1;
      const chapterId = chapterIdFor(course.id, position);

      await client.query(
        `INSERT INTO "Chapter" (
           "id", "title", "description", "videoUrl", "position",
           "isPublished", "isFree", "courseId", "createdAt", "updatedAt"
         )
         VALUES ($1, $2, $3, NULL, $4, true, false, $5, NOW(), NOW())
         ON CONFLICT ("id") DO UPDATE SET
           "title" = EXCLUDED."title",
           "description" = EXCLUDED."description",
           "position" = EXCLUDED."position",
           "isPublished" = true,
           "isFree" = false,
           "courseId" = EXCLUDED."courseId",
           "updatedAt" = NOW()`,
        [
          chapterId,
          title,
          chapterDescription(title),
          position,
          course.id,
        ],
      );
      chapterCount += 1;
    }
  }

  return chapterCount;
}

async function verifySeed(client, password) {
  const adminResult = await client.query(
    `SELECT "User"."role", "User"."emailVerified", "Account"."password"
     FROM "User"
     INNER JOIN "Account" ON "Account"."userId" = "User"."id"
     WHERE "User"."email" = $1
       AND "Account"."providerId" = 'credential'
     LIMIT 1`,
    [ADMIN_EMAIL],
  );
  const admin = adminResult.rows[0];

  if (
    !admin ||
    admin.role !== "admin" ||
    !admin.emailVerified ||
    !admin.password ||
    !(await verifyPassword({ hash: admin.password, password }))
  ) {
    throw new Error("No se pudo verificar la cuenta administradora.");
  }

  const courseIds = courses.map((course) => course.id);
  const categoryNames = categories.map((category) => category.name);
  const chapterIds = courses.flatMap((course) =>
    course.chapters.map((_, index) => chapterIdFor(course.id, index + 1)),
  );
  const categoryResult = await client.query(
    `SELECT COUNT(*)::int AS "count"
     FROM "Category"
     WHERE "name" = ANY($1::text[])`,
    [categoryNames],
  );
  const courseResult = await client.query(
    `SELECT COUNT(*)::int AS "count"
     FROM "Course"
     WHERE "id" = ANY($1::text[])
       AND "isPublished" = true`,
    [courseIds],
  );
  const chapterResult = await client.query(
    `SELECT COUNT(*)::int AS "count"
     FROM "Chapter"
     WHERE "id" = ANY($1::text[])
       AND "isPublished" = true
       AND "isFree" = false`,
    [chapterIds],
  );

  if (
    categoryResult.rows[0].count !== categories.length ||
    courseResult.rows[0].count !== courses.length ||
    chapterResult.rows[0].count !== chapterIds.length
  ) {
    throw new Error("La verificación de cursos o categorías quedó incompleta.");
  }
}

async function main() {
  const client = new Client(getDatabaseConfig());
  const password = getAdminPassword();

  await client.connect();

  try {
    await client.query("BEGIN");

    const adminUserId = await upsertAdmin(client, password);
    const categoryIds = await upsertCategories(client);
    const chapterCount = await upsertCourses(client, adminUserId, categoryIds);
    await verifySeed(client, password);

    await client.query("COMMIT");

    console.log(`Admin listo: ${ADMIN_EMAIL}`);
    console.log(`Categorías listas: ${categories.length}`);
    console.log(`Cursos listos: ${courses.length}`);
    console.log(`Capítulos listos: ${chapterCount}`);
    console.log("Verificación completa: cuenta, contraseña y contenido correctos.");
    console.log("Los cursos están publicados y sus lecciones permanecen bloqueadas hasta cargar los videos.");
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    await client.end();
  }
}

main().catch((error) => {
  console.error("No se pudo completar el seed:", error.message);
  process.exitCode = 1;
});
