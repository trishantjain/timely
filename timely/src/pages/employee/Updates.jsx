import { useEffect, useMemo, useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

import { getMyGeneralUpdates, addGeneralUpdate } from "@/api/dailyUpdateAPI";

import { AlertCircle, NotebookPen } from "lucide-react";

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

export default function EmployeeUpdates() {
  const [loading, setLoading] = useState(true);
  const [updates, setUpdates] = useState([]);
  const [error, setError] = useState("");

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [posting, setPosting] = useState(false);
  const [postError, setPostError] = useState("");

  const loadUpdates = async () => {
    try {
      setLoading(true);
      setError("");

      const res = await getMyGeneralUpdates();

      setUpdates(res.data?.data || []);
    } catch (err) {
      console.error(err);

      setError(err.response?.data?.message || "Unable to load updates.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUpdates();
  }, []);

  const grouped = useMemo(() => groupByDay(updates), [updates]);

  const handlePost = async () => {
    if (!content.trim()) {
      setPostError("Please write an update before posting.");
      return;
    }

    try {
      setPosting(true);
      setPostError("");

      await addGeneralUpdate({ title: title.trim(), content: content.trim() });

      setTitle("");
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
    <div className="max-w-4xl p-6 mx-auto lg:p-8">
      <div className="flex flex-col gap-1 mb-6">
        <p className="text-sm text-muted-foreground">Employee Workspace</p>
        <h1 className="text-2xl font-semibold tracking-tight">Updates</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Log what you worked on today — meetings, research, or anything
          that isn't tied to a specific task.
        </p>
      </div>

      <div className="space-y-6">
        <Card className="border-border bg-card">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <NotebookPen size={16} className="text-muted-foreground" />
              New Update
            </CardTitle>
          </CardHeader>

          <CardContent className="space-y-3">
            <Input
              placeholder="Title (optional)"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="bg-background"
            />

            <Textarea
              placeholder="What did you work on today?"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="min-h-[110px] resize-y bg-background"
            />

            {postError && (
              <div className="flex items-center gap-2 text-sm text-destructive">
                <AlertCircle size={16} />
                {postError}
              </div>
            )}

            <div className="flex justify-end">
              <Button onClick={handlePost} disabled={posting || !content.trim()}>
                {posting ? "Posting..." : "Post Update"}
              </Button>
            </div>
          </CardContent>
        </Card>

        <div>
          <h2 className="mb-3 text-sm font-semibold tracking-wide uppercase text-muted-foreground">
            Your Update History
          </h2>

          {loading ? (
            <p className="text-sm text-muted-foreground">
              Loading updates...
            </p>
          ) : error ? (
            <div className="flex items-center gap-2 text-sm text-destructive">
              <AlertCircle size={16} />
              {error}
            </div>
          ) : grouped.length === 0 ? (
            <Card className="border-border bg-card">
              <CardContent className="py-8 text-sm text-center text-muted-foreground">
                You haven't posted any updates yet.
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-5">
              {grouped.map((group) => (
                <div key={group.dayKey}>
                  <p className="mb-2 text-xs font-semibold tracking-wide uppercase text-muted-foreground">
                    {formatDay(group.date)}
                  </p>

                  <div className="space-y-3">
                    {group.items.map((update) => (
                      <Card key={update._id} className="border-border bg-card">
                        <CardContent className="p-4">
                          <div className="flex items-start justify-between gap-3">
                            {update.title ? (
                              <p className="text-sm font-medium">
                                {update.title}
                              </p>
                            ) : (
                              <span />
                            )}

                            <span className="text-xs shrink-0 text-muted-foreground">
                              {formatTime(update.createdAt)}
                            </span>
                          </div>

                          <p className="mt-1 text-sm leading-6 whitespace-pre-wrap text-foreground/90">
                            {update.content}
                          </p>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
