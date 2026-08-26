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

      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Create Domain</DialogTitle>

          <DialogDescription>
            Add a new domain for employee expertise and project work.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-5">
          {/* DOMAIN NAME */}

          <div className="space-y-2">
            <label className="text-sm font-medium">Domain Name</label>

            <Input
              placeholder="e.g. Software"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          {/* DESCRIPTION */}

          <div className="space-y-2">
            <label className="text-sm font-medium">Description</label>

            <Textarea
              placeholder="Briefly describe this domain..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="resize-none"
              rows={3}
            />
          </div>

          {/* COLOR */}

          <div className="space-y-2">
            <label className="text-sm font-medium">Domain Color</label>

            <div className="flex items-center gap-3">
              <input
                type="color"
                value={color}
                onChange={(e) => setColor(e.target.value)}
                className="
                                    w-10
                                    h-10
                                    p-1
                                    border
                                    rounded-md
                                    cursor-pointer
                                "
              />

              <div
                className="w-8 h-8 border rounded-md"
                style={{
                  backgroundColor: color,
                }}
              />

              <span className="text-sm text-muted-foreground">{color}</span>
            </div>
          </div>

          {/* ERROR */}

          {error && <p className="text-sm text-destructive">{error}</p>}

          {/* ACTIONS */}

          <div className="flex justify-end gap-3 pt-2">
            <Button
              type="button"
              variant="outline"
              disabled={loading}
              onClick={() => handleOpenChange(false)}
            >
              Cancel
            </Button>

            <Button disabled={loading || !name.trim()} onClick={handleCreate}>
              {loading ? "Creating..." : "Create Domain"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
