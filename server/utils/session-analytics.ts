import { supabase, isSupabaseConfigured } from "../supabase";

/**
 * Phase 2: Ghosting Analysis Helper
 * Called when a session ends to analyze why the user stopped
 */
export async function trackSessionEndedWithGhosting(
  sessionId: string,
  userId: string,
  terminationReason: 'user_closed' | 'timeout' | 'error' | 'paywall' = 'user_closed'
) {
  if (!isSupabaseConfigured) return;

  try {
    // Get the last AI message in this session
    const { data: lastAiMessage } = await supabase
      .from('messages')
      .select('text, created_at')
      .eq('session_id', sessionId)
      .eq('role', 'ai')
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    const lastAiMessageText = lastAiMessage?.text || '';
    const lastAiMessageTime = lastAiMessage?.created_at || null;

    // Calculate time since last AI message (if available)
    let timeSinceLastAi = null;
    if (lastAiMessageTime) {
      const now = new Date();
      const lastAi = new Date(lastAiMessageTime);
      timeSinceLastAi = Math.floor((now.getTime() - lastAi.getTime()) / 1000); // seconds
    }

    // Track session_ended event with ghosting analysis
    await supabase.from('user_events').insert({
      user_id: userId,
      session_id: sessionId,
      event_name: 'session_ended',
      event_type: 'track',
      event_properties: {
        termination_reason: terminationReason,
        last_ai_message_text: lastAiMessageText.substring(0, 500), // First 500 chars
        last_ai_message_time: lastAiMessageTime,
        time_since_last_ai_sec: timeSinceLastAi,
        has_ai_response: !!lastAiMessageText
      },
      path: '/chat',
      created_at: new Date().toISOString()
    });
  } catch (error) {
    console.error('[Session Analytics] Error tracking session_ended:', error);
    // Don't throw - analytics should not break the app
  }
}

