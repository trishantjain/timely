import { getPendingReviews } from "@/api/submissionAPI";
import { useEffect, useState } from "react";

export default function PendingReviews() {
    const navigate = useNavigate();

    const [loading, setLoading] = useState(true);
    const [submissions, setSubmissions] = useState([]);

    const loadData = async () => {

        try {
            const res = await getPendingReviews();

            setSubmissions(res.data.data);

        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }


    }

    useEffect(() => {
        loadData();
    }, []);

    if (loading) {
        return <div className="p-8">Loading...</div>;
    }

    return (

        <div className="max-w-6xl p-8 mx-auto">

            <div className="flex items-center justify-between">

                <h1 className="text-3xl font-bold">

                    Pending Reviews

                </h1>

                <p>

                    Total : {submissions.length}

                </p>

            </div>

            <div className="mt-8 space-y-4">

                {submissions.map(item => (

                    <div
                        key={item._id}
                        className="flex items-center justify-between p-5 border shadow-sm rounded-xl"
                    >

                        <div>

                            <h2 className="text-xl font-semibold">

                                {item.projectName}

                            </h2>

                            <p>

                                Component :
                                {" "}
                                {item.componentName}

                            </p>

                            <p>

                                Employee :
                                {" "}
                                {item.employeeName}

                            </p>

                            <p>

                                Status :
                                {" "}
                                {item.status}

                            </p>

                        </div>

                        <Button
                            onClick={() =>
                                navigate(`/admin/reviews/${item._id}`)
                            }
                        >
                            Review
                        </Button>

                    </div>

                ))}

            </div>

        </div>

    );
}