"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { cisApi } from "@/lib/api/cis";
import { PageHeader } from "@/components/shared/PageHeader";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input, Label, Select, Textarea } from "@/components/ui/Input";
import { ErrorState } from "@/components/shared/LoadingState";
import { ApiError } from "@/lib/api/client";

export default function NewCIPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [ciType, setCiType] = useState("other");
  const [status, setStatus] = useState("in_use");
  const [serialNumber, setSerialNumber] = useState("");
  const [location, setLocation] = useState("");
  const [description, setDescription] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      const ci = await cisApi.create({
        name,
        ci_type: ciType,
        status,
        serial_number: serialNumber || null,
        location: location || null,
        description: description || null,
      });
      router.push(`/cis/${ci.id}`);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Failed to create CI");
      setSubmitting(false);
    }
  }

  return (
    <div className="max-w-2xl">
      <PageHeader title="New Configuration Item" />
      <Card className="p-6">
        {error && (
          <div className="mb-4">
            <ErrorState message={error} />
          </div>
        )}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label>Name</Label>
            <Input required value={name} onChange={(e) => setName(e.target.value)} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Type</Label>
              <Select value={ciType} onChange={(e) => setCiType(e.target.value)}>
                <option value="hardware">Hardware</option>
                <option value="software">Software</option>
                <option value="server">Server</option>
                <option value="network_device">Network Device</option>
                <option value="application">Application</option>
                <option value="other">Other</option>
              </Select>
            </div>
            <div>
              <Label>Status</Label>
              <Select value={status} onChange={(e) => setStatus(e.target.value)}>
                <option value="in_use">In Use</option>
                <option value="in_stock">In Stock</option>
                <option value="retired">Retired</option>
                <option value="under_maintenance">Under Maintenance</option>
              </Select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Serial number</Label>
              <Input value={serialNumber} onChange={(e) => setSerialNumber(e.target.value)} />
            </div>
            <div>
              <Label>Location</Label>
              <Input value={location} onChange={(e) => setLocation(e.target.value)} />
            </div>
          </div>
          <div>
            <Label>Description</Label>
            <Textarea rows={3} value={description} onChange={(e) => setDescription(e.target.value)} />
          </div>
          <div className="flex gap-2 pt-2">
            <Button type="submit" disabled={submitting}>
              {submitting ? "Creating…" : "Create CI"}
            </Button>
            <Button type="button" variant="secondary" onClick={() => router.back()}>
              Cancel
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
