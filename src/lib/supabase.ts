import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://placeholder.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'placeholder-key';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

/**
 * Realiza um ping leve no banco de dados para evitar a hibernação do plano gratuito do Supabase.
 * Para garantir que o banco nunca hiberne (mesmo sem acessos do usuário), recomenda-se configurar
 * um gatilho externo (ex: GitHub Actions rodando uma tarefa cron ou um serviço de ping de URL como UptimeRobot
 * apontando para a API REST do Supabase).
 */
export async function pingDatabase(): Promise<boolean> {
  try {
    const { error } = await supabase.from('profiles').select('id').limit(1);
    if (error && error.code !== 'PGRST116') {
      // PGRST116 significa registro não encontrado, o que valida que o banco respondeu
      console.warn('[Supabase Keep-Alive] Resposta com aviso:', error.message);
      return false;
    }
    console.log('[Supabase Keep-Alive] Banco de dados respondendo corretamente.');
    return true;
  } catch (err) {
    console.error('[Supabase Keep-Alive] Falha ao tentar conectar ao banco:', err);
    return false;
  }
}
