import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://rhkgczfhrdvobxjibwid.supabase.co';
const supabaseAnonKey = 'sb_publishable_I4l7z60qDNrsr2Wiu8rOMQ_TUaGTuGZ';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
