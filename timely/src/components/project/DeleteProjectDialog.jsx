import { useState } from "react";
import { Button } from "@/components/ui/button";

import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogTrigger,
} from "@/components/ui/dialog";

import { Trash2 } from "lucide-react";
import { deleteProject } from "@/api/projectAPI";

export default function DeleteProjectDialog({
    project,
    refreshProjects,
}) {

    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(false);

    const handleDelete = async () => {

        try {
            setLoading(true);

            await deleteProject(project._id);

            refreshProjects();
            setOpen(false);

        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }

    };

    return (

        <Dialog open={open} onOpenChange={setOpen}>

            <DialogTrigger asChild>

                <Button
                    variant="destructive"
                    size="icon"
                    onClick={(e) => {
                        e.stopPropagation();
                    }}
                >
                    <Trash2 className="w-4 h-4" />
                    {/* {loading ? "Deleting..." : "Delete"} */}
                </Button>

            </DialogTrigger>

            <DialogContent onClick={(e) => e.stopPropagation()} >

                <DialogHeader>

                    <DialogTitle>
                        Delete Project
                    </DialogTitle>

                    <DialogDescription>

                        Are you sure you want to delete

                        <span className="font-semibold">
                            {" "}{project.name}
                        </span>

                        ?

                        <br /><br />

                        This action cannot be undone.

                    </DialogDescription>

                </DialogHeader>

                <div className="flex justify-end gap-3 mt-6">
                    <Button
                        variant="outline"
                        onClick={() => setOpen(false)}
                    >
                        Cancel
                    </Button>

                    <Button
                        variant="destructive"
                        disabled={loading}
                        onClick={handleDelete}
                    >
                        {loading ? "Deleting..." : "Delete"}
                    </Button>
                </div>

            </DialogContent>

        </Dialog>

    );

}