'use server';

import { supabaseAdmin } from '@/lib/supabase/admin';
import { sendEmail } from '@/lib/email';
import { revalidatePath } from 'next/cache';

export async function approveWinning(winningId: string) {
  const { data: win } = await supabaseAdmin
    .from('winnings')
    .update({ payout_status: 'approved' })
    .eq('id', winningId)
    .select('profiles(email)')
    .single();

  if (win?.profiles && (win.profiles as any).email) {
    await sendEmail({
      to: (win.profiles as any).email,
      subject: 'Winnings Proof Approved',
      html: '<p>Your proof of winnings has been verified and approved. Your payout is being processed.</p>',
    });
  }
  revalidatePath('/admin/verify');
}

export async function rejectWinning(winningId: string) {
  const { data: win } = await supabaseAdmin
    .from('winnings')
    .update({ payout_status: 'rejected' })
    .eq('id', winningId)
    .select('profiles(email)')
    .single();

  if (win?.profiles && (win.profiles as any).email) {
    await sendEmail({
      to: (win.profiles as any).email,
      subject: 'Winnings Proof Rejected',
      html: '<p>Unfortunately, your proof of winnings has been rejected. Please contact support or upload valid proof.</p>',
    });
  }
  revalidatePath('/admin/verify');
}

export async function markPaid(winningId: string) {
  const { data: win } = await supabaseAdmin
    .from('winnings')
    .update({ payout_status: 'paid' })
    .eq('id', winningId)
    .select('profiles(email), prize_amount')
    .single();

  if (win?.profiles && (win.profiles as any).email) {
    await sendEmail({
      to: (win.profiles as any).email,
      subject: 'Your Payout has been sent!',
      html: `<p>Good news! Your prize payout of $${win.prize_amount} has been successfully sent to you. Enjoy your winnings!</p>`,
    });
  }
  revalidatePath('/admin/verify');
}
