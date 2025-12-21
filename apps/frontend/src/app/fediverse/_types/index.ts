export type Actor = {
  id: string;
  type: string;
  name?: string;
  preferredUsername?: string;
  summary?: string;
  inbox?: string;
  outbox?: string;
  followers?: string;
  following?: string;
  published?: string;
  url?: string;
};

export type Collection = {
  totalItems?: number;
  items?: unknown[];
  orderedItems?: unknown[];
  first?: unknown;
};

export type TimelineItem = {
  id: number;
  activity_id: string;
  type: string;
  actor_id: string;
  object_id?: string;
  created_at: string;
  actor: {
    id: string;
    username?: string;
    display_name?: string;
    url?: string;
    type: string;
  } | null;
  raw_data: {
    type: string;
    actor?: string;
    object?: {
      type: string;
      content?: string;
      contentMap?: Record<string, string>;
      published?: string;
      attachment?: unknown[];
    };
  };
};

export type FollowRelation = {
  id: number;
  follower_id: string;
  following_id: string;
  status: string;
  created_at: string;
  updated_at: string;
  follower?: {
    id: string;
    username?: string;
    display_name?: string;
    url?: string;
    type: string;
  };
  following?: {
    id: string;
    username?: string;
    display_name?: string;
    url?: string;
    type: string;
  };
};
