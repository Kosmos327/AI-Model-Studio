import { Badge } from "@/components/ui/badge";
import type {
  CharacterStatus,
  TaskStatus,
  PublishStatus,
  PlanStatus,
} from "@/types";

type AnyStatus = CharacterStatus | TaskStatus | PublishStatus | PlanStatus;

const STATUS_CONFIG: Record<
  AnyStatus,
  { label: string; variant: "default" | "secondary" | "destructive" | "outline" | "success" | "warning" | "info" | "teal" | "purple" }
> = {
  draft: { label: "Draft", variant: "secondary" },
  active: { label: "Active", variant: "success" },
  archived: { label: "Archived", variant: "destructive" },
  queued: { label: "Queued", variant: "warning" },
  running: { label: "Running", variant: "info" },
  done: { label: "Done", variant: "success" },
  failed: { label: "Failed", variant: "destructive" },
  cancelled: { label: "Cancelled", variant: "secondary" },
  approved: { label: "Approved", variant: "success" },
  ready: { label: "Ready", variant: "teal" },
  published: { label: "Published", variant: "purple" },
  rejected: { label: "Rejected", variant: "destructive" },
  planned: { label: "Planned", variant: "warning" },
  skipped: { label: "Skipped", variant: "secondary" },
};

interface StatusBadgeProps {
  status: AnyStatus;
  className?: string;
}

export default function StatusBadge({ status, className }: StatusBadgeProps) {
  const config = STATUS_CONFIG[status] ?? { label: status, variant: "secondary" as const };
  return (
    <Badge variant={config.variant} className={className}>
      {config.label}
    </Badge>
  );
}
