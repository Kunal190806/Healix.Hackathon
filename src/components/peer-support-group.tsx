"use client";

import { useState } from "react";
import useLocalStorage from "@/hooks/use-local-storage";
import type { SupportPost } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { format } from 'date-fns';
import { Users } from "lucide-react";

export default function PeerSupportGroup() {
  const [posts, setPosts] = useLocalStorage<SupportPost[]>("supportPosts", []);
  const [newPost, setNewPost] = useState("");

  const handlePost = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPost.trim()) return;
    const post: SupportPost = {
      id: crypto.randomUUID(),
      content: newPost,
      date: new Date().toISOString(),
      author: `User-${crypto.randomUUID().slice(0, 4)}`, // Simple anonymous author
    };
    setPosts([post, ...posts]);
    setNewPost("");
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Share Your Thoughts</CardTitle>
          <CardDescription>Post anonymously to the group. Your message will be visible to everyone.</CardDescription>
        </CardHeader>
        <form onSubmit={handlePost}>
          <CardContent>
            <Textarea
              value={newPost}
              onChange={(e) => setNewPost(e.target.value)}
              placeholder="What's on your mind?"
              rows={4}
            />
          </CardContent>
          <CardFooter>
            <Button type="submit">Post Anonymously</Button>
          </CardFooter>
        </form>
      </Card>
      <div className="space-y-4">
        <h2 className="text-2xl font-headline font-semibold">Community Feed</h2>
        {posts.length > 0 ? (
          posts.map(post => (
            <Card key={post.id}>
              <CardContent className="pt-6">
                <p>{post.content}</p>
              </CardContent>
              <CardFooter className="text-sm text-muted-foreground">
                <p>Posted by {post.author} on {format(new Date(post.date), "PPP 'at' p")}</p>
              </CardFooter>
            </Card>
          ))
        ) : (
          <div className="flex flex-col items-center justify-center rounded-lg border border-dashed p-12">
            <div className="text-center text-muted-foreground">
              <Users className="mx-auto h-12 w-12" />
              <p className="mt-4 font-semibold">The feed is empty.</p>
              <p className="mt-1 text-sm">Be the first to share something!</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
