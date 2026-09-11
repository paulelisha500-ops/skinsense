import { createElement } from "react";
import {
  CalendarCheck,
  Camera,
  ChartLine,
  CircleHelp,
  Database,
  Eye,
  Flame,
  FlaskConical,
  Gauge,
  Image as ImageIcon,
  Layers,
  ListChecks,
  Lock,
  Mail,
  ScanFace,
  Sparkles,
  Stethoscope,
  type LucideIcon,
} from "lucide-react";

/** Icon names referenced from lib/content.ts. */
const ICONS: Record<string, LucideIcon> = {
  calendar: CalendarCheck,
  camera: Camera,
  chart: ChartLine,
  database: Database,
  eye: Eye,
  flame: Flame,
  flask: FlaskConical,
  gauge: Gauge,
  help: CircleHelp,
  image: ImageIcon,
  layers: Layers,
  lock: Lock,
  mail: Mail,
  routine: ListChecks,
  scan: ScanFace,
  stethoscope: Stethoscope,
};

export function Icon({
  name,
  className,
  strokeWidth = 1.75,
}: {
  name: string;
  className?: string;
  strokeWidth?: number;
}) {
  return createElement(ICONS[name] ?? Sparkles, {
    className,
    strokeWidth,
    "aria-hidden": true,
  });
}
