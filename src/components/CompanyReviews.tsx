'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import {
  Star,
  ThumbsUp,
  ThumbsDown,
  ChevronDown,
  MessageSquare,
  Building2,
  Calendar,
  MapPin,
  Briefcase,
  TrendingUp,
  Users,
  Shield,
  DollarSign,
  Heart,
  Loader2,
  AlertCircle,
} from 'lucide-react';

interface Review {
  id: string;
  reviewType: string;
  overallRating: number;
  workLifeBalance: number | null;
  compensation: number | null;
  jobSecurity: number | null;
  management: number | null;
  culture: number | null;
  careerGrowth: number | null;
  title: string;
  pros: string;
  cons: string;
  advice: string | null;
  jobTitle: string | null;
  department: string | null;
  employmentStatus: string | null;
  employmentType: string | null;
  yearsAtCompany: number | null;
  location: string | null;
  helpfulCount: number;
  notHelpfulCount: number;
  employerResponse: string | null;
  employerRespondedAt: string | null;
  createdAt: string;
}

interface ReviewSummary {
  totalReviews: number;
  averageRating: number;
  ratings: {
    workLifeBalance: number;
    compensation: number;
    jobSecurity: number;
    management: number;
    culture: number;
    careerGrowth: number;
  };
  distribution: {
    5: number;
    4: number;
    3: number;
    2: number;
    1: number;
  };
}

interface CompanyReviewsProps {
  tenantId: string;
  companyName: string;
}

const reviewTypeLabels: Record<string, string> = {
  employee: 'Current Employee',
  former_employee: 'Former Employee',
  interviewed: 'Interviewed',
  applicant: 'Applicant',
};

const sortOptions = [
  { value: 'recent', label: 'Most Recent' },
  { value: 'helpful', label: 'Most Helpful' },
  { value: 'rating_high', label: 'Highest Rated' },
  { value: 'rating_low', label: 'Lowest Rated' },
];

