import { getSubmissionHistory, reviewSubmission } from "@/api/submissionAPI";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

export default function ReviewSubmission() {
    const { submissionId } = useParams();

    const navigate = useNavigate();

    const [loading, setLoading] = useState(true);
    const [submission, setSubmission] = useState(null);

    // const [reviewStatus, setReviewStatus] = useState("APPROVED");
    const [reviewComment, setReviewComment] = useState("");

    const loadSubmission = async () => {
        try {
            const res = await getSubmissionHistory(submissionId);
            console.log("FULL RESPONSE");
            console.log(res);

            console.log("DATA");
            console.log(res.data);

            console.log("HISTORY");
            console.log(res.data.history);

            setSubmission(res.data);
        }
        catch (err) {
            console.error(err);

            alert("Unable to load submission.");
        }
        finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        loadSubmission();
    }, []);

    const handleReview = async (status) => {
        try {

            await reviewSubmission(
                submissionId,
                {
                    // status: reviewStatus,
                    // reviewComment
                    reviewStatus: status,
                    reviewRemark: reviewComment
                }
            );

            alert("Review submitted successfully.");

            navigate(-1);
        }
        catch (err) {
            console.error(err);

            alert(
                err.response?.data?.message ||
                "Review failed."
            );
        }
    };

    if (loading)
        return <div className="p-8">Loading...</div>;

    if (!submission ||
        !submission.history || submission.history.length === 0)
        return (
            <div className="p-8">
                Submission not found.
            </div>
        );

    const latest = submission.latestSubmission;

    const reviewed =
        latest.reviewStatus === "APPROVED" ||
        latest.reviewStatus === "REJECTED";

    return (

        <div className="max-w-5xl p-8 mx-auto">

            <h1 className="text-3xl font-bold">
                Review Submission
            </h1>

            <div className="p-6 mt-8 space-y-3 border rounded-lg">

                <p>
                    <strong>Version :</strong>{" "}
                    {latest.version}
                </p>

                <p>
                    <strong>Submitted By :</strong>{" "}
                    {latest.submittedBy?.username}
                </p>

                <p>
                    <strong>Email :</strong>{" "}
                    {latest.submittedBy?.email}
                </p>

                <p>
                    <strong>Submitted On :</strong>{" "}
                    {new Date(
                        latest.createdAt
                    ).toLocaleString()}
                </p>

                <p>
                    <strong>Status :</strong>{" "}
                    {latest.reviewStatus}
                </p>

            </div>

            <div>
                {submission.history.slice(1).map((version) => (
                    <div
                        key={version._id}
                        className="p-4 mb-4 border rounded-lg"
                    >
                        <h3 className="font-semibold">
                            Version {version.version}
                        </h3>

                        <p className="text-sm text-gray-500">
                            {new Date(version.createdAt).toLocaleString()}
                        </p>

                        <div className="mt-3 whitespace-pre-wrap">
                            {version.textSubmission}
                        </div>

                        {version.reviewRemark && (
                            <div className="p-3 mt-3 rounded bg-red-50">
                                <strong>Previous Review</strong>

                                <p>{version.reviewRemark}</p>
                            </div>
                        )}
                    </div>
                ))}
            </div>

            <div className="mt-8">

                <h3 className="mb-3 text-lg font-semibold">
                    Employee Submission
                </h3>

                <div className="p-5 whitespace-pre-wrap border rounded-lg min-h-40">
                    {
                        latest.textSubmission ||
                        "No text submitted."
                    }
                </div>

            </div>

            <div className="mt-8">

                <h3 className="mb-3 font-semibold">
                    Review Comment
                </h3>

                <Textarea
                    value={reviewComment}
                    onChange={(e) =>
                        setReviewComment(
                            e.target.value
                        )
                    }
                    placeholder="Write review..."
                    className="min-h-40"
                />

            </div>

            <div className="flex gap-4 mt-8">

                <Button
                    disabled={reviewed}
                    variant="destructive"
                    onClick={() => handleReview("REJECTED")}
                >
                    Reject
                </Button>

                <Button
                    disabled={reviewed}
                    onClick={() => handleReview("APPROVED")}
                >
                    Approve
                </Button>

            </div>

        </div>

    );
}