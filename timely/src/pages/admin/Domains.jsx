import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import { getDomains } from "@/api/domainAPI";

import { Card, CardContent } from "@/components/ui/card";

import { ArrowRight, Circle } from "lucide-react";

import CreateDomainDialog from "@/components/dashboard/CreateDomainDialog";

export default function Domains() {
  const navigate = useNavigate();

  const [domains, setDomains] = useState([]);

  const [loading, setLoading] = useState(true);

  const fetchDomains = async () => {
    try {
      setLoading(true);

      const res = await getDomains();

      setDomains(res.data?.data || []);
    } catch (err) {
      console.error("Failed to fetch domains:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDomains();
  }, []);

  return (
    <div className="max-w-7xl p-6 mx-auto lg:p-8">
      {/* PAGE HEADER */}

      <div className="flex flex-col gap-4 mb-8 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Domains</h1>

          <p className="mt-1 text-sm text-muted-foreground">
            Manage domains and their information.
          </p>
        </div>

        <CreateDomainDialog refreshDomains={fetchDomains} />
      </div>

      {/* LOADING */}

      {loading ? (
        <div className="py-16 text-center">
          <p className="text-sm text-muted-foreground">Loading domains...</p>
        </div>
      ) : domains.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-sm text-muted-foreground">No domains found.</p>
          </CardContent>
        </Card>
      ) : (
        /* DOMAIN CARDS */

        <div
          className="
                            grid
                            grid-cols-1
                            gap-4
                            sm:grid-cols-2
                            lg:grid-cols-3
                            xl:grid-cols-4
                        "
        >
          {domains.map((domain) => (
            <Card
              key={domain._id}
              className="
                                        group
                                        cursor-pointer
                                        transition-all
                                        hover:-translate-y-0.5
                                        hover:shadow-md
                                        hover:border-primary/30
                                    "
              onClick={() => navigate(`/admin/domains/${domain._id}`)}
            >
              <CardContent className="p-5">
                {/* HEADER */}

                <div className="flex items-start gap-3">
                  {/* DOMAIN COLOR */}

                  <div
                    className="
                                                    w-10
                                                    h-10
                                                    rounded-lg
                                                    border
                                                    shrink-0
                                                "
                    style={{
                      backgroundColor: domain.color,
                    }}
                  />

                  <div className="flex-1 min-w-0">
                    {/* DOMAIN NAME */}

                    <h2 className="font-semibold truncate">{domain.name}</h2>

                    {/* STATUS */}

                    <div className="flex items-center gap-1.5 mt-1">
                      <Circle
                        size={8}
                        fill="currentColor"
                        className={
                          domain.isActive
                            ? "text-green-500"
                            : "text-muted-foreground"
                        }
                      />

                      <span className="text-xs text-muted-foreground">
                        {domain.isActive ? "Active" : "Inactive"}
                      </span>
                    </div>
                  </div>
                </div>

                {/* DESCRIPTION */}

                <p className="mt-4 text-sm leading-relaxed line-clamp-2 text-muted-foreground">
                  {domain.description || "No description added."}
                </p>

                {/* VIEW */}

                <div
                  className="
                                                flex
                                                items-center
                                                gap-1
                                                mt-5
                                                text-sm
                                                font-medium
                                                text-muted-foreground
                                                transition-colors
                                                group-hover:text-primary
                                            "
                >
                  View Details
                  <ArrowRight
                    size={16}
                    className="
                                                    transition-transform
                                                    group-hover:translate-x-1
                                                "
                  />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
