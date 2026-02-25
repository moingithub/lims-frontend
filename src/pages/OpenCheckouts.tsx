import React, { useEffect, useState } from "react";
import {
  openCheckoutsService,
  OpenCheckout,
} from "../services/openCheckoutsService";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "../components/ui/card";
import { SearchBar } from "../components/shared/SearchBar";
import { OpenCheckoutsTable } from "../components/openCheckouts/OpenCheckoutsTable";

export default function OpenCheckouts() {
  const [data, setData] = useState<OpenCheckout[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    openCheckoutsService
      .fetchOpenCheckouts()
      .then(setData)
      .catch((err) => setError(err.message || "Failed to load open checkouts"))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="font-bold">Open Cylinder Checkouts</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex justify-between items-center mb-4">
            <SearchBar
              value={searchTerm}
              onChange={setSearchTerm}
              placeholder="Search checkouts..."
            />
          </div>
          {loading && <div>Loading...</div>}
          {error && <div className="text-red-500 mb-4">{error}</div>}
          {!loading && !error && (
            <OpenCheckoutsTable checkouts={data} searchTerm={searchTerm} />
          )}
          <div className="mt-4 text-sm text-muted-foreground">
            Showing {data.length} open checkouts
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
