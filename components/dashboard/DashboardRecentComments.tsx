import Link from "next/link";
import { DashboardTaskCommentSummary } from "@/types";

interface DashboardRecentCommentsProps {
  comments: DashboardTaskCommentSummary[];
}

export function DashboardRecentComments({
  comments,
}: DashboardRecentCommentsProps) {
  return (
    <section className="tf-panel tf-noise rounded-[1.75rem] p-5 sm:p-6">
      <p className="tf-meta">Conversation</p>
      <h2 className="mt-2 tf-heading text-2xl text-[rgb(var(--foreground))]">
        Recent comments on my tasks
      </h2>
      <p className="mt-3 text-sm leading-7 text-[rgb(var(--muted-foreground))]">
        The latest discussion activity around tasks you created.
      </p>

      <div className="mt-6 space-y-3">
        {comments.length === 0 ? (
          <div className="tf-panel-soft rounded-[1.35rem] p-5">
            <p className="text-base font-medium text-[rgb(var(--foreground))]">
              No recent comments
            </p>
            <p className="mt-2 text-sm text-[rgb(var(--muted-foreground))]">
              Comments on tasks you create will appear here.
            </p>
          </div>
        ) : (
          comments.map((comment) => (
            <Link
              key={comment.id}
              href={`/projects/${comment.project_id}`}
              className="tf-panel-soft block rounded-[1.35rem] p-4 transition-all duration-200 hover:-translate-y-0.5 hover:border-black/10 dark:hover:border-white/10"
            >
              <p className="text-sm font-semibold text-[rgb(var(--foreground))]">
                {comment.task_title}
              </p>

              <p className="mt-2 line-clamp-3 text-sm text-[rgb(var(--muted-foreground))]">
                {comment.content}
              </p>

              <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
                <span className="text-xs text-[rgb(var(--muted-foreground))]">
                  {comment.author?.full_name ||
                    comment.author?.email ||
                    "Unknown user"}
                </span>

                <span className="text-xs text-[rgb(var(--muted-foreground))]">
                  {comment.project_name} •{" "}
                  {new Date(comment.created_at).toLocaleDateString()}
                </span>
              </div>
            </Link>
          ))
        )}
      </div>
    </section>
  );
}
