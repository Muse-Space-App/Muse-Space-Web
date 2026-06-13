"use client";
import { useRouter, useParams } from 'next/navigation';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import api from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import CommissionChat from '@/components/chat/CommissionChat';

export default function Workspace() {
  const params = useParams();
  const rawOrderId = Array.isArray(params?.id) ? params.id[0] : (params?.id as string);
  const orderId = rawOrderId;
  const router = useRouter();
  const { user, isLoading: authLoading } = useAuth();
  
  const [activeOrders, setActiveOrders] = useState<any[]>([]);
  const [activeOrder, setActiveOrder] = useState<any | null>(null);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    }
  }, [user, authLoading, router]);

  // Fetch active orders
  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const [reqRes, recRes] = await Promise.all([
          api.get('/commissions/requested?pageSize=100'),
          api.get('/commissions/received?pageSize=100')
        ]);
        const reqOrders = reqRes.data?.data?.items || [];
        const recOrders = recRes.data?.data?.items || [];
        const combined = [...reqOrders, ...recOrders];
        setActiveOrders(combined);
        
        if (orderId) {
          const current = combined.find((o: any) => o.id.toString() === orderId);
          if (current) {
            setActiveOrder(current);
          } else if (orderId !== 'request') {
            const specificRes = await api.get(`/commissions/${orderId}`);
            if (specificRes.data?.isSuccess) {
              setActiveOrder(specificRes.data.data);
              if (!combined.find(o => o.id === specificRes.data.data.id)) {
                setActiveOrders([specificRes.data.data, ...combined]);
              }
            }
          }
        }
      } catch (err) {
        console.error('Failed to load orders', err);
      }
    };
    if (user) fetchOrders();
  }, [user, orderId]);

  const handleUpdateStatus = async (status: number) => {
    try {
      await api.patch(`/commissions/${activeOrder.id}/status`, { status });
      setActiveOrder({ ...activeOrder, status });
    } catch (err) {
      console.error('Failed to update status', err);
    }
  };

  const getStatusColor = (status: number) => {
    switch (status) {
      case 0: return 'text-amber-500 bg-amber-500/10 border-amber-500/20';
      case 1: return 'text-blue-500 bg-blue-500/10 border-blue-500/20';
      case 4: return 'text-purple-500 bg-purple-500/10 border-purple-500/20';
      case 5: return 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20';
      default: return 'text-slate-500 bg-slate-500/10 border-slate-500/20';
    }
  };

  const getStatusText = (status: number) => {
    if (status === 4 && activeOrder?.artworkUrl) {
      return "Artwork Delivered (Review Pending)";
    }
    switch (status) {
      case 0: return 'Pending';
      case 1: return 'Accepted';
      case 2: return 'Pending Verification';
      case 3: return 'Rejected';
      case 4: return 'In Progress';
      case 5: return 'Completed';
      case 6: return 'Cancelled';
      default: return 'Unknown';
    }
  };

  if (!activeOrder) return <div className="p-12 text-center text-slate-500">Loading workspace...</div>;

  const isArtist = user?.id === activeOrder.artistId;
  const otherPartyUsername = isArtist ? activeOrder.requesterUsername : activeOrder.artistUsername;
  const otherPartyAvatar = isArtist ? activeOrder.requesterAvatarUrl : activeOrder.artistAvatarUrl;
  const avatarChar = otherPartyUsername ? otherPartyUsername.charAt(0).toUpperCase() : 'U';

  return (
    <div className="h-[calc(100vh-80px)] -mt-8 -mx-4 sm:mx-0 sm:mt-0 flex flex-col md:flex-row overflow-hidden bg-slate-50 dark:bg-[#0B1120] border-t border-slate-200 dark:border-white/5">
      
      {/* LEFT SIDEBAR: Active Orders */}
      <div className="w-full md:w-[20%] border-r border-slate-200 dark:border-white/10 flex flex-col bg-white/50 dark:bg-slate-900/50 backdrop-blur-md z-10 shrink-0">
        <div className="p-6 border-b border-slate-200 dark:border-white/10">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white font-['Space_Grotesk'] flex items-center gap-2">
            <span className="material-symbols-outlined text-indigo-500">list_alt</span>
            Active Orders
          </h2>
        </div>
        
        <div className="overflow-y-auto flex-1 p-4 space-y-2">
          {activeOrders.map(order => (
            <Link
              href={`/commissions/${order.id}`}
              key={order.id}
              className={`block w-full text-left p-4 rounded-2xl transition-all border ${
                activeOrder.id === order.id 
                  ? 'bg-indigo-50 dark:bg-indigo-500/10 border-indigo-200 dark:border-indigo-500/30 shadow-sm' 
                  : 'bg-transparent border-transparent hover:bg-slate-100 dark:hover:bg-slate-800/50'
              }`}
            >
              <div className="flex items-center gap-4">
                  <div className="relative">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold text-lg shrink-0">
                      {(
                        (user?.id === order.artistId
                          ? order.requesterUsername
                          : order.artistUsername) || "U"
                      )
                        .charAt(0)
                        .toUpperCase()}
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-slate-900 dark:text-white truncate">
                      {user?.id === order.artistId
                        ? order.requesterUsername
                        : order.artistUsername}
                    </p>
                    <p className="text-xs text-slate-500 dark:text-slate-400 truncate mb-1">
                      {order.title}
                    </p>
                    <span
                      className={`inline-flex px-2 py-0.5 rounded-md text-[10px] font-bold border ${getStatusColor(order.status)}`}
                    >
                      {getStatusText(order.status)}
                    </span>
                  </div>
                </div>
            </Link>
          ))}
        </div>
      </div>

      {/* CENTER: Chat Area */}
      <div className="flex-1 flex flex-col min-w-0 bg-white/30 dark:bg-slate-950/30 p-4">
        <CommissionChat 
          commissionId={activeOrder.id} 
          mode="fullscreen" 
        />
      </div>

      {/* RIGHT SIDEBAR: Order Details */}
      <div className="w-full md:w-[30%] border-l border-slate-200 dark:border-white/10 flex flex-col bg-white/50 dark:bg-slate-900/50 backdrop-blur-md z-10 shrink-0 overflow-y-auto">
        <div className="p-6 border-b border-slate-200 dark:border-white/10">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white font-['Space_Grotesk'] flex items-center gap-2">
            <span className="material-symbols-outlined text-indigo-500">info</span>
            Order Details
          </h2>
        </div>

        <div className="p-6 space-y-8">
          <div>
            <p className="text-sm text-slate-500 dark:text-slate-400 mb-2 font-medium uppercase tracking-wider">Current Status</p>
            <div className={`p-4 rounded-xl border flex items-center gap-3 ${getStatusColor(activeOrder.status)}`}>
              <span className="font-bold text-lg">{getStatusText(activeOrder.status)}</span>
            </div>
            
            <div className="mt-4 px-2">
              <div className="flex justify-between text-xs font-bold text-slate-400">
                <span
                  className={
                    [0, 1, 4, 5].includes(activeOrder.status)
                      ? "text-indigo-500"
                      : ""
                  }
                >
                  Start
                </span>
                <span
                  className={
                    [4, 5].includes(activeOrder.status) ? "text-indigo-500" : ""
                  }
                >
                  {activeOrder.status === 4 && activeOrder.artworkUrl ? "Delivered" : "Progress"}
                </span>
                <span
                  className={activeOrder.status === 5 ? "text-indigo-500" : ""}
                >
                  Done
                </span>
              </div>
              <div className="w-full bg-slate-200 dark:bg-slate-800 h-1.5 mt-2 rounded-full overflow-hidden">
                <div className={`h-full bg-indigo-500 transition-all duration-1000 ${
                  activeOrder.status === 0 ? 'w-[10%]' : 
                  activeOrder.status === 1 ? 'w-[30%]' : 
                  activeOrder.status === 4 ? 'w-[75%]' : 
                  activeOrder.status === 5 ? 'w-[100%]' : 'w-[50%]'
                }`}></div>
              </div>
            </div>
          </div>

          <div>
            <p className="text-sm text-slate-500 dark:text-slate-400 mb-2 font-medium uppercase tracking-wider">Final Price</p>
            <div className="flex items-end justify-between">
              <span className="text-4xl font-black text-slate-900 dark:text-white">${activeOrder.price}</span>
            </div>
          </div>

          {activeOrder.deadlineUtc && (
            <div>
              <p className="text-sm text-slate-500 dark:text-slate-400 mb-2 font-medium uppercase tracking-wider flex items-center gap-1.5">
                <span className="material-symbols-outlined text-sm">timer</span>
                Deadline
              </p>
              <div className="bg-slate-100 dark:bg-slate-800/50 p-4 rounded-xl border border-slate-200 dark:border-white/5">
                <p className="font-bold text-slate-900 dark:text-white text-lg">{new Date(activeOrder.deadlineUtc).toLocaleDateString()}</p>
              </div>
            </div>
          )}

          <div>
            <p className="text-sm text-slate-500 dark:text-slate-400 mb-2 font-medium uppercase tracking-wider flex items-center gap-1.5">
              <span className="material-symbols-outlined text-sm">description</span>
              Request Details
            </p>
            <div className="bg-slate-100 dark:bg-slate-800/50 p-5 rounded-2xl border border-slate-200 dark:border-white/5 space-y-4">
              <div>
                <h4 className="font-bold text-slate-900 dark:text-white">{activeOrder.title}</h4>
                <p className="text-sm text-slate-600 dark:text-slate-300 mt-2 leading-relaxed whitespace-pre-wrap">{activeOrder.description}</p>
              </div>
            </div>
          </div>

          <div className="border-t border-slate-200 dark:border-white/10 pt-8">
            <h3 className="font-bold text-slate-900 dark:text-white mb-4">Quick Actions</h3>
            <div className="space-y-3">
              {/* Status 0: Pending Request */}
              {activeOrder.status === 0 && (
                <>
                  {isArtist && (
                    <button 
                      onClick={() => handleUpdateStatus(1)} 
                      className="w-full px-4 py-3 bg-indigo-600 dark:bg-white dark:text-slate-900 dark:shadow-none text-white font-bold rounded-xl hover:bg-indigo-700 dark:hover:bg-slate-200 transition-colors shadow-lg shadow-indigo-500/20"
                    >
                      Accept Order
                    </button>
                  )}
                  <button 
                    onClick={() => handleUpdateStatus(3)} 
                    className="w-full px-4 py-3 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 font-bold rounded-xl hover:bg-red-200 dark:hover:bg-red-900/50 transition-colors"
                  >
                    Reject Request
                  </button>
                </>
              )}

              {/* Status 1: Accepted / Unpaid */}
              {activeOrder.status === 1 && (
                <>
                  {!isArtist ? (
                    <Link
                      href={`/commissions/payment/${activeOrder.id}`}
                      className="w-full py-4 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white rounded-xl font-bold shadow-[0_0_20px_rgba(79,70,229,0.3)] transition-all flex items-center justify-center gap-2 hover:scale-[1.02]"
                    >
                      <span className="material-symbols-outlined">payments</span>
                      Pay Now (${activeOrder.price})
                    </Link>
                  ) : (
                    <button 
                      disabled 
                      className="w-full py-4 bg-slate-800/50 text-slate-400 border border-white/5 rounded-xl font-bold flex items-center justify-center gap-2 cursor-not-allowed"
                    >
                      <span className="material-symbols-outlined">hourglass_empty</span>
                      Awaiting Customer Payment
                    </button>
                  )}
                </>
              )}

              {/* Status 2: Paid / Pending Verification */}
              {activeOrder.status === 2 && (
                <>
                  {isArtist ? (
                    <button
                      onClick={async () => {
                        try {
                          await api.post(`/payments/${activeOrder.id}/verify`);
                          setActiveOrder({ ...activeOrder, status: 4 });
                        } catch (err) {
                          console.error("Failed to verify payment", err);
                        }
                      }}
                      className="w-full py-4 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white rounded-xl font-bold shadow-[0_0_20px_rgba(16,185,129,0.4)] transition-all flex items-center justify-center gap-2 hover:scale-[1.02]"
                    >
                      <span className="material-symbols-outlined">verified</span>
                      Verify Payment Received
                    </button>
                  ) : (
                    <Link
                      href={`/commissions/payment/${activeOrder.id}`}
                      className="w-full py-4 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white rounded-xl font-bold shadow-[0_0_20px_rgba(79,70,229,0.3)] transition-all flex items-center justify-center gap-2 hover:scale-[1.02]"
                    >
                      <span className="material-symbols-outlined">payments</span>
                      Payment Pending Verification
                    </Link>
                  )}
                </>
              )}

              {/* Status 4: In Progress / Delivering */}
              {activeOrder.status === 4 && (
                <>
                  {isArtist ? (
                    <Link
                      href={`/commissions/delivery/${activeOrder.id}`}
                      className="w-full py-4 bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-500 hover:to-fuchsia-500 text-white rounded-xl font-bold shadow-[0_0_20px_rgba(139,92,246,0.4)] transition-all flex items-center justify-center gap-2 hover:scale-[1.02]"
                    >
                      <span className="material-symbols-outlined">inventory_2</span>
                      {activeOrder.artworkUrl ? "View Delivery" : "Deliver Artwork"}
                    </Link>
                  ) : (
                    <>
                      {activeOrder.artworkUrl ? (
                        <Link
                          href={`/commissions/delivery/${activeOrder.id}`}
                          className="w-full py-4 bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-500 hover:to-fuchsia-500 text-white rounded-xl font-bold shadow-[0_0_20px_rgba(139,92,246,0.4)] transition-all flex items-center justify-center gap-2 hover:scale-[1.02]"
                        >
                          <span className="material-symbols-outlined">visibility</span>
                          Review & Accept Artwork
                        </Link>
                      ) : (
                        <button 
                          disabled
                          className="w-full py-4 bg-slate-800/50 text-slate-400 border border-white/5 rounded-xl font-bold flex items-center justify-center gap-2 cursor-not-allowed"
                        >
                          <span className="material-symbols-outlined">hourglass_empty</span>
                          Artwork In Progress
                        </button>
                      )}
                    </>
                  )}
                </>
              )}

              {/* Status 5: Completed */}
              {activeOrder.status === 5 && (
                <Link
                  href={`/commissions/delivery/${activeOrder.id}`}
                  className="w-full py-4 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white rounded-xl font-bold shadow-[0_0_20px_rgba(16,185,129,0.4)] transition-all flex items-center justify-center gap-2 hover:scale-[1.02]"
                >
                  <span className="material-symbols-outlined">download</span>
                  {isArtist ? "View Final Delivery" : "Download Artwork"}
                </Link>
              )}

              {/* Status 3, 6, etc. (Rejected / Cancelled) */}
              {![0, 1, 2, 4, 5].includes(activeOrder.status) && (
                <button className="w-full py-4 bg-slate-200 dark:bg-white/5 text-slate-400 dark:text-slate-500 rounded-xl font-bold cursor-not-allowed flex items-center justify-center gap-2">
                  <span className="material-symbols-outlined">lock</span>
                  No Action Required
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
