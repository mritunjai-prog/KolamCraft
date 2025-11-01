import { getSupabase, isSupabaseConfigured } from "./supabase/client";

export type Complexity = "Beginner" | "Intermediate" | "Advanced";

export interface Post {
  id: string;
  user_id: string;
  title: string;
  image_url: string;
  likes_count: number;
  comments_count: number;
  created_at: string;
  complexity?: Complexity;
  grid_type?: string;
  tags?: string[];
  is_liked?: boolean;
  is_saved?: boolean;
}

export interface Comment {
  id: string;
  post_id: string;
  user_id: string;
  text: string;
  created_at: string;
}

const BC_CHANNEL = "kolamcraft-realtime";

// Simple BroadcastChannel fallback for realtime in local mode
const bc: BroadcastChannel | null =
  typeof window !== "undefined" && "BroadcastChannel" in window
    ? new BroadcastChannel(BC_CHANNEL)
    : null;

const mockKey = (k: string) => `kolamcraft_${k}`;

// Local mock helpers
const mock = {
  list: (): Post[] => {
    try {
      return JSON.parse(localStorage.getItem(mockKey("posts")) || "[]");
    } catch {
      return [];
    }
  },
  saveAll: (posts: Post[]) =>
    localStorage.setItem(mockKey("posts"), JSON.stringify(posts)),
  comments: (postId: string): Comment[] => {
    try {
      return JSON.parse(
        localStorage.getItem(mockKey(`comments_${postId}`)) || "[]"
      );
    } catch {
      return [];
    }
  },
  saveComments: (postId: string, comments: Comment[]) =>
    localStorage.setItem(
      mockKey(`comments_${postId}`),
      JSON.stringify(comments)
    ),
};

export const uploadImage = async (
  file: Blob,
  userId: string
): Promise<string> => {
  if (!isSupabaseConfigured) {
    // Use data URL in local mode
    const reader = new FileReader();
    const url: string = await new Promise((resolve) => {
      reader.onload = () => resolve(String(reader.result));
      reader.readAsDataURL(file);
    });
    return url;
  }
  const supabase = getSupabase();
  const path = `${userId}/${Date.now()}.png`;
  const { error } = await supabase.storage
    .from("kolams")
    .upload(path, file, { upsert: true, contentType: "image/png" });
  if (error) throw error;
  const { data: pub } = supabase.storage.from("kolams").getPublicUrl(path);
  return pub.publicUrl;
};

export const createPost = async (
  post: Omit<Post, "id" | "likes_count" | "comments_count" | "created_at">
): Promise<Post> => {
  if (!isSupabaseConfigured) {
    const list = mock.list();
    const newPost: Post = {
      id: crypto.randomUUID(),
      created_at: new Date().toISOString(),
      likes_count: 0,
      comments_count: 0,
      ...post,
    };
    list.unshift(newPost);
    mock.saveAll(list);
    bc?.postMessage({ type: "insert", post: newPost });
    return newPost;
  }
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from("posts")
    .insert({
      user_id: post.user_id,
      title: post.title,
      image_url: post.image_url,
      complexity: post.complexity,
      grid_type: post.grid_type,
      tags: post.tags || [],
    })
    .select()
    .single();
  if (error) throw error;
  return data as unknown as Post;
};

export const listPosts = async (): Promise<Post[]> => {
  if (!isSupabaseConfigured) {
    const list = mock.list();
    return list;
  }
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from("posts")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data || []) as unknown as Post[];
};

export const likePost = async (
  postId: string,
  userId: string,
  like: boolean
): Promise<void> => {
  if (!userId) return;
  if (!isSupabaseConfigured) {
    const list = mock.list();
    const idx = list.findIndex((p) => p.id === postId);
    if (idx >= 0) {
      list[idx].likes_count = Math.max(
        0,
        list[idx].likes_count + (like ? 1 : -1)
      );
      mock.saveAll(list);
      bc?.postMessage({ type: "update", post: list[idx] });
    }
    return;
  }
  const supabase = getSupabase();
  if (like) {
    const { error } = await supabase
      .from("likes")
      .insert({ post_id: postId, user_id: userId });
    if (error && error.code !== "23505") throw error; // ignore duplicate
  } else {
    const { error } = await supabase
      .from("likes")
      .delete()
      .eq("post_id", postId)
      .eq("user_id", userId);
    if (error) throw error;
  }
};

export const addComment = async (
  postId: string,
  userId: string,
  text: string
): Promise<Comment> => {
  if (!userId) throw new Error("Not authenticated");
  if (!isSupabaseConfigured) {
    const list = mock.list();
    const idx = list.findIndex((p) => p.id === postId);
    const newComment: Comment = {
      id: crypto.randomUUID(),
      post_id: postId,
      user_id: userId,
      text,
      created_at: new Date().toISOString(),
    };
    const comments = mock.comments(postId);
    comments.push(newComment);
    mock.saveComments(postId, comments);
    if (idx >= 0) {
      list[idx].comments_count += 1;
      mock.saveAll(list);
      bc?.postMessage({ type: "update", post: list[idx] });
    }
    return newComment;
  }
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from("comments")
    .insert({ post_id: postId, user_id: userId, text })
    .select()
    .single();
  if (error) throw error;
  return data as unknown as Comment;
};

export const listComments = async (postId: string): Promise<Comment[]> => {
  if (!isSupabaseConfigured) return mock.comments(postId);
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from("comments")
    .select("*")
    .eq("post_id", postId)
    .order("created_at", { ascending: true });
  if (error) throw error;
  return (data || []) as unknown as Comment[];
};

export const subscribePosts = (
  onChange: (type: "insert" | "update" | "delete", post?: Post) => void
): (() => void) => {
  if (!isSupabaseConfigured) {
    const handler = (e: MessageEvent) => {
      const { type, post } = e.data || {};
      if (type) onChange(type, post);
    };
    bc?.addEventListener("message", handler);
    return () => bc?.removeEventListener("message", handler);
  }
  const supabase = getSupabase();
  const channel = supabase
    .channel("posts-changes")
    .on(
      "postgres_changes",
      { event: "*", schema: "public", table: "posts" },
      (payload) => {
        if (payload.eventType === "INSERT")
          onChange("insert", payload.new as Post);
        else if (payload.eventType === "UPDATE")
          onChange("update", payload.new as Post);
        else if (payload.eventType === "DELETE") onChange("delete");
      }
    )
    .subscribe();
  return () => {
    supabase.removeChannel(channel);
  };
};
