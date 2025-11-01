import React, { useEffect, useState } from "react";
import { addComment, listComments, Comment } from "../utils/dataStore";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Card, CardContent } from "./ui/card";
import { ScrollArea } from "./ui/scroll-area";
import { toast } from "sonner";

interface Props {
  postId: string;
  currentUserId?: string;
  open: boolean;
  onClose: () => void;
}

const CommentsDrawer: React.FC<Props> = ({
  postId,
  currentUserId,
  open,
  onClose,
}) => {
  const [comments, setComments] = useState<Comment[]>([]);
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!open) return;
    let alive = true;
    (async () => {
      try {
        const list = await listComments(postId);
        if (alive) setComments(list);
      } catch (e: any) {
        toast.error(e.message || "Failed to load comments");
      }
    })();
    return () => {
      alive = false;
    };
  }, [open, postId]);

  const submit = async () => {
    if (!text.trim()) return;
    if (!currentUserId) {
      toast.error("Please login to comment");
      return;
    }
    setLoading(true);
    try {
      const c = await addComment(postId, currentUserId, text.trim());
      setComments((prev) => [...prev, c]);
      setText("");
    } catch (e: any) {
      toast.error(e.message || "Failed to comment");
    } finally {
      setLoading(false);
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black/40 z-50" onClick={onClose}>
      <div
        className="absolute right-0 top-0 h-full w-full sm:w-[420px] bg-white shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-4 border-b flex items-center justify-between">
          <h3>Comments</h3>
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
        </div>
        <ScrollArea className="h-[calc(100%-140px)] p-4">
          <div className="space-y-3">
            {comments.map((c) => (
              <Card key={c.id}>
                <CardContent className="p-3">
                  <div className="text-xs text-gray-500 mb-1">
                    {new Date(c.created_at).toLocaleString()}
                  </div>
                  <div className="text-sm">{c.text}</div>
                </CardContent>
              </Card>
            ))}
            {comments.length === 0 && (
              <div className="text-sm text-gray-500">
                No comments yet. Be the first!
              </div>
            )}
          </div>
        </ScrollArea>
        <div className="p-4 border-t space-y-2">
          <Input
            placeholder="Write a comment..."
            value={text}
            onChange={(e) => setText(e.target.value)}
          />
          <Button disabled={loading} onClick={submit} className="w-full">
            Post Comment
          </Button>
        </div>
      </div>
    </div>
  );
};

export default CommentsDrawer;
