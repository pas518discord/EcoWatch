import { DashboardShell } from "@/components/dashboard-shell"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"

const notifications = [
  {
    title: "Critical alerts",
    description: "Immediate notification for critical-severity events.",
    enabled: true,
  },
  {
    title: "Weekly digest",
    description: "Summary of regional performance every Monday.",
    enabled: true,
  },
  {
    title: "Report publishing",
    description: "Notify when an ESG report is published or updated.",
    enabled: false,
  },
  {
    title: "Model insights",
    description: "AI-generated predictions and recommendations.",
    enabled: true,
  },
]

function Toggle({ on }: { on: boolean }) {
  return (
    <span
      role="switch"
      aria-checked={on}
      className={`relative inline-flex h-5 w-9 shrink-0 items-center rounded-full transition-colors ${
        on ? "bg-primary" : "bg-border"
      }`}
    >
      <span
        className={`inline-block size-4 transform rounded-full bg-background transition-transform ${
          on ? "translate-x-4" : "translate-x-0.5"
        }`}
      />
    </span>
  )
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-xs font-medium text-muted-foreground">
        {label}
      </label>
      <div className="rounded-lg bg-secondary/50 px-3 py-2 text-sm text-foreground ring-1 ring-inset ring-border">
        {value}
      </div>
    </div>
  )
}

export default function SettingsPage() {
  return (
    <DashboardShell
      title="Settings"
      description="Manage your profile, organization, and notification preferences."
    >
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="flex flex-col gap-6 lg:col-span-2">
          <Card>
            <CardHeader className="border-b [.border-b]:pb-4">
              <CardTitle>Profile</CardTitle>
              <CardDescription>
                Your personal account information.
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-5">
              <div className="flex items-center gap-4">
                <Avatar className="size-14">
                  <AvatarFallback className="bg-primary/15 text-lg font-medium text-primary">
                    AC
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="text-sm font-medium text-foreground">
                    Avery Chen
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Sustainability Lead
                  </p>
                </div>
              </div>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <Field label="Full name" value="Avery Chen" />
                <Field label="Email" value="avery.chen@terraglobal.com" />
                <Field label="Role" value="Sustainability Lead" />
                <Field label="Timezone" value="UTC−05:00 (Eastern)" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="border-b [.border-b]:pb-4">
              <CardTitle>Notifications</CardTitle>
              <CardDescription>
                Choose which events trigger alerts.
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-1">
              {notifications.map((n) => (
                <div
                  key={n.title}
                  className="flex items-center justify-between gap-4 rounded-lg p-3 hover:bg-secondary/40"
                >
                  <div>
                    <p className="text-sm font-medium text-foreground">
                      {n.title}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {n.description}
                    </p>
                  </div>
                  <Toggle on={n.enabled} />
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        <div className="flex flex-col gap-6">
          <Card>
            <CardHeader className="border-b [.border-b]:pb-4">
              <CardTitle>Organization</CardTitle>
              <CardDescription>Workspace configuration.</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-4">
              <Field label="Organization" value="Terra Global Inc." />
              <Field label="Plan" value="Enterprise" />
              <Field label="Monitored regions" value="142 active" />
              <Field label="Data retention" value="36 months" />
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="border-b [.border-b]:pb-4">
              <CardTitle>Data Sources</CardTitle>
              <CardDescription>Connected telemetry providers.</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-3">
              {[
                { name: "Satellite imagery", status: "Connected" },
                { name: "Air quality stations", status: "Connected" },
                { name: "Mapping provider", status: "Not configured" },
              ].map((s) => (
                <div
                  key={s.name}
                  className="flex items-center justify-between text-sm"
                >
                  <span className="text-foreground">{s.name}</span>
                  <span
                    className={`inline-flex items-center gap-1.5 text-xs ${
                      s.status === "Connected"
                        ? "text-primary"
                        : "text-muted-foreground"
                    }`}
                  >
                    <span
                      className={`size-1.5 rounded-full ${
                        s.status === "Connected" ? "bg-primary" : "bg-muted-foreground"
                      }`}
                    />
                    {s.status}
                  </span>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardShell>
  )
}
