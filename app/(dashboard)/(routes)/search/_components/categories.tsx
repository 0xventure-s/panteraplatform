"use client";

import type { Category } from "@prisma/client";

import type { ThreeDIconName } from "@/components/three-d-icon";

import { CategoryItem } from "./category-item";

interface CategoriesProps {
  items: Category[];
}

const iconMap: Partial<Record<Category["name"], ThreeDIconName>> = {
  "IA aplicada": "bulb",
  Producto: "rocket",
  Automatización: "setting",
  Prototipado: "computer",
  Agentes: "robot",
};

export const Categories = ({
  items,
}: CategoriesProps) => {
  return (
    <div className="flex items-center gap-x-2 overflow-x-auto pb-2">
      {items.map((item) => (
        <CategoryItem
          key={item.id}
          label={item.name}
          icon={iconMap[item.name] ?? "cube"}
          value={item.id}
        />
      ))}
    </div>
  );
};
