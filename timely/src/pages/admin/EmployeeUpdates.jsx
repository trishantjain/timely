import { useEffect, useMemo, useState } from "react";

import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";

import { getAllGeneralUpdates } from "@/api/dailyUpdateAPI";
import { getEmployees } from "@/api/employeeAPI";

import { AlertCircle, Users } from "lucide-react";

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

  const [employees, setEmployees] = useState([]);
  const [employeeFilter, setEmployeeFilter] = useState("");
  const [dateFilter, setDateFilter] = useState("");

  useEffect(() => {
    getEmployees()
      .then((res) => setEmployees(res.data?.data || []))
      .catch((err) => console.error(err));
  }, []);

  const loadUpdates = async () => {
    try {
      setLoading(true);
      setError("");

      const params = {};

      if (employeeFilter) params.employeeId = employeeFilter;
      if (dateFilter) params.date = dateFilter;

      const res = await getAllGeneralUpdates(params);

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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [employeeFilter, dateFilter]);

  const grouped = useMemo(() => groupByDay(updates), [updates]);

  return (
    <div className="max-w-5xl p-6 mx-auto lg:p-8">
      <div className="flex flex-col gap-1 mb-6">
        <h1 className="text-2xl font-semibold tracking-tight">
          Employee Updates
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          General, project-independent daily updates posted by employees.
        </p>
      </div>

      {/* FILTERS */}
      <Card className="mb-6 border-border bg-card">
        <CardContent className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center">
          <Select
            value={employeeFilter}
            onValueChange={(value) =>
              setEmployeeFilter(value === "__ALL__" ? "" : value)
            }
          >
            <SelectTrigger className="bg-background sm:w-64">
              <SelectValue placeholder="All employees" />
            </SelectTrigger>

            <SelectContent>
              <SelectItem value="__ALL__">All employees</SelectItem>

              {employees.map((emp) => (
                <SelectItem key={emp._id} value={emp._id}>
                  {emp.username}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Input
            type="date"
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
            className="bg-background sm:w-52"
          />

          {(employeeFilter || dateFilter) && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => {
                setEmployeeFilter("");
                setDateFilter("");
              }}
            >
              Clear filters
            </Button>
          )}
        </CardContent>
      </Card>

      {/* RESULTS */}
      {loading ? (
        <p className="text-sm text-muted-foreground">Loading updates...</p>
      ) : error ? (
        <div className="flex items-center gap-2 text-sm text-destructive">
          <AlertCircle size={16} />
          {error}
        </div>
      ) : grouped.length === 0 ? (
        <Card className="border-border bg-card">
          <CardContent className="py-10 text-sm text-center text-muted-foreground">
            No updates found for the selected filters.
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {grouped.map((group) => (
            <div key={group.dayKey}>
              <p className="mb-3 text-xs font-semibold tracking-wide uppercase text-muted-foreground">
                {formatDay(group.date)}
              </p>

              <div className="space-y-3">
                {group.items.map((update) => (
                  <Card key={update._id} className="border-border bg-card">
                    <CardContent className="flex items-start gap-3 p-4">
                      <Avatar className="w-9 h-9 mt-0.5">
                        <AvatarFallback className="text-xs font-semibold">
                          {(update.employee?.username || "?")
                            .charAt(0)
                            .toUpperCase()}
                        </AvatarFallback>
                      </Avatar>

                      <div className="min-w-0">
                        <div className="flex flex-wrap items-baseline gap-x-2">
                          <span className="text-sm font-semibold">
                            {update.employee?.username || "Unknown"}
                          </span>

                          <span className="text-xs text-muted-foreground">
                            {formatTime(update.createdAt)}
                          </span>
                        </div>

                        {update.title && (
                          <p className="mt-1 text-sm font-medium">
                            {update.title}
                          </p>
                        )}

                        <p className="mt-1 text-sm leading-6 whitespace-pre-wrap text-foreground/90">
                          {update.content}
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {employees.length === 0 && (
        <div className="flex items-center gap-2 mt-4 text-xs text-muted-foreground">
          <Users size={14} />
          No employees found yet.
        </div>
      )}
    </div>
  );
}
