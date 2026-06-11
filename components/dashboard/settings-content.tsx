"use client"

import { useActionState, useState, useTransition } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import { User, Bell, Shield, Trash2, Loader2, CheckCircle2 } from "lucide-react"
import type { UserData } from "@/lib/dashboard"
import type { NotificationPrefsOut, NotificationPrefsUpdate } from "@/lib/api/users/types"
import { saveNotifications, saveProfile, type ProfileFormState } from "@/app/dashboard/settings/actions"

interface SettingsContentProps {
  user: UserData
  /** Live profile values from GET /users/me. */
  profile: { firstName: string; lastName: string }
  /** Live preferences from GET /users/me/notifications. */
  notifications: NotificationPrefsOut
}

export function SettingsContent({ user, profile, notifications }: SettingsContentProps) {
  const [profileState, profileAction, profilePending] = useActionState<ProfileFormState, FormData>(
    saveProfile,
    null,
  )

  const [prefs, setPrefs] = useState(notifications)
  const [savingPrefs, startPrefTransition] = useTransition()
  const [prefError, setPrefError] = useState(false)

  const togglePref = (key: keyof NotificationPrefsOut, value: boolean) => {
    setPrefs((p) => ({ ...p, [key]: value }))
    setPrefError(false)
    startPrefTransition(async () => {
      const res = await saveNotifications({ [key]: value } as NotificationPrefsUpdate)
      if (!res.ok) {
        setPrefs((p) => ({ ...p, [key]: !value })) // revert on failure
        setPrefError(true)
      }
    })
  }

  const prefStatus = savingPrefs
    ? "Saving…"
    : prefError
      ? "Couldn't save — please try again"
      : "Changes save automatically"

  return (
    <div className="flex-1 space-y-6">
      <div>
        <h1 className="font-serif text-3xl font-bold text-foreground">Settings</h1>
        <p className="text-muted-foreground mt-1">Manage your account details and preferences.</p>
      </div>

      {/* Profile */}
      <Card>
        <CardHeader>
          <CardTitle className="font-serif text-xl flex items-center gap-2">
            <User className="w-5 h-5 text-primary" />
            Profile
          </CardTitle>
          <CardDescription>Update your personal information</CardDescription>
        </CardHeader>
        <CardContent>
          <form action={profileAction} className="space-y-4">
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="firstName">First Name</Label>
                <Input id="firstName" name="first_name" defaultValue={profile.firstName} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName">Last Name</Label>
                <Input id="lastName" name="last_name" defaultValue={profile.lastName} />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" defaultValue={user.email} disabled />
              <p className="text-xs text-muted-foreground">Email changes aren&apos;t available here yet.</p>
            </div>
            <div className="flex items-center justify-between pt-2">
              <div className="flex items-center gap-3 text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <span>Membership tier:</span>
                  <Badge className="capitalize">{user.tier}</Badge>
                </div>
                {profileState?.status === "success" && (
                  <span className="flex items-center gap-1 text-primary">
                    <CheckCircle2 className="h-4 w-4" /> {profileState.message}
                  </span>
                )}
                {profileState?.status === "error" && (
                  <span className="text-destructive">{profileState.message}</span>
                )}
              </div>
              <Button type="submit" disabled={profilePending}>
                {profilePending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving…
                  </>
                ) : (
                  "Save Changes"
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Notifications */}
      <Card>
        <CardHeader>
          <CardTitle className="font-serif text-xl flex items-center gap-2">
            <Bell className="w-5 h-5 text-primary" />
            Notifications
          </CardTitle>
          <CardDescription>
            Choose what you want to be notified about · <span className={prefError ? "text-destructive" : ""}>{prefStatus}</span>
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {([
            { key: "email_notifications", label: "Email notifications", description: "Receive emails for account activity" },
            { key: "event_reminders", label: "Event reminders", description: "Get reminded 24h before registered events" },
            { key: "donation_receipts", label: "Donation receipts", description: "Receive receipts for every donation" },
            { key: "newsletter", label: "Newsletter", description: "Monthly impact updates and community news" },
          ] as const).map(({ key, label, description }) => (
            <div key={key} className="flex items-center justify-between p-3 rounded-lg bg-secondary/30">
              <div>
                <p className="text-sm font-medium">{label}</p>
                <p className="text-xs text-muted-foreground">{description}</p>
              </div>
              <Switch
                checked={prefs[key]}
                disabled={savingPrefs}
                onCheckedChange={(v) => togglePref(key, v)}
              />
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Security */}
      <Card>
        <CardHeader>
          <CardTitle className="font-serif text-xl flex items-center gap-2">
            <Shield className="w-5 h-5 text-primary" />
            Security
          </CardTitle>
          <CardDescription>Manage your password and account security</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="current-password">Current Password</Label>
            <Input id="current-password" type="password" placeholder="••••••••" />
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="new-password">New Password</Label>
              <Input id="new-password" type="password" placeholder="••••••••" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirm-password">Confirm Password</Label>
              <Input id="confirm-password" type="password" placeholder="••••••••" />
            </div>
          </div>
          {/* TODO: wire to Supabase auth.updateUser */}
          <Button variant="outline">Update Password</Button>
        </CardContent>
      </Card>

      {/* Danger Zone */}
      <Card className="border-destructive/40">
        <CardHeader>
          <CardTitle className="font-serif text-xl flex items-center gap-2 text-destructive">
            <Trash2 className="w-5 h-5" />
            Danger Zone
          </CardTitle>
          <CardDescription>Irreversible account actions</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-lg bg-destructive/5 border border-destructive/20">
            <div>
              <p className="font-medium text-sm">Delete Account</p>
              <p className="text-xs text-muted-foreground">
                Permanently delete your account and all associated data.
              </p>
            </div>
            {/* TODO: wire to Supabase auth.admin.deleteUser */}
            <Button variant="destructive" size="sm">Delete Account</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
