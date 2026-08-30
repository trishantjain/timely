import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";

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

  const handleCreate = async () => {
    try {
      setLoading(true);

      await createProject({
        name,
        description,
        domains: selectedDomains,
      });

      onSuccess();

      setName("");
      setDescription("");
      setSelectedDomains([]);

      onClose();
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const loadDomains = async () => {
    try {
      const res = await getDomains();

      setDomains(res.data.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    if (!open) return;

    loadDomains();
  }, [open]);

  const toggleDomain = (id) => {
    setSelectedDomains((prev) =>
      prev.includes(id)
        ? prev.filter((domainId) => domainId !== id)
        : [...prev, id],
    );
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(value) => {
        if (!value) {
          setName("");
          setDescription("");
          setSelectedDomains([]);

          onClose();
        }
      }}
    >
      <DialogContent className="border-border bg-card text-card-foreground sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-xl">Create Project</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
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
                  <div
                    role="button"
                    tabIndex={0}
                    onClick={() => toggleDomain(domain._id)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        toggleDomain(domain._id);
                      }
                    }}
                    className="flex items-center gap-3 p-3 text-left transition-colors border rounded-lg cursor-pointer"
                  >
                    <Checkbox
                      checked={selectedDomains.includes(domain._id)}
                      onCheckedChange={() => toggleDomain(domain._id)}
                    />

                    <span>{domain.name}</span>
                  </div>
                );
              })}
            </div>
          </div>

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
              type="button"
              disabled={loading || !name.trim() || selectedDomains.length === 0}
              onClick={handleCreate}
            >
              {loading ? "Creating..." : "Create Project"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
