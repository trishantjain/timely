import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

import { createDomain } from "@/api/domainAPI";

export default function CreateDomainDialog({ refreshDomains }) {
  const [open, setOpen] = useState(false);

  const [name, setName] = useState("");

  const [description, setDescription] = useState("");

  const [color, setColor] = useState("#3B82F6");

  const [loading, setLoading] = useState(false);

  const [error, setError] = useState("");

  const handleCreate = async () => {
    if (!name.trim()) {
      setError("Domain name is required.");

      return;
    }

    try {
      setLoading(true);

      setError("");

      await createDomain({
        name: name.trim(),

        description: description.trim(),

        color,
      });

      await refreshDomains();

      setName("");

      setDescription("");

      setColor("#3B82F6");

      setOpen(false);
    } catch (err) {
      console.error(err);

      setError(err.response?.data?.message || "Unable to create domain.");
    } finally {
      setLoading(false);
    }
  };

  const handleOpenChange = (value) => {
    setOpen(value);

    if (!value) {
      setError("");
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button>+ Add Domain</Button>
      </DialogTrigger>

      <DialogContent className="border-border bg-card sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-foreground">Create Domain</DialogTitle>

          <DialogDescription className="text-muted-foreground">
            Add a new domain for employee expertise and project work.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-5">
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">
              Domain Name
            </label>

            <Input
              placeholder="e.g. Software"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="bg-background"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">
              Description
            </label>

            <Textarea
              placeholder="Briefly describe this domain..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="resize-none bg-background"
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">
              Domain Color
            </label>

            <div className="flex items-center gap-3">
              <input
                type="color"
                value={color}
                onChange={(e) => setColor(e.target.value)}
                className="w-10 h-10 p-1 border rounded-md cursor-pointer border-border bg-background"
              />

              <div
                className="w-8 h-8 border rounded-md border-border"
                style={{
                  backgroundColor: color,
                }}
              />
            </div>
          </div>

          {error && (
            <div className="px-3 py-2 text-sm border rounded-md border-destructive/40 bg-destructive/10 text-destructive">
              {error}
            </div>
          )}

          <div className="flex justify-end gap-3 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={loading}
            >
              Cancel
            </Button>

            <Button onClick={handleCreate} disabled={loading}>
              {loading ? "Creating..." : "Create Domain"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
