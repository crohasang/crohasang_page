import type { Actor, Collection, FollowRelation, TimelineItem } from '../_types';

export async function getActor(): Promise<Actor> {
  const res = await fetch(`https://crohasang.com/users/crohasang`, {
    cache: 'no-store',
    headers: {
      Accept: 'application/activity+json',
    },
  });

  if (!res.ok) {
    throw new Error('Failed to fetch actor');
  }

  return res.json();
}

export async function getCollection(url?: string): Promise<Collection | null> {
  if (!url) {
    return null;
  }

  const res = await fetch(url, {
    cache: 'no-store',
    headers: {
      Accept: 'application/activity+json',
    },
  });

  if (!res.ok) {
    return null;
  }

  return res.json();
}

export async function getTimeline(limit: number = 50): Promise<TimelineItem[]> {
  try {
    const res = await fetch(`https://crohasang.com/fedify/timeline?limit=${limit}`, {
      cache: 'no-store',
      headers: {
        Accept: 'application/json',
      },
    });

    if (!res.ok) {
      console.error('Failed to fetch timeline:', res.status, res.statusText);
      return [];
    }

    return res.json();
  } catch (error) {
    console.error('Error fetching timeline:', error);
    return [];
  }
}

export async function getFollowingList(status?: string): Promise<FollowRelation[]> {
  try {
    const url = status
      ? `https://crohasang.com/fedify/following?status=${status}`
      : 'https://crohasang.com/fedify/following';

    const res = await fetch(url, {
      cache: 'no-store',
      headers: {
        Accept: 'application/json',
      },
    });

    if (!res.ok) {
      console.error('Failed to fetch following list:', res.status, res.statusText);
      return [];
    }

    return res.json();
  } catch (error) {
    console.error('Error fetching following list:', error);
    return [];
  }
}

export async function getFollowersList(status?: string): Promise<FollowRelation[]> {
  try {
    const url = status
      ? `https://crohasang.com/fedify/followers?status=${status}`
      : 'https://crohasang.com/fedify/followers';

    const res = await fetch(url, {
      cache: 'no-store',
      headers: {
        Accept: 'application/json',
      },
    });

    if (!res.ok) {
      console.error('Failed to fetch followers list:', res.status, res.statusText);
      return [];
    }

    return res.json();
  } catch (error) {
    console.error('Error fetching followers list:', error);
    return [];
  }
}
