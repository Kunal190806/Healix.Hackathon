"use client";

import { useState } from "react";
import useLocalStorage from "@/hooks/use-local-storage";
import type { JournalEntry } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { format } from "date-fns";
import { BookHeart, Trash2 } from "lucide-react";

export default function MentalHealthJournal() {
  const [entries, setEntries] = useLocalStorage<JournalEntry[]>("journalEntries", []);
  const [newEntry, setNewEntry] = useState("");

  const handleSaveEntry = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEntry.trim()) return;
    const entry: JournalEntry = {
      id: crypto.randomUUID(),
      content: newEntry,
      date: new Date().toISOString(),
    };
    setEntries([entry, ...entries]);
    setNewEntry("");
  };
  
  const handleDeleteEntry = (id: string) => {
    setEntries(entries.filter((entry) => entry.id !== id));
  };

  return (
    <div className="grid gap-6 lg:grid-cols-5">
      <div className="lg:col-span-2">
        <Card>
          <CardHeader>
            <CardTitle>New Journal Entry</CardTitle>
            <CardDescription>How are you feeling today?</CardDescription>
          </CardHeader>
          <form onSubmit={handleSaveEntry}>
            <CardContent>
              <Textarea
                value={newEntry}
                onChange={(e) => setNewEntry(e.target.value)}
                placeholder="Write down your thoughts and feelings..."
                rows={10}
              />
            </CardContent>
            <CardFooter>
              <Button type="submit">Save Entry</Button>
            </CardFooter>
          </form>
        </Card>
      </div>

      <div className="lg:col-span-3">
        <Card>
          <CardHeader>
            <CardTitle>Your Past Entries</CardTitle>
            <CardDescription>Review your journal history.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {entries.length > 0 ? (
              entries.map(entry => (
                <Card key={entry.id} className="relative">
                  <CardHeader>
                    <CardTitle className="text-base">{format(new Date(entry.date), "PPP")}</CardTitle>
                    <CardDescription>{format(new Date(entry.date), "p")}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-foreground/80 whitespace-pre-wrap">{entry.content}</p>
                  </CardContent>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute top-2 right-2"
                    onClick={() => handleDeleteEntry(entry.id)}
                  >
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </Card>
              ))
            ) : (
              <div className="flex flex-col items-center justify-center rounded-lg border border-dashed p-12">
                <div className="text-center text-muted-foreground">
                  <BookHeart className="mx-auto h-12 w-12" />
                  <p className="mt-4 font-semibold">No entries yet.</p>
                  <p className="mt-1 text-sm">Start by writing your first journal entry.</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
