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
    DialogTrigger,
} from "@/components/ui/dialog";
import { getDomains } from "@/api/domainAPI";
import { createEmployee } from "@/api/employeeAPI";

export default function CreateEmployeeDialog({
    refreshEmployees
}) {
    const [open, setOpen] = useState(false);

    const [username, setUsername] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    const [domains, setDomains] = useState([]);
    const [selectedDomains, setSelectedDomains] = useState([]);

    const [loading, setLoading] = useState(false);


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

    const handleCreate = async () => {

        try {

            setLoading(true);

            
            await createEmployee({
                username,
                email,
                password,
                role: "employee",
                expertise: selectedDomains
            });
            
            console.log({
                username,
                email,
                password,
                selectedDomains
            });
            
            refreshEmployees();

            setUsername("");
            setEmail("");
            setPassword("");

            setSelectedDomains([]);

            setOpen(false);

        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }

    };

    return (
        <Dialog
            open={open}
            onOpenChange={setOpen}
        >

            <DialogTrigger asChild>

                <Button>
                    + Add Employee
                </Button>

            </DialogTrigger>

            <DialogContent>

                <DialogHeader>

                    <DialogTitle>
                        Create Employee
                    </DialogTitle>

                    <DialogDescription>
                        Create a new employee account.
                    </DialogDescription>

                </DialogHeader>

                <div className="space-y-4">

                    <Input
                        placeholder="Username"
                        value={username}
                        onChange={(e) =>
                            setUsername(e.target.value)
                        }
                    />

                    <Input
                        placeholder="Email"
                        value={email}
                        onChange={(e) =>
                            setEmail(e.target.value)
                        }
                    />

                    <Input
                        type="password"
                        placeholder="Password"
                        value={password}
                        onChange={(e) =>
                            setPassword(e.target.value)
                        }
                    />

                    <div>

                        <h3 className="mb-2 font-medium">
                            Expertise
                        </h3>

                        <div className="grid grid-cols-2 gap-3">
                            {domains.map(domain => (

                                <div
                                    key={domain._id}
                                    onClick={() =>
                                        toggleDomain(domain._id)
                                    }
                                    className={`cursor-pointer rounded-lg border p-3 transition ${selectedDomains.includes(domain._id)
                                        ? "border-blue-600 bg-blue-50"
                                        : ""
                                        }`}
                                >

                                    <div className="flex items-center gap-2">

                                        <Checkbox
                                            checked={selectedDomains.includes(domain._id)}
                                        />

                                        <span>
                                            {domain.name}
                                        </span>

                                    </div>

                                </div>

                            ))}

                        </div>

                    </div>

                    <Button
                        disabled={
                            loading ||
                            !username ||
                            !email ||
                            !password
                        }
                        onClick={handleCreate}
                        className="w-full"
                    >

                        {loading
                            ? "Creating..."
                            : "Create Employee"}

                    </Button>

                </div>

            </DialogContent>

        </Dialog>
    );

}