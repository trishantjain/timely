import { useEffect, useMemo, useState } from "react";

import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

import { getTaskUpdates, addTaskUpdate } from "@/api/dailyUpdateAPI";

import { AlertCircle, History } from "lucide-react";

const formatDay = (date) =>
  new Date(date).toLocaleDateString(undefined, {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

const formatTime = (date) =>
  new Date(date).toLocaleTimeString(undefined, {
    hour: "2-digit",
    minute: "2-digit",
  });

// Groups a flat, newest-first list of updates into date-wise buckets
// while preserving the newest-first ordering of the buckets themselves.
const groupByDay = (updates) => {
  const groups = [];
  const indexByDay = new Map();

  updates.forEach((update) => {
    const dayKey = new Date(update.createdAt).toDateString();

    if (!indexByDay.has(dayKey)) {
      indexByDay.set(dayKey, groups.length);
      groups.push({ dayKey, date: update.createdAt, items: [] });
    }

    groups[indexByDay.get(dayKey)].items.push(update);
  });

  return groups;
};

/**
 * Daily-updates / progress-history timeline for a single task.
 *
 * - `canPost=true` (employee, assigned/tagged on the task) shows the
 *   composer so they can log a new update.
 * - `canPost=false` (admin, or read-only contexts) only renders the
 *   history.
 *
 * This is intentionally separate from task submission / review — it
 * never touches Submission or SubmissionVersion data.
 */
export default function DailyUpdatesTimeline({ componentId, taskId, canPost }) {
  const [loading, setLoading] = useState(true);
  const [updates, setUpdates] = useState([]);
  const [error, setError] = useState("");

  const [content, setContent] = useState("");
  const [posting, setPosting] = useState(false);
  const [postError, setPostError] = useState("");

  const loadUpdates = async () => {
    try {
      setLoading(true);
      setError("");

      const res = await getTaskUpdates(componentId, taskId);

      setUpdates(res.data?.data || []);
    } catch (err) {
      console.error(err);

      setError(
        err.response?.data?.message || "Unable to load daily updates.",
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (componentId && taskId) {
      loadUpdates();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [componentId, taskId]);

  const grouped = useMemo(() => groupByDay(updates), [updates]);

  const handlePost = async () => {
    if (!content.trim()) {
      setPostError("Please write an update before posting.");
      return;
    }

    try {
      setPosting(true);
      setPostError("");

      await addTaskUpdate(componentId, taskId, { content: content.trim() });

      setContent("");

      await loadUpdates();
    } catch (err) {
      console.error(err);

      setPostError(err.response?.data?.message || "Unable to add update.");
    } finally {
      setPosting(false);
    }
  };

  return (
    <Card className="border-border bg-card">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <History size={16} className="text-muted-foreground" />
          Daily Updates
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-5">
        {canPost && (
          <div className="space-y-2">
            <Textarea
              placeholder="What did you work on today? Progress, blockers, notes..."
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="min-h-[90px] resize-y bg-background"
            />

            {postError && (
              <div className="flex items-center gap-2 text-sm text-destructive">
                <AlertCircle size={16} />
                {postError}
              </div>
            )}

            <div className="flex justify-end">
              <Button
                type="button"
                size="sm"
                onClick={handlePost}
                disabled={posting || !content.trim()}
              >
                {posting ? "Posting..." : "Post Update"}
              </Button>
            </div>
          </div>
        )}

        {loading ? (
          <p className="text-sm text-muted-foreground">Loading updates...</p>
        ) : error ? (
          <div className="flex items-center gap-2 text-sm text-destructive">
            <AlertCircle size={16} />
            {error}
          </div>
        ) : grouped.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            No daily updates have been posted for this task yet.
          </p>
        ) : (
          <div className="space-y-5">
            {grouped.map((group) => (
              <div key={group.dayKey}>
                <p className="mb-2 text-xs font-semibold tracking-wide uppercase text-muted-foreground">
                  {formatDay(group.date)}
                </p>

                <div className="space-y-3">
                  {group.items.map((update) => (
                    <div
                      key={update._id}
                      className="flex items-start gap-3 p-3 border rounded-lg border-border bg-muted/40"
                    >
                      <Avatar className="w-8 h-8 mt-0.5">
                        <AvatarFallback className="text-xs font-semibold">
                          {(update.employee?.username || "?")
                            .charAt(0)
                            .toUpperCase()}
                        </AvatarFallback>
                      </Avatar>

                      <div className="min-w-0">
                        <div className="flex flex-wrap items-baseline gap-x-2">
                          <span className="text-sm font-medium">
                            {update.employee?.username || "Unknown"}
                          </span>

                          <span className="text-xs text-muted-foreground">
                            {formatTime(update.createdAt)}
                          </span>
                        </div>

                        <p className="mt-1 text-sm leading-6 whitespace-pre-wrap text-foreground/90">
                          {update.content}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
