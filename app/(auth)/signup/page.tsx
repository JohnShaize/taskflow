import Link from 'next/link'
import { SignupForm } from '@/components/auth/SignupForm'

function SparkIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      className="h-[18px] w-[18px]"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
    >
      <path d="m12 3 1.8 4.7L18.5 9l-4.7 1.8L12 15.5l-1.8-4.7L5.5 9l4.7-1.3L12 3Z" />
    </svg>
  )
}

function BoardIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      className="h-[18px] w-[18px]"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
    >
      <rect x="3.5" y="3.5" width="7" height="7" rx="1.5" />
      <rect x="13.5" y="3.5" width="7" height="5" rx="1.5" />
      <rect x="13.5" y="10.5" width="7" height="10" rx="1.5" />
      <rect x="3.5" y="12.5" width="7" height="8" rx="1.5" />
    </svg>
  )
}

function CommentIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      className="h-[18px] w-[18px]"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
    >
      <path d="M21 15a3 3 0 0 1-3 3H8l-5 3V6a3 3 0 0 1 3-3h12a3 3 0 0 1 3 3Z" />
    </svg>
  )
}

export default function SignupPage() {
  return (
    <section className="grid gap-6 lg:grid-cols-[1.02fr_0.98fr]">
      <div className="tf-panel tf-noise hidden rounded-[2rem] p-6 lg:flex lg:flex-col lg:justify-between lg:p-8">
        <div>
          <div className="tf-panel-soft inline-flex items-center gap-2 rounded-full px-4 py-3 text-sm text-[rgb(var(--foreground))]">
            <span className="inline-flex h-2.5 w-2.5 rounded-full bg-sky-400 shadow-[0_0_14px_rgba(56,189,248,0.5)]" />
            Build your workspace
          </div>

          <p className="tf-meta mt-8">Start fresh</p>
          <h1 className="mt-3 tf-heading text-4xl text-[rgb(var(--foreground))] xl:text-5xl">
            Create your account and launch your first workspace.
          </h1>

          <p className="mt-4 max-w-xl text-[15px] leading-8 text-[rgb(var(--muted-foreground))]">
            Set up projects, manage teams, organize tasks, and build a smooth
            collaborative workflow from day one.
          </p>
        </div>

        <div className="mt-10 grid gap-3 sm:grid-cols-3">
          <div className="tf-panel-soft rounded-[1.4rem] p-4">
            <span className="inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-[rgba(var(--ring),0.16)] text-[rgb(var(--foreground))]">
              <SparkIcon />
            </span>
            <p className="mt-4 tf-meta">Fast start</p>
            <p className="mt-2 text-sm leading-7 text-[rgb(var(--muted-foreground))]">
              Create a workspace and invite teammates quickly.
            </p>
          </div>

          <div className="tf-panel-soft rounded-[1.4rem] p-4">
            <span className="inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-[rgba(var(--ring),0.16)] text-[rgb(var(--foreground))]">
              <BoardIcon />
            </span>
            <p className="mt-4 tf-meta">Board flow</p>
            <p className="mt-2 text-sm leading-7 text-[rgb(var(--muted-foreground))]">
              Plan work visually with polished kanban boards.
            </p>
          </div>

          <div className="tf-panel-soft rounded-[1.4rem] p-4">
            <span className="inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-[rgba(var(--ring),0.16)] text-[rgb(var(--foreground))]">
              <CommentIcon />
            </span>
            <p className="mt-4 tf-meta">Context</p>
            <p className="mt-2 text-sm leading-7 text-[rgb(var(--muted-foreground))]">
              Keep comments, activity, and assignees together.
            </p>
          </div>
        </div>
      </div>

      <div className="tf-panel tf-noise rounded-[2rem] p-5 sm:p-6 lg:p-8">
        <div className="mx-auto w-full max-w-md">
          <div className="mb-8">
            <p className="tf-meta">Create account</p>
            <h2 className="mt-2 tf-heading text-3xl text-[rgb(var(--foreground))]">
              Join TaskFlow
            </h2>
            <p className="mt-3 text-sm leading-7 text-[rgb(var(--muted-foreground))]">
              Start managing projects, members, tasks, and activity in one clean workspace.
            </p>
          </div>

          <SignupForm />
        </div>
      </div>
    </section>
  )
}