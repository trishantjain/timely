import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from "@/components/ui/dialog"

import { useEffect } from "react";

import { getDomains } from "@/api/domainAPI";
import { createProject } from "@/api/projectAPI"

export default function CreateProjectDialog({ open,
  onClose,
  onSuccess
}) {

  // const [open, setOpen] = useState(false);

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
        domains: selectedDomains
      });

      onSuccess();

      setName("");
      setDescription("");

      setSelectedDomains([]);

      // close dialog
      onClose();

    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false);
    }

  }

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

    setSelectedDomains(prev =>

      prev.includes(id)

        ? prev.filter(d => d !== id)

        : [...prev, id]

    );

  };



  return (

    <Dialog
      open={open}
      onOpenChange={(value) => {
        // setOpen(value);

        if (!value) {
          setName("");
          setDescription("");
          setSelectedDomains([]);

          onClose();
        }
      }}
    >

      <DialogContent>

        <DialogHeader>
          <DialogTitle>Create Project</DialogTitle>
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

          <div className="space-y-2">

            <h3 className="font-medium">
              Required Domains
            </h3>

            <div className="grid grid-cols-2 gap-3">
              {domains.map(domain => (
                <div
                  key={domain._id}
                  onClick={() => toggleDomain(domain._id)}
                  className={`cursor-pointer rounded-lg border p-3 transition ${selectedDomains.includes(domain._id)
                    ? "border-blue-600 bg-blue-50"
                    : "border-gray-200"
                    }`}
                >
                  <div className="flex items-center gap-2">
                    <Checkbox
                      checked={selectedDomains.includes(domain._id)}
                    />
                    <span>{domain.name}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <Button
            disabled={
              loading ||
              !name.trim() ||
              selectedDomains.length === 0
            }
            onClick={handleCreate}
          >
            {loading ? "Creating..." : "Create Project"}
          </Button>

        </div>

      </DialogContent>

    </Dialog>

  )
}