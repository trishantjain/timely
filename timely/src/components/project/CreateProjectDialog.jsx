import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import { getDomains } from "@/api/domainAPI";
import { createProject } from "@/api/projectAPI";

export default function CreateProjectDialog({ open, onClose, onSuccess }) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [domains, setDomains] = useState([]);
  const [selectedDomains, setSelectedDomains] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleCreate = async (e) => {
    e?.preventDefault?.();

    if (!name.trim()) {
      setError("Project name is required.");
      return;
    }

    if (selectedDomains.length === 0) {
      setError("Select at least one required domain.");
      return;
    }

    try {
      setLoading(true);
      setError("");

      await createProject({
        name: name.trim(),
        description: description.trim(),
        domains: selectedDomains,
      });

      // Reset form
      setName("");
      setDescription("");
      setSelectedDomains([]);
      setError("");

      // Parent will close the dialog
      onSuccess();
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || "Failed to create project.");
    } finally {
      setLoading(false);
    }
  };

  const loadDomains = async () => {
    try {
      const res = await getDomains();

      setDomains(Array.isArray(res.data?.data) ? res.data.data : []);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    if (!open) return;

    loadDomains();
  }, [open]);

  const handleDomainChange = (id, checked) => {
    setSelectedDomains((prev) => {
      if (checked === true) {
        return prev.includes(id) ? prev : [...prev, id];
      }

      return prev.filter((domainId) => domainId !== id);
    });
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(value) => {
        if (!value) {
          setName("");
          setDescription("");
          setSelectedDomains([]);
          setError("");

          onClose();
        }
      }}
    >
      <DialogContent className="border-border bg-card text-card-foreground sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-xl">Create Project</DialogTitle>
        </DialogHeader>

        <form className="space-y-4" onSubmit={handleCreate}>
          <Input
            placeholder="Project Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />

          <Textarea
            placeholder="Project Description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={4}
          />

          <div className="space-y-3">
            <div>
              <h3 className="font-medium">Required Domains</h3>

              <p className="mt-1 text-sm text-muted-foreground">
                Select the domains required for this project.
              </p>
            </div>

            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
              {domains.map((domain) => {
                const isSelected = selectedDomains.includes(domain._id);

                return (
                  <label
                    key={domain._id}
                    className="flex items-center gap-3 p-3 text-left transition-colors border rounded-lg cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={(e) =>
                        handleDomainChange(domain._id, e.target.checked)
                      }
                      className="h-4 w-4 shrink-0 accent-primary"
                    />

                    <span>{domain.name}</span>
                  </label>
                );
              })}
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
              onClick={onClose}
              disabled={loading}
            >
              Cancel
            </Button>

            <Button
              type="submit"
              disabled={loading || !name.trim() || selectedDomains.length === 0}
            >
              {loading ? "Creating..." : "Create Project"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
