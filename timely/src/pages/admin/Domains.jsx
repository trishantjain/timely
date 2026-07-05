import { useEffect, useState } from "react";
import { createDomain, getDomains } from "../../api/domainAPI";

export default function Domain() {
    const [domains, setDomains] = useState([]);
    const [name, setName] = useState("");
    const [color, setColor] = useState("#3B82F6");
    const [loading, setLoading] = useState(false);

    const fetchDomains = async () => {
        try {
            const res = await getDomains();
            setDomains(res.data.data);
        } catch (err) {
            console.error(err);
        }
    };

    useEffect(() => {
        fetchDomains();
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!name.trim()) {
            alert("Domain name is required");
            return;
        }

        try {
            setLoading(true);

            await createDomain({
                name,
                color
            });

            setName("");
            setColor("#3B82F6");

            fetchDomains();

        } catch (err) {
            alert(err.response?.data?.message || "Unable to create domain");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-5xl p-6 mx-auto">

            <h1 className="mb-6 text-3xl font-bold">
                Domain Management
            </h1>

            <form
                onSubmit={handleSubmit}
                className="p-5 mb-8 bg-white rounded-lg shadow"
            >

                <div className="grid grid-cols-2 gap-4">

                    <input
                        type="text"
                        placeholder="Domain Name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="px-3 py-2 border rounded"
                    />

                    <input
                        type="color"
                        value={color}
                        onChange={(e) => setColor(e.target.value)}
                        className="h-10"
                    />

                </div>

                <button
                    className="px-5 py-2 mt-4 text-white bg-blue-600 rounded"
                    disabled={loading}
                >
                    {loading ? "Creating..." : "Create Domain"}
                </button>

            </form>

            <div className="bg-white rounded-lg shadow">

                <table className="w-full">

                    <thead className="border-b">

                        <tr>

                            <th className="p-4 text-left">
                                Name
                            </th>

                            <th className="p-4 text-left">
                                Color
                            </th>

                        </tr>

                    </thead>

                    <tbody>

                        {domains.map((domain) => (

                            <tr
                                key={domain._id}
                                className="border-b"
                            >

                                <td className="p-4">
                                    {domain.name}
                                </td>

                                <td className="p-4">

                                    <div
                                        className="w-6 h-6 border rounded-full"
                                        style={{
                                            backgroundColor: domain.color
                                        }}
                                    />

                                </td>

                            </tr>

                        ))}

                    </tbody>

                </table>

            </div>

        </div>
    )

}