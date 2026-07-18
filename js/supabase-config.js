// Configure aqui sua instância Supabase. Exemplo:
// const SUPABASE_URL = 'https://xyzabc.supabase.co';
// const SUPABASE_ANON_KEY = 'public-anon-key';

// Deixe vazios ou remova o arquivo para usar apenas localStorage.
const SUPABASE_URL = 'https://jridwzxtozmqumhnlpnl.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpyaWR3enh0b3ptcXVtaG5scG5sIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODQwNzg3MjYsImV4cCI6MjA5OTY1NDcyNn0.KvvaIKG3laEt7YlcZ-ByrL-Io68QkPnmBx9nk_NAOCs';

const SUPABASE_CLIENT = typeof supabase !== 'undefined' && SUPABASE_URL && SUPABASE_ANON_KEY
    ? supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY)
    : null;

// Observação: para permitir inserção/remoção via REST, configure políticas RLS
// ou use chaves apropriadas. Evite expor chaves sensíveis em produção.
