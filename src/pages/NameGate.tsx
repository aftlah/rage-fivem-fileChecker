import { useState, type FormEvent, type ReactElement } from "react";
import { ScanSearch } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useSettings } from "@/hooks/useSettings";

export function NameGate(): ReactElement {
  const { setOperatorName } = useSettings();
  const [name, setName] = useState("");
  const [error, setError] = useState<string | null>(null);

  function handleSubmit(event: FormEvent<HTMLFormElement>): void {
    event.preventDefault();
    const trimmed = name.trim();
    if (trimmed.length < 2) {
      setError("Enter a name in character with at least 2 characters.");
      return;
    }
    setOperatorName(trimmed);
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-6 text-foreground">
      <Card className="w-full max-w-md">
        <CardHeader>
          <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg border border-border bg-muted">
            <ScanSearch className="h-5 w-5 text-info" />
          </div>
          <CardTitle>name in character</CardTitle>
          <CardDescription>
            This character name is attached to every scan result sent to Discord.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form className="cursor-text space-y-4" onSubmit={handleSubmit}>
            <Input
              autoFocus
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder="name in character"
              maxLength={40}
            />
            {error ? <p className="text-sm text-destructive">{error}</p> : null}
            <Button type="submit" className="w-full">
              Continue
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
