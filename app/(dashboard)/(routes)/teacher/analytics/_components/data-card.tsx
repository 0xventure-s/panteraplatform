import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ThreeDIcon, type ThreeDIconName } from "@/components/three-d-icon";
import { formatPrice } from "@/lib/format";

interface DataCardProps {
  value: number;
  label: string;
  icon: ThreeDIconName;
  shouldFormat?: boolean;
}

export const DataCard = ({
  value,
  label,
  icon,
  shouldFormat,
}: DataCardProps) => {
  return (
    <Card className="overflow-hidden rounded-[22px] border-foreground/10 bg-card shadow-none">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 p-5 pb-1">
        <CardTitle className="text-sm font-bold text-muted-foreground">
          {label}
        </CardTitle>
        <span className="grid h-14 w-14 place-items-center">
          <ThreeDIcon name={icon} size={48} />
        </span>
      </CardHeader>
      <CardContent className="p-5 pt-2">
        <div className="text-3xl font-extrabold tracking-[-0.04em]">
          {shouldFormat ? formatPrice(value) : value}
        </div>
      </CardContent>
    </Card>
  );
};
