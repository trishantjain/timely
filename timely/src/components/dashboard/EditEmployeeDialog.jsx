import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

import { getDomains } from "@/api/domainAPI";
import { updateEmployee } from "@/api/employeeAPI";

export default function EditEmployeeDialog({
  employee,
  open,
  onOpenChange,
  onUpdated,
}) {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");

  const [domains, setDomains] = useState([]);

  const [selectedDomains, setSelectedDomains] = useState([]);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const loadDomains = async () => {
    try {
      const res = await getDomains();

      setDomains(res.data.data || []);
    } catch (err) {
      console.error("Failed to load domains:", err);
    }
  };

  useEffect(() => {
    if (!open || !employee) return;

    setUsername(employee.username || "");

    setEmail(employee.email || "");

    setSelectedDomains(employee.expertise?.map((domain) => domain._id) || []);

    setError("");

    loadDomains();
  }, [open, employee]);

  const toggleDomain = (id) => {
    setSelectedDomains((prev) =>
      prev.includes(id)
        ? prev.filter((domainId) => domainId !== id)
        : [...prev, id],
    );
  };

  const handleUpdate = async (e) => {
    e?.preventDefault?.();

    if (!username.trim()) {
      setError("Username is required.");
      return;
    }

    if (!email.trim() || !/^\S+@\S+\.\S+$/.test(email.trim())) {
      setError("A valid email is required.");
      return;
    }

    try {
      setLoading(true);
      setError("");

      const res = await updateEmployee(employee._id, {
        username,
        email,
        expertise: selectedDomains,
      });

      onUpdated(res.data.data);

      onOpenChange(false);
    } catch (err) {
      console.error("Failed to update employee:", err);

      setError(err.response?.data?.message || "Failed to update employee.");
    } finally {
      setLoading(false);
    }
  };

  const handleOpenChange = (value) => {
    onOpenChange(value);

    if (!value) {
      setError("");
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Edit Employee</DialogTitle>

          <DialogDescription>
            Update employee information and expertise.
          </DialogDescription>
        </DialogHeader>

        <form className="space-y-5" onSubmit={handleUpdate}>
          {/* USERNAME */}

          <div className="space-y-2">
            <label className="text-sm font-medium">Username</label>

            <Input
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
          </div>

          {/* EMAIL */}

          <div className="space-y-2">
            <label className="text-sm font-medium">Email</label>

            <Input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>


          {/* EXPERTISE */}

          <div>
            <h3 className="mb-3 text-sm font-medium">Expertise</h3>

            <div className="grid grid-cols-2 gap-3">
              {domains.map((domain) => (
                <div
                  key={domain._id}
                  onClick={() => toggleDomain(domain._id)}
                  className={`
                    flex
                    cursor-pointer
                    items-center
                    gap-2
                    rounded-lg
                    border
                    p-3
                    transition

                    ${
                      selectedDomains.includes(domain._id)
                        ? "border-primary bg-muted"
                        : "hover:bg-muted/50"
                    }
                `}
                >
                  <Checkbox checked={selectedDomains.includes(domain._id)} />

                  <span className="text-sm">{domain.name}</span>
                </div>
              ))}
            </div>
          </div>

          {error && (
            <div className="px-3 py-2 text-sm border rounded-md border-destructive/40 bg-destructive/10 text-destructive">
              {error}
            </div>
          )}

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

            <Button
              type="submit"
              disabled={loading || !username.trim() || !email.trim()}
            >
              {loading ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
