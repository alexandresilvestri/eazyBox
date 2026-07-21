import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export function App() {
  const [message, setMessage] = useState("");

  const callApi = async () => {
    const response = await fetch("/api/hello");
    const data = await response.json();
    setMessage(data.message);
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-background">
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle>Eazybox</CardTitle>
          <CardDescription>
            Bun + Express + React + Tailwind + shadcn/ui
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <Button onClick={callApi}>Call API</Button>
          {message && (
            <p className="text-sm text-muted-foreground">{message}</p>
          )}
        </CardContent>
      </Card>
    </main>
  );
}
