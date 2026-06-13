"use client";
import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import api from '@/lib/api';
import { useAuth } from '@/context/AuthContext';

export default function DeliveryPage() {
  const params = useParams();
  const orderId = Array.isArray(params?.id) ? params.id[0] : (params?.id as string);
  const router = useRouter();
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();

  const [orderDetails, setOrderDetails] = useState<any>(null);
  const [pageLoading, setPageLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [isCompleted, setIsCompleted] = useState(false);
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [feedback, setFeedback] = useState('');
  const [isFeedbackSubmitted, setIsFeedbackSubmitted] = useState(false);

  // Artist Upload States
  const [file, setFile] = useState<File | null>(null);
  const [uploadPreview, setUploadPreview] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  const fetchOrder = async () => {
    try {
      setPageLoading(true);
      const res = await api.get(`/commissions/${orderId}`);
      if (res.data?.isSuccess) {
        setOrderDetails(res.data.data);
        if (res.data.data.status === 5) {
          setIsCompleted(true);
        }
      } else {
        setError(res.data?.message || "Failed to load order details.");
      }
    } catch (err: any) {
      setError(err.response?.data?.message || "An error occurred while fetching order details.");
      console.error(err);
    } finally {
      setPageLoading(false);
    }
  };

  useEffect(() => {
    if (orderId) {
      fetchOrder();
    }
  }, [orderId]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      setUploadPreview(URL.createObjectURL(selectedFile));
    }
  };

  const handleUploadAndDeliver = async () => {
    if (!file) return;
    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);

      // 1. Upload file to media API
      const uploadRes = await api.post('/media/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      if (uploadRes.data?.isSuccess) {
        const artworkUrl = uploadRes.data.data.url;
        
        // 2. Patch status and artworkUrl in database
        const statusRes = await api.patch(`/commissions/${orderId}/status`, {
          status: 4, // Keep InProgress but update ArtworkUrl (representing Delivered)
          artworkUrl: artworkUrl
        });

        if (statusRes.data?.isSuccess) {
          setOrderDetails(statusRes.data.data);
          setFile(null);
          setUploadPreview(null);
          alert("Artwork delivered successfully!");
        } else {
          alert("Failed to deliver artwork: " + (statusRes.data?.message || "Unknown error"));
        }
      } else {
        alert("Failed to upload image: " + (uploadRes.data?.message || "Unknown error"));
      }
    } catch (err: any) {
      alert("Error delivering artwork: " + (err.response?.data?.message || err.message));
      console.error(err);
    } finally {
      setIsUploading(false);
    }
  };

  const handleCompleteOrder = async () => {
    try {
      const res = await api.patch(`/commissions/${orderId}/status`, { status: 5 }); // 5 = Completed
      if (res.data?.isSuccess) {
        setIsCompleted(true);
        setOrderDetails(res.data.data);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleSubmitFeedback = (e: React.FormEvent) => {
    e.preventDefault();
    if (rating === 0) {
      alert("Please select a rating before submitting.");
      return;
    }
    setIsFeedbackSubmitted(true);
    alert("Thank you for your feedback!");
    router.push('/dashboard');
  };

  const handleDownload = async () => {
    if (!orderDetails?.artworkUrl) return;
    try {
      const response = await fetch(orderDetails.artworkUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `commission-artwork-${orderId}.jpg`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err) {
      console.error("Failed direct blob download. Opening in new window.", err);
      window.open(orderDetails.artworkUrl, '_blank');
    }
  };

  if (authLoading || pageLoading) {
    return (
      <div className="min-h-screen bg-[#0B0A10] flex items-center justify-center text-slate-200">
        <div className="flex flex-col items-center gap-4">
          <span className="material-symbols-outlined animate-spin text-4xl text-violet-500">refresh</span>
          <p className="text-lg font-medium font-['Space_Grotesk']">Loading order details...</p>
        </div>
      </div>
    );
  }

  if (error || !orderDetails) {
    return (
      <div className="min-h-screen bg-[#0B0A10] flex items-center justify-center text-slate-200">
        <div className="text-center space-y-6 max-w-md p-6 bg-slate-900/40 border border-violet-500/20 rounded-3xl backdrop-blur-xl">
          <span className="material-symbols-outlined text-red-500 text-6xl">error</span>
          <h2 className="text-2xl font-bold font-['Space_Grotesk']">Error Loading Page</h2>
          <p className="text-slate-400 font-['Space_Grotesk']">{error || "Order details could not be loaded."}</p>
          <button onClick={() => router.back()} className="px-6 py-3 bg-violet-600 hover:bg-violet-500 transition-colors rounded-xl font-bold font-['Space_Grotesk']">
            Return to Dashboard
          </button>
        </div>
      </div>
    );
  }

  const isArtist = !!(user && user.id === orderDetails.artistId);
  const isCustomer = !!(user && user.id === orderDetails.requesterId);
  const hasArtwork = !!orderDetails.artworkUrl;

  // Timeline Progress Config
  const getTimelineSteps = () => {
    const isCompletedVal = orderDetails.status === 5;
    const isPaid = orderDetails.status >= 2 && orderDetails.status !== 3; // 2=PendingVerification, 4=InProgress, 5=Completed
    const isDeliveredVal = !!orderDetails.artworkUrl;

    if (isArtist) {
      return [
        { label: 'New Order', isCompleted: true },
        { label: 'Accepted', isCompleted: orderDetails.status >= 1 && orderDetails.status !== 3 },
        { label: 'In Progress', isCompleted: orderDetails.status >= 4 },
        { label: 'Image Delivered', isCompleted: isDeliveredVal },
        { label: 'Earnings Released', isCompleted: isCompletedVal }
      ];
    } else {
      // Customer View
      return [
        { label: 'Order Placed', isCompleted: isPaid },
        { label: 'In Progress', isCompleted: orderDetails.status >= 4 },
        { label: 'Delivered (Preview)', isCompleted: isDeliveredVal },
        { label: 'Completed', isCompleted: isCompletedVal }
      ];
    }
  };

  return (
    <div className="min-h-screen bg-[#0B0A10] relative overflow-hidden flex flex-col items-center py-12 px-4 font-['Space_Grotesk'] text-slate-200">
      {/* Background Ambience */}
      <div className="absolute top-[-20%] left-[20%] w-[800px] h-[800px] bg-violet-600/10 rounded-full blur-[150px] pointer-events-none"></div>
      
      <button onClick={() => router.back()} className="self-start md:ml-12 mb-8 flex items-center gap-2 text-violet-400 hover:text-violet-300 transition-colors z-10 relative group">
        <span className="material-symbols-outlined group-hover:-translate-x-1 transition-transform">arrow_back</span>
        <span className="font-bold tracking-widest uppercase text-sm">Return to Workspace</span>
      </button>

      <div className="w-full max-w-5xl z-10 relative space-y-8 animate-[fadeIn_0.5s_ease-out]">
        {/* Header */}
        <div className="text-center mb-6">
          <h1 className="text-4xl md:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-violet-400 to-fuchsia-500 mb-4 tracking-tight">
            Final Delivery
          </h1>
          <p className="text-slate-400 text-lg">
            Commission: <span className="text-white font-bold">{orderDetails.title}</span>
          </p>
          <p className="text-slate-500 text-sm mt-1">
            Artist: <span className="text-slate-300 font-medium">{orderDetails.artistUsername}</span> | Client: <span className="text-slate-300 font-medium">{orderDetails.requesterUsername}</span>
          </p>
        </div>

        {/* Step Progress Timeline */}
        <div className="w-full max-w-3xl mx-auto bg-slate-900/30 backdrop-blur-xl border border-violet-500/10 rounded-2xl p-6 mb-8">
          <div className="flex items-center justify-between relative">
            {/* Connecting Progress Line */}
            <div className="absolute left-0 right-0 top-1/2 -translate-y-1/2 h-1 bg-slate-800 rounded-full z-0">
              <div 
                className="h-full bg-gradient-to-r from-violet-500 to-fuchsia-500 rounded-full transition-all duration-1000"
                style={{ 
                  width: `${
                    (() => {
                      const steps = getTimelineSteps();
                      const completedCount = steps.filter(s => s.isCompleted).length;
                      if (completedCount <= 1) return 0;
                      return ((completedCount - 1) / (steps.length - 1)) * 100;
                    })()
                  }%` 
                }}
              />
            </div>

            {/* Steps Nodes */}
            {getTimelineSteps().map((step, index) => (
              <div key={index} className="flex flex-col items-center z-10 relative">
                {/* Node Dot */}
                <div 
                  className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs transition-all duration-500 ${
                    step.isCompleted 
                      ? 'bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white shadow-[0_0_15px_rgba(139,92,246,0.5)] scale-110' 
                      : 'bg-slate-800 text-slate-500 border border-white/5'
                  }`}
                >
                  {step.isCompleted ? (
                    <span className="material-symbols-outlined text-[16px] font-black">check</span>
                  ) : (
                    index + 1
                  )}
                </div>
                {/* Label */}
                <span 
                  className={`text-[9px] sm:text-xs font-bold mt-2 uppercase tracking-wider transition-colors duration-500 ${
                    step.isCompleted ? 'text-violet-300' : 'text-slate-500'
                  }`}
                >
                  {step.label}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* ARTWORK PRESENT STATE */}
        {hasArtwork ? (
          <>
            <div className="bg-slate-900/40 backdrop-blur-xl border border-violet-500/20 rounded-3xl p-4 md:p-8 shadow-[0_0_50px_rgba(139,92,246,0.1)] transition-all duration-500">
              <div className="relative rounded-2xl overflow-hidden group border border-white/5 bg-black/50">
                <img 
                  src={orderDetails.artworkUrl} 
                  alt="Final Delivery Preview" 
                  className={`w-full h-auto max-h-[600px] object-contain mx-auto transition-all duration-1000 ${isCompleted ? 'brightness-100' : 'brightness-75'}`}
                />
                
                {/* Watermark Overlay (Only visible if not completed and viewer is the Customer) */}
                {!isCompleted && isCustomer && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/20 backdrop-blur-[2px] select-none pointer-events-none">
                    <div className="transform -rotate-12 opacity-30 pointer-events-none">
                      <h2 className="text-6xl md:text-8xl font-black text-white tracking-widest uppercase outline-text">
                        PREVIEW ONLY
                      </h2>
                    </div>
                  </div>
                )}
              </div>

              {/* Action Buttons Below Image */}
              <div className="mt-8 flex flex-col md:flex-row gap-6 items-center justify-between">
                <div className="flex-1">
                  {!isCompleted ? (
                    isCustomer ? (
                      <div className="bg-violet-500/10 border border-violet-500/20 p-4 rounded-xl flex items-start gap-3">
                        <span className="material-symbols-outlined text-violet-400">info</span>
                        <p className="text-sm text-violet-200/80 leading-relaxed">
                          Please review the final artwork. If it meets your expectations, complete the order to release funds from escrow and unlock the high-resolution files without watermarks.
                        </p>
                      </div>
                    ) : (
                      <div className="bg-amber-500/10 border border-amber-500/20 p-4 rounded-xl flex items-start gap-3">
                        <span className="material-symbols-outlined text-amber-400">schedule</span>
                        <p className="text-sm text-amber-200/80 leading-relaxed">
                          Your artwork has been submitted. Waiting for the client to review and complete the order.
                        </p>
                      </div>
                    )
                  ) : (
                    <div className="bg-emerald-500/10 border border-emerald-500/20 p-4 rounded-xl flex items-start gap-3">
                      <span className="material-symbols-outlined text-emerald-400">check_circle</span>
                      <p className="text-sm text-emerald-200/80 leading-relaxed">
                        Order completed! Funds have been released to the artist. High-resolution files are now unlocked.
                      </p>
                    </div>
                  )}
                </div>

                <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto shrink-0">
                  {/* Customer action to approve order */}
                  {!isCompleted && isCustomer && (
                    <button 
                      onClick={handleCompleteOrder}
                      className="px-8 py-4 bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-500 hover:to-fuchsia-500 text-white rounded-xl font-bold tracking-widest uppercase shadow-[0_0_30px_rgba(139,92,246,0.4)] hover:shadow-[0_0_40px_rgba(139,92,246,0.6)] hover:-translate-y-1 transition-all duration-300 flex items-center justify-center gap-2"
                    >
                      <span className="material-symbols-outlined">task_alt</span>
                      Complete Order
                    </button>
                  )}
                  
                  {/* Download button, unlocked for both customer (once completed) and artist */}
                  <button 
                    onClick={handleDownload}
                    disabled={!isCompleted && isCustomer}
                    className={`px-8 py-4 rounded-xl font-bold tracking-widest uppercase transition-all duration-300 flex items-center justify-center gap-2 ${
                      (isCompleted || isArtist)
                        ? 'bg-slate-100 hover:bg-white text-slate-900 shadow-[0_0_20px_rgba(255,255,255,0.2)] hover:-translate-y-1' 
                        : 'bg-slate-800/50 text-slate-500 cursor-not-allowed border border-white/5'
                    }`}
                  >
                    <span className="material-symbols-outlined">{(isCompleted || isArtist) ? 'download' : 'lock'}</span>
                    Download High-Res
                  </button>
                </div>
              </div>
            </div>

            {/* Client Feedback Section (Animated visibility for customer) */}
            {isCustomer && (
              <div className={`transition-all duration-1000 ease-out overflow-hidden ${isCompleted && !isFeedbackSubmitted ? 'opacity-100 max-h-[800px] transform translate-y-0 mt-8' : 'opacity-0 max-h-0 transform translate-y-10'}`}>
                <div className="bg-slate-900/60 backdrop-blur-xl border border-violet-500/30 rounded-3xl p-8 shadow-2xl relative">
                  <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
                    <span className="material-symbols-outlined text-violet-400">rate_review</span>
                    Client Feedback
                  </h2>
                  
                  <form onSubmit={handleSubmitFeedback} className="space-y-6">
                    {/* Star Rating */}
                    <div>
                      <p className="text-slate-400 mb-3 text-sm font-medium uppercase tracking-wider">Rate the Artist</p>
                      <div className="flex gap-2">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <button
                            key={star}
                            type="button"
                            onMouseEnter={() => setHoverRating(star)}
                            onMouseLeave={() => setHoverRating(0)}
                            onClick={() => setRating(star)}
                            className="transition-transform hover:scale-110 focus:outline-none"
                          >
                            <span className={`material-symbols-outlined text-4xl transition-all duration-300 ${
                              star <= (hoverRating || rating) 
                                ? 'text-yellow-400 drop-shadow-[0_0_15px_rgba(250,204,21,0.6)] fill-current icon-filled' 
                                : 'text-slate-600'
                            }`}>
                              star
                            </span>
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Testimonial Text Area */}
                    <div>
                      <p className="text-slate-400 mb-3 text-sm font-medium uppercase tracking-wider">Leave a Testimonial</p>
                      <textarea 
                        value={feedback}
                        onChange={(e) => setFeedback(e.target.value)}
                        placeholder="How was your experience working with the artist? Did you love the final result?"
                        rows={4}
                        className="w-full bg-black/40 border border-white/10 rounded-xl p-4 text-white placeholder-slate-600 focus:outline-none focus:border-violet-500/50 focus:ring-1 focus:ring-violet-500/50 transition-all resize-none"
                      ></textarea>
                    </div>

                    {/* Submit Button */}
                    <div className="flex justify-end pt-4">
                      <button 
                        type="submit"
                        className="px-8 py-3 bg-violet-600/20 hover:bg-violet-600/40 text-violet-300 hover:text-white border border-violet-500/50 rounded-xl font-bold transition-all flex items-center gap-2"
                      >
                        <span className="material-symbols-outlined text-sm">send</span>
                        Submit Review
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}
          </>
        ) : (
          /* ARTWORK NOT YET UPLOADED STATE */
          <div className="bg-slate-900/40 backdrop-blur-xl border border-violet-500/20 rounded-3xl p-8 md:p-12 shadow-[0_0_50px_rgba(139,92,246,0.05)] text-center transition-all">
            {isArtist ? (
              /* Artist upload view */
              <div className="space-y-6 max-w-2xl mx-auto">
                <span className="material-symbols-outlined text-violet-400 text-6xl animate-bounce">cloud_upload</span>
                <div>
                  <h2 className="text-2xl font-bold text-white mb-2">Deliver Artwork</h2>
                  <p className="text-slate-400 text-sm">
                    Upload and deliver the final artwork file for the client to review. A watermarked version will be shown to the client until they complete the order.
                  </p>
                </div>

                <div className="mt-8">
                  <label className="block border-2 border-dashed border-violet-500/30 rounded-2xl overflow-hidden text-center hover:border-violet-500 hover:bg-violet-500/5 transition-all cursor-pointer relative group p-6">
                    <input 
                      type="file" 
                      accept="image/*" 
                      className="hidden" 
                      onChange={handleImageChange} 
                      disabled={isUploading}
                    />
                    
                    {uploadPreview ? (
                      <div className="relative aspect-video w-full max-h-[350px] bg-black/40 flex items-center justify-center rounded-xl overflow-hidden">
                        <img src={uploadPreview} alt="Delivery Preview" className="absolute inset-0 w-full h-full object-contain" />
                        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                          <p className="text-white font-bold flex items-center gap-2">
                            <span className="material-symbols-outlined">edit</span> Change Image
                          </p>
                        </div>
                      </div>
                    ) : (
                      <div className="py-8">
                        <span className="material-symbols-outlined text-5xl text-violet-500 mb-4 block group-hover:-translate-y-1 transition-transform">upload_file</span>
                        <p className="text-slate-300 font-medium">Click to select high-resolution artwork</p>
                        <p className="text-slate-500 text-xs mt-1">PNG, JPG or JPEG (Recommended minimum 3000px resolution)</p>
                      </div>
                    )}
                  </label>
                </div>

                <div className="pt-6 flex justify-center">
                  <button 
                    onClick={handleUploadAndDeliver}
                    disabled={isUploading || !file}
                    className="px-8 py-4 bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-500 hover:to-fuchsia-500 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-xl font-bold tracking-widest uppercase shadow-[0_0_30px_rgba(139,92,246,0.3)] disabled:shadow-none hover:-translate-y-0.5 transition-all flex items-center gap-2"
                  >
                    {isUploading && <span className="material-symbols-outlined animate-spin">refresh</span>}
                    {isUploading ? 'Uploading and Delivering...' : 'Upload & Deliver Artwork'}
                  </button>
                </div>
              </div>
            ) : (
              /* Customer waiting view */
              <div className="py-12 space-y-6 max-w-md mx-auto">
                <span className="material-symbols-outlined text-violet-500/40 text-7xl animate-pulse">hourglass_empty</span>
                <div className="space-y-2">
                  <h2 className="text-2xl font-bold text-white">Artwork is in Progress</h2>
                  <p className="text-slate-400 text-sm leading-relaxed">
                    The artist is currently polishing the final delivery. You will receive a notification and see the preview upload here once it's delivered!
                  </p>
                </div>
                <div className="pt-4">
                  <button 
                    onClick={fetchOrder} 
                    className="px-6 py-2.5 bg-slate-800 hover:bg-slate-700 border border-white/5 hover:border-violet-500/20 text-slate-300 rounded-xl transition-all flex items-center gap-2 mx-auto"
                  >
                    <span className="material-symbols-outlined text-sm">refresh</span>
                    Check Status
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

      </div>
    </div>
  );
}
