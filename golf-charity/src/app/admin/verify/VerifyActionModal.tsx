'use client';

import { useState } from 'react';
import { CheckCircle, FileWarning } from 'lucide-react';
import { approveWinning, rejectWinning, markPaid } from './actions';

export default function VerifyActionModal({ winning }: { winning: any }) {
  const [isOpen, setIsOpen] = useState(false);
  const [isPending, setIsPending] = useState(false);

  const handleApprove = async () => {
    setIsPending(true);
    await approveWinning(winning.id);
    setIsPending(false);
    setIsOpen(false);
  };

  const handleReject = async () => {
    setIsPending(true);
    await rejectWinning(winning.id);
    setIsPending(false);
    setIsOpen(false);
  };

  const handleMarkPaid = async () => {
    setIsPending(true);
    await markPaid(winning.id);
    setIsPending(false);
  };

  return (
    <>
      {winning.payout_status === 'pending_review' && (
        <button
          onClick={() => setIsOpen(true)}
          className="text-xs px-3 py-1 bg-primary text-primary-foreground rounded hover:bg-primary/90 transition-colors"
        >
          Review Proof
        </button>
      )}

      {winning.payout_status === 'approved' && (
        <button
          onClick={handleMarkPaid}
          disabled={isPending}
          className="text-xs px-3 py-1 bg-primary text-primary-foreground rounded hover:bg-primary/90 transition-colors flex items-center gap-1 ml-auto"
        >
          <CheckCircle className="h-3 w-3" /> Mark Paid
        </button>
      )}

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 animate-in fade-in duration-200">
          <div className="bg-background rounded-xl shadow-lg p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-border">
            <h2 className="text-xl font-bold mb-4">
              Review Proof
            </h2>
            <div className="text-sm text-muted-foreground mb-4">
              Player: {winning.profiles?.full_name || 'N/A'} ({winning.profiles?.email})<br/>
              Prize amount: ${winning.prize_amount}
            </div>

            {winning.proof_image_url ? (
              <div className="mb-6 border rounded-lg overflow-hidden bg-muted/20 flex items-center justify-center min-h-[200px]">
                <img
                  src={winning.proof_image_url}
                  alt="Winner Proof"
                  className="max-w-full h-auto object-contain max-h-[60vh]"
                />
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center p-12 text-muted-foreground border border-dashed rounded-lg mb-6">
                <FileWarning className="h-8 w-8 mb-2 opacity-50" />
                <p>No proof file attached.</p>
              </div>
            )}

            <div className="flex justify-end gap-3 pt-4 border-t border-border/50">
              <button
                onClick={() => setIsOpen(false)}
                disabled={isPending}
                className="px-4 py-2 text-sm bg-muted text-foreground rounded-lg hover:bg-muted/80 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleReject}
                disabled={isPending}
                className="px-4 py-2 text-sm bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors disabled:opacity-50"
              >
                Reject Proof
              </button>
              <button
                onClick={handleApprove}
                disabled={isPending}
                className="px-4 py-2 text-sm bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors disabled:opacity-50"
              >
                Approve Proof
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
