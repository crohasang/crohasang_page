import { getActor, getCollection, getTimeline, getFollowingList, getFollowersList } from './_lib/api';
import { ProfileHeader } from './_components/ProfileHeader';
import { FollowLists } from './_components/FollowLists';
import { TimelineFeed } from './_components/TimelineFeed';

export default async function FediversePage() {
  const actor = await getActor();
  const [followersCollection, followingCollection, timeline, followingList, followersList] =
    await Promise.all([
      getCollection(actor.followers),
      getCollection(actor.following),
      getTimeline(50),
      getFollowingList('accepted'),
      getFollowersList('accepted'),
    ]);

  const followersCount = followersCollection?.totalItems ?? 0;
  const followingCount = followingCollection?.totalItems ?? 0;

  return (
    <div className="min-h-screen py-16 px-4">
      <div className="max-w-3xl mx-auto">
        <ProfileHeader actor={actor} followingCount={followingCount} followersCount={followersCount} />

        <hr className="border-gray-200 mb-8" />

        <FollowLists followingList={followingList} followersList={followersList} />

        <TimelineFeed timeline={timeline} />
      </div>
    </div>
  );
}
