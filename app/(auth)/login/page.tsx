import Link from 'next/link'
import { LoginForm } from '@/components/auth/LoginForm'

function ShieldIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      className="h-[18px] w-[18px]"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
    >
      <path d="M12 3l7 3v5c0 5-3.5 8.5-7 10-3.5-1.5-7-5-7-10V6l7-3Z" />
    </svg>
  )
}

function LightningIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      className="h-[18px] w-[18px]"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
    >
      <path d="M13 2 6 13h5l-1 9 8-12h-5l1-8Z" />
    </svg>
  )
}

function TeamIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      className="h-[18px] w-[18px]"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
    >
      <path d="M16 21v-2a4 4 0 0 0-4-4H7a4 4 0 0 0-4 4v2" />
      <circle cx="9.5" cy="7" r="3.25" />
      <path d="M20 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M14.5 4.13a3.25 3.25 0 0 1 0 5.74" />
    </svg>
  )
}

export default function LoginPage() {
  return (
    <section className="grid gap-6 lg:grid-cols-[1.05fr_0.95fr]">
      <div className="tf-panel tf-noise hidden rounded-[2rem] p-6 lg:flex lg:flex-col lg:justify-between lg:p-8">
        <div>
          <div className="tf-panel-soft inline-flex items-center gap-2 rounded-full px-4 py-3 text-sm text-[rgb(var(--foreground))]">
            <span className="inline-flex h-2.5 w-2.5 rounded-full bg-emerald-400 shadow-[0_0_14px_rgba(74,222,128,0.5)]" />
            Production-ready workspace
          </div>

          <p className="tf-meta mt-8">Welcome back</p>
          <h1 className="mt-3 tf-heading text-4xl text-[rgb(var(--foreground))] xl:text-5xl">
            Sign in to continue your workflow.
          </h1>

          <p className="mt-4 max-w-xl text-[15px] leading-8 text-[rgb(var(--muted-foreground))]">
            Access your boards, members, comments, activity, and live project
            updates in one polished workspace.
          </p>
        </div>

        <div className="mt-10 grid gap-3 sm:grid-cols-3">
          <div className="tf-panel-soft rounded-[1.4rem] p-4">
            <span className="inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-[rgba(var(--ring),0.16)] text-[rgb(var(--foreground))]">
              <LightningIcon />
            </span>
            <p className="mt-4 tf-meta">Realtime</p>
            <p className="mt-2 text-sm leading-7 text-[rgb(var(--muted-foreground))]">
              Live board and activity updates.
            </p>
          </div>

          <div className="tf-panel-soft rounded-[1.4rem] p-4">
            <span className="inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-[rgba(var(--ring),0.16)] text-[rgb(var(--foreground))]">
              <TeamIcon />
            </span>
            <p className="mt-4 tf-meta">Collaboration</p>
            <p className="mt-2 text-sm leading-7 text-[rgb(var(--muted-foreground))]">
              Roles, comments, assignees, and team flow.
            </p>
          </div>

          <div className="tf-panel-soft rounded-[1.4rem] p-4">
            <span className="inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-[rgba(var(--ring),0.16)] text-[rgb(var(--foreground))]">
              <ShieldIcon />
            </span>
            <p className="mt-4 tf-meta">Control</p>
            <p className="mt-2 text-sm leading-7 text-[rgb(var(--muted-foreground))]">
              Secure project access and admin settings.
            </p>
          </div>
        </div>
      </div>

      <div className="tf-panel tf-noise rounded-[2rem] p-5 sm:p-6 lg:p-8">
        <div className="mx-auto w-full max-w-md">
          <div className="mb-8">
            <p className="tf-meta">TaskFlow access</p>
            <h2 className="mt-2 tf-heading text-3xl text-[rgb(var(--foreground))]">
              Welcome back
            </h2>
            <p className="mt-3 text-sm leading-7 text-[rgb(var(--muted-foreground))]">
              Sign in to your TaskFlow account and continue where you left off.
            </p>
          </div>

          <LoginForm />
        </div>
      </div>
    </section>
  )
}