export default function CompanyReviews({ tenantId, companyName }: CompanyReviewsProps) {
  const { user, isLoggedIn } = useAuth();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [summary, setSummary] = useState<ReviewSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState('recent');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [showWriteReview, setShowWriteReview] = useState(false);
  const [voting, setVoting] = useState<string | null>(null);
  const [userVotes, setUserVotes] = useState<Record<string, 'helpful' | 'not_helpful' | null>>({});

  // Fetch reviews
  useEffect(() => {
    async function fetchReviews() {
      setLoading(true);
      try {
        const response = await fetch(
          `/api/reviews?tenantId=${tenantId}&page=${page}&limit=10&sortBy=${sortBy}`
        );
        if (response.ok) {
          const data = await response.json();
          setReviews(data.reviews || []);
          setSummary(data.summary || null);
          setTotalPages(data.pagination?.totalPages || 1);
        }
      } catch (err) {
        console.error('Error fetching reviews:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchReviews();
  }, [tenantId, page, sortBy]);

  // Handle vote
  const handleVote = async (reviewId: string, action: 'helpful' | 'not_helpful') => {
    if (!isLoggedIn || !user?.id) {
      alert('Please log in to vote on reviews');
      return;
    }

    setVoting(reviewId);
    try {
      const response = await fetch(`/api/reviews/${reviewId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': user.id,
        },
        body: JSON.stringify({ action }),
      });

      if (response.ok) {
        const data = await response.json();
        setUserVotes(prev => ({ ...prev, [reviewId]: data.voted }));

        // Update review counts locally
        setReviews(prev => prev.map(r => {
          if (r.id === reviewId) {
            const oldVote = userVotes[reviewId];
            let helpfulDelta = 0;
            let notHelpfulDelta = 0;

            if (data.voted === null) {
              // Removed vote
              if (oldVote === 'helpful') helpfulDelta = -1;
              if (oldVote === 'not_helpful') notHelpfulDelta = -1;
            } else if (data.voted === 'helpful') {
              helpfulDelta = 1;
              if (oldVote === 'not_helpful') notHelpfulDelta = -1;
            } else {
              notHelpfulDelta = 1;
              if (oldVote === 'helpful') helpfulDelta = -1;
            }

            return {
              ...r,
              helpfulCount: r.helpfulCount + helpfulDelta,
              notHelpfulCount: r.notHelpfulCount + notHelpfulDelta,
            };
          }
          return r;
        }));
      }
    } catch (err) {
      console.error('Error voting:', err);
    } finally {
      setVoting(null);
    }
  };

  // Render star rating
  const renderStars = (rating: number, size: 'sm' | 'md' = 'sm') => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;
    const sizeClass = size === 'sm' ? 'w-4 h-4' : 'w-5 h-5';

    for (let i = 0; i < 5; i++) {
      if (i < fullStars) {
        stars.push(
          <Star key={i} className={`${sizeClass} fill-yellow-400 text-yellow-400`} />
        );
      } else if (i === fullStars && hasHalfStar) {
        stars.push(
          <Star key={i} className={`${sizeClass} fill-yellow-400/50 text-yellow-400`} />
        );
      } else {
        stars.push(
          <Star key={i} className={`${sizeClass} text-slate-300`} />
        );
      }
    }
    return stars;
  };

  // Format date
  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    });
  };

  // Rating bar component
  const RatingBar = ({ label, value, icon: Icon }: { label: string; value: number; icon: React.ElementType }) => (
    <div className="flex items-center gap-3">
      <Icon className="w-4 h-4 text-slate-400" />
      <span className="text-sm text-slate-600 w-28">{label}</span>
      <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
        <div
          className="h-full bg-blue-500 rounded-full transition-all"
          style={{ width: `${(value / 5) * 100}%` }}
        />
      </div>
      <span className="text-sm font-medium text-slate-900 w-8">{value.toFixed(1)}</span>
    </div>
  );

  if (loading && reviews.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-slate-200 p-8">
        <div className="flex items-center justify-center gap-3 text-slate-500">
          <Loader2 className="w-5 h-5 animate-spin" />
          Loading reviews...
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Summary Section */}
      {summary && summary.totalReviews > 0 && (
        <div className="bg-white rounded-xl border border-slate-200 p-6">
          <div className="grid md:grid-cols-2 gap-8">
            {/* Overall Rating */}
            <div>
              <h3 className="text-lg font-semibold text-slate-900 mb-4">Overall Rating</h3>
              <div className="flex items-center gap-4 mb-4">
                <span className="text-5xl font-bold text-slate-900">
                  {summary.averageRating.toFixed(1)}
                </span>
                <div>
                  <div className="flex items-center gap-1 mb-1">
                    {renderStars(summary.averageRating, 'md')}
                  </div>
                  <p className="text-sm text-slate-500">
                    Based on {summary.totalReviews} review{summary.totalReviews !== 1 ? 's' : ''}
                  </p>
                </div>
              </div>

              {/* Rating Distribution */}
              <div className="space-y-2">
                {[5, 4, 3, 2, 1].map(rating => {
                  const count = summary.distribution[rating as keyof typeof summary.distribution];
                  const percentage = summary.totalReviews > 0 ? (count / summary.totalReviews) * 100 : 0;
                  return (
                    <div key={rating} className="flex items-center gap-2">
                      <span className="text-sm text-slate-600 w-6">{rating}</span>
                      <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                      <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-yellow-400 rounded-full transition-all"
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                      <span className="text-sm text-slate-500 w-8">{count}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Category Ratings */}
            <div>
              <h3 className="text-lg font-semibold text-slate-900 mb-4">Ratings by Category</h3>
              <div className="space-y-3">
                <RatingBar label="Work-Life Balance" value={summary.ratings.workLifeBalance} icon={Heart} />
                <RatingBar label="Compensation" value={summary.ratings.compensation} icon={DollarSign} />
                <RatingBar label="Job Security" value={summary.ratings.jobSecurity} icon={Shield} />
                <RatingBar label="Management" value={summary.ratings.management} icon={Users} />
                <RatingBar label="Culture" value={summary.ratings.culture} icon={Building2} />
                <RatingBar label="Career Growth" value={summary.ratings.careerGrowth} icon={TrendingUp} />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Reviews List Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-slate-900">
          {summary?.totalReviews || 0} Review{summary?.totalReviews !== 1 ? 's' : ''}
        </h3>
        <div className="flex items-center gap-4">
          {/* Sort Dropdown */}
          <div className="relative">
            <select
              value={sortBy}
              onChange={e => {
                setSortBy(e.target.value);
                setPage(1);
              }}
              className="appearance-none pl-4 pr-10 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
            >
              {sortOptions.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
          </div>

          {/* Write Review Button */}
          {isLoggedIn && (
            <button
              onClick={() => setShowWriteReview(true)}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
            >
              Write a Review
            </button>
          )}
        </div>
      </div>

      {/* Reviews List */}
      {reviews.length === 0 ? (
        <div className="bg-white rounded-xl border border-slate-200 p-12 text-center">
          <MessageSquare className="w-12 h-12 text-slate-300 mx-auto mb-4" />
          <h3 className="font-medium text-slate-900 mb-2">No reviews yet</h3>
          <p className="text-slate-500 text-sm mb-4">
            Be the first to share your experience at {companyName}
          </p>
          {isLoggedIn ? (
            <button
              onClick={() => setShowWriteReview(true)}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
            >
              Write a Review
            </button>
          ) : (
            <p className="text-sm text-slate-400">Log in to write a review</p>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {reviews.map(review => (
            <div key={review.id} className="bg-white rounded-xl border border-slate-200 p-6">
              {/* Review Header */}
              <div className="flex items-start justify-between gap-4 mb-4">
                <div>
                  <h4 className="font-semibold text-slate-900 text-lg">{review.title}</h4>
                  <div className="flex items-center gap-3 mt-1 text-sm text-slate-500">
                    <span className="flex items-center gap-1">
                      {renderStars(review.overallRating)}
                      <span className="ml-1 font-medium text-slate-700">
                        {review.overallRating.toFixed(1)}
                      </span>
                    </span>
                    <span>•</span>
                    <span>{reviewTypeLabels[review.reviewType] || review.reviewType}</span>
                    {review.jobTitle && (
                      <>
                        <span>•</span>
                        <span>{review.jobTitle}</span>
                      </>
                    )}
                  </div>
                </div>
                <span className="text-sm text-slate-400">{formatDate(review.createdAt)}</span>
              </div>

              {/* Review Meta */}
              <div className="flex flex-wrap gap-3 mb-4 text-sm text-slate-500">
                {review.location && (
                  <span className="flex items-center gap-1">
                    <MapPin className="w-4 h-4" />
                    {review.location}
                  </span>
                )}
                {review.employmentType && (
                  <span className="flex items-center gap-1">
                    <Briefcase className="w-4 h-4" />
                    {review.employmentType}
                  </span>
                )}
                {review.yearsAtCompany && (
                  <span className="flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    {review.yearsAtCompany} year{review.yearsAtCompany !== 1 ? 's' : ''} at company
                  </span>
                )}
              </div>

              {/* Pros */}
              <div className="mb-4">
                <h5 className="text-sm font-medium text-green-700 mb-1">Pros</h5>
                <p className="text-slate-700">{review.pros}</p>
              </div>

              {/* Cons */}
              <div className="mb-4">
                <h5 className="text-sm font-medium text-red-700 mb-1">Cons</h5>
                <p className="text-slate-700">{review.cons}</p>
              </div>

              {/* Advice */}
              {review.advice && (
                <div className="mb-4">
                  <h5 className="text-sm font-medium text-blue-700 mb-1">Advice to Management</h5>
                  <p className="text-slate-700">{review.advice}</p>
                </div>
              )}

              {/* Employer Response */}
              {review.employerResponse && (
                <div className="mt-4 p-4 bg-slate-50 rounded-lg border border-slate-200">
                  <div className="flex items-center gap-2 mb-2">
                    <Building2 className="w-4 h-4 text-blue-600" />
                    <span className="text-sm font-medium text-slate-900">Employer Response</span>
                    {review.employerRespondedAt && (
                      <span className="text-xs text-slate-400">
                        • {formatDate(review.employerRespondedAt)}
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-slate-700">{review.employerResponse}</p>
                </div>
              )}

              {/* Helpful Votes */}
              <div className="flex items-center gap-4 mt-4 pt-4 border-t border-slate-100">
                <span className="text-sm text-slate-500">Was this review helpful?</span>
                <button
                  onClick={() => handleVote(review.id, 'helpful')}
                  disabled={voting === review.id}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm transition-colors ${
                    userVotes[review.id] === 'helpful'
                      ? 'bg-green-100 text-green-700'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  <ThumbsUp className="w-4 h-4" />
                  <span>{review.helpfulCount}</span>
                </button>
                <button
                  onClick={() => handleVote(review.id, 'not_helpful')}
                  disabled={voting === review.id}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm transition-colors ${
                    userVotes[review.id] === 'not_helpful'
                      ? 'bg-red-100 text-red-700'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  <ThumbsDown className="w-4 h-4" />
                  <span>{review.notHelpfulCount}</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <button
            onClick={() => setPage(p => Math.max(1, p - 1))}
            disabled={page === 1}
            className="px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-lg disabled:opacity-50"
          >
            Previous
          </button>
          <span className="text-sm text-slate-600">
            Page {page} of {totalPages}
          </span>
          <button
            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            className="px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-lg disabled:opacity-50"
          >
            Next
          </button>
        </div>
      )}

      {/* Write Review Modal - You can expand this into a full form */}
      {showWriteReview && (
        <WriteReviewModal
          tenantId={tenantId}
          companyName={companyName}
          onClose={() => setShowWriteReview(false)}
          onSuccess={() => {
            setShowWriteReview(false);
            setPage(1);
            setSortBy('recent');
          }}
        />
      )}
    </div>
  );
}

// Write Review Modal Component
function WriteReviewModal({
  tenantId,
  companyName,
  onClose,
  onSuccess,
}: {
  tenantId: string;
  companyName: string;
  onClose: () => void;
  onSuccess: () => void;
}) {
  const { user } = useAuth();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    reviewType: 'employee',
    overallRating: 0,
    workLifeBalance: 0,
    compensation: 0,
    jobSecurity: 0,
    management: 0,
    culture: 0,
    careerGrowth: 0,
    title: '',
    pros: '',
    cons: '',
    advice: '',
    jobTitle: '',
    department: '',
    employmentStatus: 'current',
    employmentType: 'full-time',
    yearsAtCompany: '',
    location: '',
  });

  const handleSubmit = async () => {
    if (!user?.id) return;

    if (!formData.overallRating || !formData.title || !formData.pros || !formData.cons) {
      setError('Please fill in all required fields');
      return;
    }

    setSubmitting(true);
    setError('');

    try {
      const response = await fetch('/api/reviews', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': user.id,
        },
        body: JSON.stringify({
          tenantId,
          ...formData,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        alert('Review submitted! It will be visible after moderation.');
        onSuccess();
      } else {
        setError(data.error || 'Failed to submit review');
      }
    } catch (err) {
      console.error('Error submitting review:', err);
      setError('Failed to submit review');
    } finally {
      setSubmitting(false);
    }
  };

  const StarRating = ({ value, onChange, label }: { value: number; onChange: (v: number) => void; label: string }) => (
    <div>
      <label className="block text-sm font-medium text-slate-700 mb-2">{label}</label>
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map(rating => (
          <button
            key={rating}
            type="button"
            onClick={() => onChange(rating)}
            className="p-1 hover:scale-110 transition-transform"
          >
            <Star
              className={`w-6 h-6 ${
                rating <= value
                  ? 'fill-yellow-400 text-yellow-400'
                  : 'text-slate-300 hover:text-yellow-300'
              }`}
            />
          </button>
        ))}
        <span className="ml-2 text-sm text-slate-500">{value > 0 ? value.toFixed(1) : 'Select'}</span>
      </div>
    </div>
  );

  return (
    <div className="fixed inset-0 bg-slate-900/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-slate-200">
          <h2 className="text-xl font-semibold text-slate-900">Write a Review</h2>
          <p className="text-sm text-slate-500 mt-1">Share your experience at {companyName}</p>
        </div>

        <div className="p-6 space-y-6">
          {error && (
            <div className="flex items-center gap-2 p-3 bg-red-50 text-red-700 rounded-lg text-sm">
              <AlertCircle className="w-4 h-4" />
              {error}
            </div>
          )}

          {/* Review Type */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Your relationship *</label>
            <div className="flex flex-wrap gap-2">
              {[
                { value: 'employee', label: 'Current Employee' },
                { value: 'former_employee', label: 'Former Employee' },
                { value: 'interviewed', label: 'Interviewed' },
                { value: 'applicant', label: 'Applicant' },
              ].map(option => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => setFormData(prev => ({ ...prev, reviewType: option.value }))}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    formData.reviewType === option.value
                      ? 'bg-blue-600 text-white'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>

          {/* Overall Rating */}
          <StarRating
            value={formData.overallRating}
            onChange={v => setFormData(prev => ({ ...prev, overallRating: v }))}
            label="Overall Rating *"
          />

          {/* Category Ratings */}
          <div className="grid grid-cols-2 gap-4">
            <StarRating
              value={formData.workLifeBalance}
              onChange={v => setFormData(prev => ({ ...prev, workLifeBalance: v }))}
              label="Work-Life Balance"
            />
            <StarRating
              value={formData.compensation}
              onChange={v => setFormData(prev => ({ ...prev, compensation: v }))}
              label="Compensation"
            />
            <StarRating
              value={formData.jobSecurity}
              onChange={v => setFormData(prev => ({ ...prev, jobSecurity: v }))}
              label="Job Security"
            />
            <StarRating
              value={formData.management}
              onChange={v => setFormData(prev => ({ ...prev, management: v }))}
              label="Management"
            />
            <StarRating
              value={formData.culture}
              onChange={v => setFormData(prev => ({ ...prev, culture: v }))}
              label="Culture"
            />
            <StarRating
              value={formData.careerGrowth}
              onChange={v => setFormData(prev => ({ ...prev, careerGrowth: v }))}
              label="Career Growth"
            />
          </div>

          {/* Review Title */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Review Title *</label>
            <input
              type="text"
              value={formData.title}
              onChange={e => setFormData(prev => ({ ...prev, title: e.target.value }))}
              placeholder="Summarize your experience in a headline"
              className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500"
              maxLength={100}
            />
          </div>

          {/* Pros */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Pros *</label>
            <textarea
              value={formData.pros}
              onChange={e => setFormData(prev => ({ ...prev, pros: e.target.value }))}
              placeholder="What are the best things about working here?"
              rows={3}
              className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 resize-none"
            />
          </div>

          {/* Cons */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Cons *</label>
            <textarea
              value={formData.cons}
              onChange={e => setFormData(prev => ({ ...prev, cons: e.target.value }))}
              placeholder="What could be improved?"
              rows={3}
              className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 resize-none"
            />
          </div>

          {/* Advice to Management */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Advice to Management</label>
            <textarea
              value={formData.advice}
              onChange={e => setFormData(prev => ({ ...prev, advice: e.target.value }))}
              placeholder="Any suggestions for company leadership?"
              rows={2}
              className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 resize-none"
            />
          </div>

          {/* Job Details */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Job Title</label>
              <input
                type="text"
                value={formData.jobTitle}
                onChange={e => setFormData(prev => ({ ...prev, jobTitle: e.target.value }))}
                placeholder="e.g., Software Engineer"
                className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Department</label>
              <input
                type="text"
                value={formData.department}
                onChange={e => setFormData(prev => ({ ...prev, department: e.target.value }))}
                placeholder="e.g., Engineering"
                className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Location</label>
              <input
                type="text"
                value={formData.location}
                onChange={e => setFormData(prev => ({ ...prev, location: e.target.value }))}
                placeholder="e.g., Manila"
                className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Years at Company</label>
              <input
                type="number"
                value={formData.yearsAtCompany}
                onChange={e => setFormData(prev => ({ ...prev, yearsAtCompany: e.target.value }))}
                placeholder="e.g., 2"
                min="0"
                className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>

        <div className="p-6 border-t border-slate-200 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-lg"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={submitting}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg disabled:opacity-50"
          >
            {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
            Submit Review
          </button>
        </div>
      </div>
    </div>
  );
}
