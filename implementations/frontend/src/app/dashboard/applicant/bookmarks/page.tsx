'use client';

import { JobCard } from '@/components/jobs/JobCard';
import { Spinner } from '@/components/ui/Spinner';
import { useBookmarks } from '@/hooks/useBookmarks';

export default function BookmarksPage() {
  const { bookmarks, isLoading, error, removeBookmark } = useBookmarks();

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Saved Jobs</h1>
        <p className="text-gray-500 text-sm">Jobs you&apos;ve bookmarked for later</p>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-16"><Spinner size="lg" /></div>
      ) : error ? (
        <div className="text-center py-8 text-red-500">{error}</div>
      ) : bookmarks.length === 0 ? (
        <div className="text-center py-16 text-gray-400">No saved jobs yet. Bookmark jobs while browsing!</div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {bookmarks.map((bookmark) => (
            bookmark.job && <JobCard key={bookmark.id} job={bookmark.job} />
          ))}
        </div>
      )}
    </div>
  );
}
